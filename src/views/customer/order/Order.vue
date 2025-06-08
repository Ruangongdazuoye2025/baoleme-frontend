<template>
  <n-page>
    <div class="tab-bar mt-4">
      <div class="tab-wrapper">
        <n-tabs type="line" v-model:value="currentTab" animated class="custom-tabs">
          <n-tab-pane name="all" tab="全部" />
          <n-tab-pane name="unpaid" tab="待支付" />
          <n-tab-pane name="preparing" tab="制作中" />
          <n-tab-pane name="prepared" tab="待取餐" />
          <n-tab-pane name="delivering" tab="配送中" />
          <n-tab-pane name="finished" tab="已完成" />
          <n-tab-pane name="cancelled" tab="已取消" />
        </n-tabs>
      </div>
      <!-- 搜索框已移除 -->
    </div>

    <div class="order-list mt-4">
      <!-- 订单卡片 -->
      <n-space vertical :size="12" class="mt-4">
        <OrderCard v-for="order in filteredOrders" :key="order.id" :order="order" :cover="shopCoverMap[order.shop || '']" />
      </n-space>
      <n-skeleton height="40px"  :sharp="false" />

    </div>
    <p v-if="isTimeOut" class="no-orders" style="justify-self: center;">加载超时，重试</p>
    <div class="pagination-wrapper mt-4">
      <n-pagination v-model:page="page" :page-count="pageCount" :page-size="pageSize" @update:page="handlePageChange" />
    </div>
  </n-page>
  <!-- 回到顶部Back Top -->
  <n-back-top :right="40" :bottom="160">
    <div style="
        width: 100px;
        height: 40px;
        line-height: 40px;
        text-align: center;
        font-size: 14px;
      ">
      回到顶部
    </div>
  </n-back-top>

</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NTabs, NTabPane, NSpace, useMessage, NBackTop } from 'naive-ui'
import OrderCard from '@/components/card/OrderCard.vue'
import { SearchOutlined } from '@vicons/antd'
import { Status, type Order } from '@/types/order' // 导入数据类型
import { fetchCustomerOrderList, fetchRiderOrderList } from '@/api/orders'
import { getShopInfo } from '@/api/shop'
import { useTokenStore } from '@/stores/token'

const route = useRoute()
const router = useRouter()

// 加载数据
const isLoading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const itemsPerPage = 5

const total = ref(0)
const page = ref(0)
const pageSize = 5
const pageCount = ref(1)
const statusMap: Record<string, Status | undefined> = {
  all: undefined,
  unpaid: Status.Unpaid,
  preparing: Status.Preparing,
  prepared: Status.Prepared,
  delivering: Status.Delivering,
  finished: Status.Finished,
  canceled: Status.Canceled,
}

const currentTab = ref('all')
const orders = ref<Order[]>([])
const shopCoverMap = ref<Record<string, string>>({}) // 订单id->店铺封面

const tokenStore = useTokenStore()
const userRole = computed(() => tokenStore.role)

const message = useMessage()

const isTimeOut = ref(false)

async function fetchOrders() {
  isLoading.value = true
  let result: Order[] = []
  let total = 0
  try {
    const status = statusMap[currentTab.value]
    // fetchCustomerOrderList和fetchRiderOrderList需要string类型status
    if (userRole.value === 'customer') {
      result = await fetchCustomerOrderList(page.value, pageSize, status)
    } else if (userRole.value === 'rider') {
      // 只允许配送中和已完成
      if (currentTab.value !== 'delivering' && currentTab.value !== 'finished') {
        orders.value = []
        isLoading.value = false
        return
      }
      result = await fetchRiderOrderList(page.value, pageSize, status)
    } else {
      message.error('商家不支持订单列表')
      orders.value = []
      isLoading.value = false
      return
    }
    orders.value = result
    // 级联查店铺封面
    for (const order of result) {
      if (order.shop && !shopCoverMap.value[order.shop]) {
        try {
          const shop = await getShopInfo(order.shop)
          shopCoverMap.value[order.shop] = shop.cover?.origin || ''
        } catch {}
      }
    }
    // TODO: 如果API返回total, 设置pageCount
    pageCount.value = result.length < pageSize ? page.value + 1 : page.value + 2
  } catch (e) {
    message.error('订单获取失败')
    orders.value = []
  } finally {
    isLoading.value = false
  }
}

watch([currentTab, page], fetchOrders, { immediate: true })

onMounted(() => {
  fetchOrders()
})

const filteredOrders = computed(() => {
  if (currentTab.value === 'all') {
    console.log("filtered")
    return orders.value
  }
  if (currentTab.value === 'unpaid') {
    return orders.value.filter(order => order.status === Status.Unpaid)
  }
  if (currentTab.value === 'preparing') {
    return orders.value.filter(order => order.status === Status.Preparing)
  }
  if (currentTab.value === 'prepared') {
    return orders.value.filter(order => order.status === Status.Prepared)
  }
  if (currentTab.value === 'delivering') {
    return orders.value.filter(order => order.status === Status.Delivering)
  }
  if (currentTab.value === 'history') {
    return orders.value.filter(order => order.status === Status.Finished)
  }
  if (currentTab.value === 'canceled') {
    return orders.value.filter(order => order.status === Status.Canceled)
  }
  if (currentTab.value === 'category') {
    // TODO: 分类页暂做占位处理
    alert('分类页暂做占位处理')
    return []
  }
  return orders.value
})

// TODO: 分页功能
// 数据 pageOrders
// 当前页数 page
// const pageSize = 5

const currentPageOrders = computed(() => {
  const start = (page.value - 1) * pageSize
  return orders.value.slice(start, start + pageSize)
})

function handlePageChange(newPage: number) {
  page.value = newPage
}


</script>

<style scoped>
/* 顶部页面导航样式 */
.tab-bar {
  position: sticky;
  display: flex;
  margin: 20px 10px;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.tab-bar-wrapper {
  align-items: center;
  flex-wrap: wrap;
  width: fit-content;
}

/* 定制 Tab 内部样式 */
.custom-tabs .n-tabs-tab {
  flex: 1;
  min-width: 200px;
  margin-right: 12px;
  padding: 10px 20px;
  font-size: 24px;
}


.search-input {
  margin-left: 60px;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 20px;
  background-color: #f5f5f5;
  color: #555;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.search-input:hover {
  background-color: #eaeaea;
  color: #222;
}

/* 选中的 Tab 高亮文字 */
.custom-tabs .n-tabs-tab--active {
  font-weight: 600;
  color: #2563eb;
  /* 蓝色强调 */
}

/* 指示器大小加粗一点 */
.custom-tabs .n-tabs-bar {
  height: 3px;
}

.mt-4 {
  margin-top: 1rem;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin: 24px 0 40px 0;
  padding-bottom: 64px;
  min-height: 10vh;
  box-sizing: border-box;
}

.order-scroll-list {
  /* 如果希望滚动列表有固定高度 */
  /* height: calc(100vh - 180px); */
  /* 减去 PageHeader 和其他可能的间距 */
  /* overflow-y: auto; */
}
</style>
