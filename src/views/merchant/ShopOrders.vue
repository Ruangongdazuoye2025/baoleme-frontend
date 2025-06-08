<template>
  <n-page>
    <div class="tab-bar mt-4">
      <n-tabs type="line" v-model:value="currentTab" animated class="custom-tabs">
        <n-tab-pane name="preparing" tab="制作中" />
        <n-tab-pane name="prepared" tab="待取餐" />
        <n-tab-pane name="delivering" tab="配送中" />
        <n-tab-pane name="finished" tab="已完成" />
      </n-tabs>
    </div>
    <div class="order-list mt-4">
      <n-space vertical :size="12">
        <template v-if="isLoading">
          <n-skeleton height="80px" :repeat="5" />
        </template>
        <template v-else-if="orders.length === 0">
          <div class="no-orders">暂无订单</div>
        </template>
        <template v-else>
          <OrderCard
            v-for="order in orders"
            :key="order.id"
            :order="order"
            :class="{'preparing-highlight': order.status === Status.Preparing}"
          >
            <template #action v-if="order.status === Status.Preparing">
              <n-button type="success" size="small" @click.stop="markPrepared(order)" :loading="updatingOrderId === order.id">
                标记为已备餐
              </n-button>
            </template>
          </OrderCard>
        </template>
      </n-space>
      <div class="pagination-wrapper mt-4">
        <n-pagination v-model:page="page" :page-count="pageCount" :page-size="pageSize" @update:page="fetchOrders" />
      </div>
    </div>
  </n-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { NTabs, NTabPane, NSpace, NButton, NSkeleton, NPagination, useMessage } from 'naive-ui'
import OrderCard from '@/components/card/OrderCard.vue'
import { fetchShopOrderList, updateOrderStatus } from '@/api/orders'
import { Status, type Order } from '@/types/order'
import { useTokenStore } from '@/stores/token'

// 接收 shopId 作为 prop
const props = defineProps<{ shopId: string }>()
const route = useRoute()
const message = useMessage()
const shopId = route.params.id as string // Assumes shopId is in route params

const currentTab = ref('preparing')
const orders = ref<Order[]>([])
const isLoading = ref(false)
const page = ref(0) // 分页从0开始
const pageSize = 5
const pageCount = ref(1)
const updatingOrderId = ref<string | null>(null)

const statusMap: Record<string, Status> = {
  preparing: Status.Preparing,
  prepared: Status.Prepared,
  delivering: Status.Delivering,
  finished: Status.Finished,
}

async function fetchOrders() {
  isLoading.value = true
  try {
    const status = statusMap[currentTab.value]
    const result = await fetchShopOrderList(props.shopId, page.value, pageSize, status)
    orders.value = result
    // TODO: If API returns total, set pageCount accordingly
    // pageCount.value = Math.ceil(total / pageSize)
    pageCount.value = result.length < pageSize ? page.value + 1 : page.value + 2 // fallback
  } catch (e) {
    message.error('订单获取失败')
    orders.value = []
  } finally {
    isLoading.value = false
  }
}

function markPrepared(order: Order) {
  updatingOrderId.value = order.id
  updateOrderStatus(order.id, Status.Prepared)
    .then(() => {
      message.success('已标记为已备餐')
      fetchOrders()
    })
    .catch(() => {
      message.error('操作失败')
    })
    .finally(() => {
      updatingOrderId.value = null
    })
}

watch([currentTab, page, () => props.shopId], fetchOrders, { immediate: true })

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.preparing-highlight {
  background: #fffbe6;
  border: 1.5px solid #ffe58f;
  border-radius: 12px;
}
.no-orders {
  text-align: center;
  color: #888;
  margin: 2rem 0;
}
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin: 24px 0 40px 0;
  padding-bottom: 64px;
  min-height: 10vh;
  box-sizing: border-box;
}
</style>
