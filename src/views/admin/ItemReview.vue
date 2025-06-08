<template>
  <n-card :title="`店铺商品管理 - ${shopName}`" :bordered="false">
    <n-space vertical>
      <n-button @click="router.back()">返回店铺列表</n-button>
      <n-data-table
        :columns="columns"
        :data="items"
        :loading="loading"
        :pagination="pagination"
        :remote="true"
        @update:page="handlePageChange"
      />
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NSpace, NTag, useMessage, NPopconfirm } from 'naive-ui'
import { getShopItemsForAdmin, updateItemProfile } from '@/api/admin'
import { getShopInfo } from '@/api/shop'
import type { ProductData } from '@/types/product'
import type { DataTableColumns, PaginationProps } from 'naive-ui'

const route = useRoute()
const router = useRouter()
const message = useMessage()

const shopId = computed(() => route.params.shopId as string)
const shopName = ref('')
const items = ref<ProductData[]>([])
const loading = ref(true)
const pagination = ref<PaginationProps>({ page: 0, pageSize: 10, itemCount: 0 })

const fetchShopDetails = async () => {
    try {
        const shop = await getShopInfo(shopId.value);
        shopName.value = shop.name;
    } catch (error) {
        message.error('加载店铺信息失败');
    }
}

const fetchItems = async () => {
    if (!shopId.value) return;
    loading.value = true
    try {
        const response = await getShopItemsForAdmin(shopId.value, { p: pagination.value.page, pn: pagination.value.pageSize });
        items.value = response
        // 假设API会返回总数
        // pagination.value.itemCount = response.totalCount;
    } catch (error) {
        message.error('加载商品列表失败');
    } finally {
        loading.value = false
    }
}

const createColumns = (): DataTableColumns<ProductData> => [
    { title: '商品名称', key: 'name', width: 200, fixed: 'left' },
    { title: '价格', key: 'price', render: (row) => (row.price / 100).toFixed(2) + '元' },
    { 
        title: '状态', 
        key: 'available',
        render(row) {
            return h(NTag, { type: row.available ? 'success' : 'error' }, { default: () => (row.available ? '已上架' : '已下架') });
        }
    },
    {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 150,
        render(row) {
            return h(
                NPopconfirm,
                { onPositiveClick: () => handleToggleAvailable(row) },
                {
                    trigger: () => h(NButton, { size: 'small', type: row.available ? 'error' : 'warning' }, { default: () => (row.available ? '下架' : '上架') }),
                    default: () => `确定要将“${row.name}”${row.available ? '下架' : '上架'}吗？`
                }
            )
        }
    }
]

const columns = createColumns()

const handleToggleAvailable = async (item: ProductData) => {
    try {
        await updateItemProfile(item.id, { available: !item.available });
        message.success('操作成功！');
        fetchItems(); // Refresh list
    } catch (error) {
        message.error('操作失败');
    }
}

const handlePageChange = (page: number) => {
    pagination.value.page = page;
    fetchItems();
}

onMounted(() => {
    fetchShopDetails();
    fetchItems();
});

</script>