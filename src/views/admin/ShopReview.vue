<template>
    <n-card title="商家审核与管理" :bordered="false">
      <n-space :vertical="true">
        <n-space>
          <n-input
            v-model:value="searchQuery"
            placeholder="按店铺名称搜索"
            clearable
            @keydown.enter="handleSearch"
          />
          <n-button type="primary" @click="handleSearch">搜索</n-button>
        </n-space>
  
        <n-data-table
          :columns="columns"
          :data="shops"
          :loading="loading"
          :pagination="pagination"
          :remote="true"
          @update:page="handlePageChange"
          @update:page-size="handlePageSizeChange"
        />
      </n-space>
  
      <n-modal v-model:show="showDetailsModal">
        <n-card style="width: 600px" title="店铺详情" :bordered="false" size="huge" role="dialog" aria-modal="true">
          <n-descriptions label-placement="left" title="基本信息" :column="2">
            <n-description-item label="店铺名称">{{ selectedShop?.name }}</n-description-item>
            <n-description-item label="店主ID">{{ selectedShop?.owner }}</n-description-item>
            <n-description-item label="创建时间">{{ new Date(selectedShop?.createdAt || '').toLocaleString() }}</n-description-item>
            <n-description-item label="联系电话">{{ selectedShop?.address.tel }}</n-description-item>
            <n-description-item label="店铺地址" :span="2">{{ selectedShop?.address.province }}{{ selectedShop?.address.city }}{{ selectedShop?.address.district }}{{ selectedShop?.address.address }}</n-description-item>
            <n-description-item label="店铺描述" :span="2">{{ selectedShop?.description }}</n-description-item>
          </n-descriptions>
          <n-divider />
          <n-descriptions label-placement="top" title="资质信息" :column="1">
             <n-description-item label="营业执照">
                <n-image width="200" :src="selectedShop?.license.origin" />
             </n-description-item>
          </n-descriptions>
        </n-card>
      </n-modal>
    </n-card>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, h } from 'vue'
  import { useRouter } from 'vue-router'
  import { NButton, NSpace, NTag, useMessage, NImage, NDescriptions, NDescriptionsItem, NModal, NPopconfirm } from 'naive-ui'
  import { getShopsForAdmin, updateShopProfile, type ShopForAdmin, type GetShopsRequest } from '@/api/admin'
  import type { DataTableColumns, PaginationProps } from 'naive-ui'
  
  // =================================================================
  // State
  // =================================================================
  
  const shops = ref<ShopForAdmin[]>([])
  const loading = ref(true)
  const message = useMessage()
  const searchQuery = ref('')
  const router = useRouter();
  
  const pagination = ref<PaginationProps>({
    page: 0,
    pageSize: 10,
    itemCount: 0,
    showSizePicker: true,
    pageSizes: [10, 20, 50]
  })
  
  const showDetailsModal = ref(false)
  const selectedShop = ref<ShopForAdmin | null>(null)
  
  
  // =================================================================
  // API Interaction
  // =================================================================
  
  const fetchShops = async () => {
    loading.value = true
    try {
      const params: GetShopsRequest = {
        p: pagination.value.page,
        pn: pagination.value.pageSize,
        q: searchQuery.value || undefined
      }
      const response = await getShopsForAdmin(params)
      shops.value = response
    } catch (error) {
      message.error('加载店铺列表失败')
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  
  // =================================================================
  // Table Columns & Rendering
  // =================================================================
  
  const createColumns = (): DataTableColumns<ShopForAdmin> => {
    return [
      {
        title: '店铺名称',
        key: 'name',
        fixed: 'left',
        width: 150
      },
      {
        title: '认证状态',
        key: 'verified',
        width: 100,
        render(row) {
          return h(
            NTag,
            {
              type: row.verified ? 'success' : 'warning',
              bordered: false
            },
            { default: () => (row.verified ? '已认证' : '待审核') }
          )
        }
      },
      {
        title: '开业状态',
        key: 'opened',
        width: 100,
         render(row) {
          return h(
            NTag,
            {
              type: row.opened ? 'info' : 'error',
              bordered: false
            },
            { default: () => (row.opened ? '营业中' : '已下架') }
          )
        }
      },
      {
        title: '创建时间',
        key: 'createdAt',
        width: 180,
        render: (row) => new Date(row.createdAt).toLocaleString()
      },
       {
        title: '地址',
        key: 'address.address',
        render: (row) => `${row.address.city}${row.address.district}${row.address.address}`
      },
      {
        title: '操作',
        key: 'actions',
        fixed: 'right',
        width: 260,
        render(row) {
          const viewButton = h(NButton, { size: 'small', onClick: () => showDetails(row) }, { default: () => '详情' })
          
          const approveButton = h(NButton, { size: 'small', type: 'primary', disabled: row.verified, onClick: () => handleApprove(row.id) }, { default: () => '通过审核' })
          
          const toggleStatusButton = h(
              NPopconfirm,
              { onPositiveClick: () => handleToggleOpened(row) },
              {
                  trigger: () => h(NButton, { size: 'small', type: row.opened ? 'error' : 'warning' }, { default: () => (row.opened ? '下架店铺' : '重新上架') }),
                  default: () => `确定要${row.opened ? '下架' : '上架'}“${row.name}”吗？`
              }
          )

          const itemManageButton = h(NButton, {
            size: 'small',
            type: 'info',
            disabled: !row.verified, // 只有已认证的店铺才能管理商品
            onClick: () => router.push({ name: 'AdminShopItemReview', params: { shopId: row.id } })
        }, { default: () => '商品管理' });

        const commentManageButton = h(NButton, {
            size: 'small',
            type: 'success',
            disabled: !row.verified,
            onClick: () => router.push({ name: 'AdminShopCommentReview', params: { shopId: row.id } })
        }, { default: () => '评价管理' });

          
          return h(NSpace, null, { default: () => [viewButton, approveButton, toggleStatusButton] })
        }
      }
    ]
  }
  
  const columns = createColumns()
  
  // =================================================================
  // Event Handlers
  // =================================================================
  
  const showDetails = (shop: ShopForAdmin) => {
      selectedShop.value = shop;
      showDetailsModal.value = true;
  }
  
  const handleApprove = async (shopId: string) => {
    try {
      await updateShopProfile(shopId, { verified: true });
      message.success('审核通过！');
      fetchShops(); // Refresh the list
    } catch (error) {
      message.error('操作失败');
      console.error(error);
    }
  }
  
  const handleToggleOpened = async (shop: ShopForAdmin) => {
      try {
          await updateShopProfile(shop.id, { opened: !shop.opened });
          message.success('操作成功！');
          fetchShops(); // Refresh the list
      } catch (error) {
          message.error('操作失败');
          console.error(error);
      }
  }
  
  const handlePageChange = (currentPage: number) => {
    pagination.value.page = currentPage
    fetchShops() 
  }
  
  const handlePageSizeChange = (pageSize: number) => {
      pagination.value.pageSize = pageSize;
      pagination.value.page = 1; // Reset to first page
      fetchShops();
  }
  
  const handleSearch = () => {
    pagination.value.page = 1;
    fetchShops();
  }
  
  // =================================================================
  // Lifecycle Hooks
  // =================================================================
  
  onMounted(() => {
    fetchShops()
  })
  </script>