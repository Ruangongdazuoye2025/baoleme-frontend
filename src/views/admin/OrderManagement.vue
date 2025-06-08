<template>
  <n-card title="订单管理" :bordered="false">
    <n-space vertical>
      <n-select
        v-model:value="filterStatus"
        :options="statusOptions"
        placeholder="按状态筛选"
        clearable
        style="width: 200px"
        @update:value="handleFilterChange"
      />
      <n-data-table
        :columns="columns"
        :data="orders"
        :loading="loading"
        :pagination="pagination"
        :remote="true"
        @update:page="handlePageChange"
      />
    </n-space>
    <n-modal v-model:show="showDetailsModal">
        <n-card style="width: 800px" :title="`订单详情 - ${selectedOrder?.id}`" :bordered="false" size="huge" role="dialog" aria-modal="true">
            <n-descriptions v-if="selectedOrder" label-placement="left" bordered :column="2">
                <n-description-item label="状态"><n-tag :type="getStatusTagType(selectedOrder.status)">{{ getStatusText(selectedOrder.status) }}</n-tag></n-description-item>
                <n-description-item label="总金额">{{ (selectedOrder.total / 100).toFixed(2) }} 元</n-description-item>
                <n-description-item label="顾客ID">{{ selectedOrder.customer }}</n-description-item>
                <n-description-item label="店铺ID">{{ selectedOrder.shop }}</n-description-item>
                <n-description-item label="骑手ID">{{ selectedOrder.rider || '暂无' }}</n-description-item>
                <n-description-item label="创建时间">{{ new Date(selectedOrder.createdAt).toLocaleString() }}</n-description-item>
                <n-description-item label="顾客地址" :span="2">{{ selectedOrder.customerAddress.name }}, {{ selectedOrder.customerAddress.tel }}, {{ selectedOrder.customerAddress.city }}{{ selectedOrder.customerAddress.address }}</n-description-item>
                <n-description-item label="店铺地址" :span="2">{{ selectedOrder.shopAddress.name }}, {{ selectedOrder.shopAddress.tel }}, {{ selectedOrder.shopAddress.city }}{{ selectedOrder.shopAddress.address }}</n-description-item>
                <n-description-item label="商品列表" :span="2">
                    <n-list>
                        <n-list-item v-for="(item, index) in selectedOrder.items" :key="item.id || index">
                            {{ item.name }} x {{ item.quantity }} ({{ (item.price / 100).toFixed(2) }} 元)
                        </n-list-item>
                    </n-list>
                </n-description-item>
            </n-descriptions>
        </n-card>
    </n-modal>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h } from 'vue';
import { NButton, NSpace, NTag, NPopconfirm, NSelect, NModal, NCard, NDescriptions, NDescriptionsItem, NList, NListItem, useMessage } from 'naive-ui';
import { getOrdersForAdmin, getOrderDetailForAdmin, deleteCanceledOrderForAdmin, OrderStatus, type AdminOrder } from '@/api/admin';
import type { DataTableColumns, PaginationProps } from 'naive-ui';

// --- State ---
const orders = ref<AdminOrder[]>([]);
const loading = ref(true);
const message = useMessage();
const filterStatus = ref<OrderStatus | null>(null);
const pagination = ref<PaginationProps>({ page: 0, pageSize: 10, itemCount: 0 });
const showDetailsModal = ref(false);
const selectedOrder = ref<AdminOrder | null>(null);

// --- Options & Helpers ---
const statusOptions = Object.values(OrderStatus).map(s => ({ label: getStatusText(s), value: s }));

function getStatusText(status: OrderStatus) {
    const map = {
        [OrderStatus.Unpaid]: '未支付', [OrderStatus.Preparing]: '准备中', [OrderStatus.Prepared]: '待取货',
        [OrderStatus.Delivering]: '配送中', [OrderStatus.Finished]: '已完成', [OrderStatus.Canceled]: '已取消'
    };
    return map[status] || '未知';
}

// 【已修正】直接定义返回的联合类型，不再使用 TagType
function getStatusTagType(status: OrderStatus): 'default' | 'info' | 'success' | 'warning' | 'error' {
    const map: Record<OrderStatus, 'default' | 'info' | 'success' | 'warning' | 'error'> = {
        [OrderStatus.Unpaid]: 'warning', 
        [OrderStatus.Preparing]: 'default', 
        [OrderStatus.Prepared]: 'info',
        [OrderStatus.Delivering]: 'info', 
        [OrderStatus.Finished]: 'success', 
        [OrderStatus.Canceled]: 'error'
    };
    return map[status] || 'default';
}

// --- API Calls ---
const fetchOrders = async () => {
    loading.value = true;
    try {
        const response = await getOrdersForAdmin({ 
            p: pagination.value.page, 
            pn: pagination.value.pageSize, 
            s: filterStatus.value || undefined 
        });
        orders.value = response;
    } catch (error) {
        message.error('加载订单列表失败');
    } finally {
        loading.value = false;
    }
}

// --- Table Columns ---
const createColumns = (): DataTableColumns<AdminOrder> => [
    { title: '订单ID', key: 'id', ellipsis: { tooltip: true } },
    { title: '状态', key: 'status', render: (row) => h(NTag, { type: getStatusTagType(row.status) }, { default: () => getStatusText(row.status) }) },
    { title: '总金额', key: 'total', render: (row) => `¥${(row.total / 100).toFixed(2)}` },
    { title: '顾客ID', key: 'customer', ellipsis: { tooltip: true } },
    { title: '店铺ID', key: 'shop', ellipsis: { tooltip: true } },
    { title: '创建时间', key: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleString() },
    {
        title: '操作',
        key: 'actions',
        render(row) {
            const viewBtn = h(NButton, { size: 'small', onClick: () => viewDetails(row.id) }, { default: () => '详情' });
            const deleteBtn = h(NPopconfirm, { onPositiveClick: () => handleDelete(row.id) }, {
                trigger: () => h(NButton, { size: 'small', type: 'error', disabled: row.status !== OrderStatus.Canceled }, { default: () => '删除' }),
                default: () => '仅能删除已取消的订单，确定吗？'
            });
            return h(NSpace, null, { default: () => [viewBtn, deleteBtn] });
        }
    }
];
const columns = createColumns();

// --- Event Handlers ---
const viewDetails = async (id: string) => {
    try {
        selectedOrder.value = await getOrderDetailForAdmin(id);
        showDetailsModal.value = true;
    } catch (error) {
        message.error('获取订单详情失败');
    }
};

const handleDelete = async (id: string) => {
    try {
        await deleteCanceledOrderForAdmin(id);
        message.success('删除成功');
        fetchOrders();
    } catch (error) {
        message.error('删除失败');
    }
};

const handlePageChange = (page: number) => {
    pagination.value.page = page;
    fetchOrders();
};

const handleFilterChange = () => {
    pagination.value.page = 1;
    fetchOrders();
};

// --- Lifecycle ---
onMounted(fetchOrders);
</script>