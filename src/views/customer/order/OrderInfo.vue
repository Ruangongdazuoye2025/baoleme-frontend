<template>
    <div class="order-info-container">
        <div class="top-bar">
            <n-button text @click="goBack">
                <n-icon size="24">
                    <arrow-back />
                </n-icon>
            </n-button>
            <h1 class="title">订单详情</h1>
        </div>

        <div class="summary-wrapper" style="width: 100%;">
            <div class="detail-wrapper" style="max-width: 800px; margin: auto;">
                <n-card>
                  <div style="font-size: 1.5em;" class="store-link" v-if="shopInfo" @click="goToShop(order?.shop!)">{{ shopInfo?.name }} →</div>
                  <n-list>
                    <n-list-item v-for="item in orderItems">
                        <n-thing :title="item.name" :description="`￥${(item.price / item.quantity / 100).toFixed(2)} × ${item.quantity}`">
                            <template #avatar>
                              <n-image :src="item.cover?.thumbnail" style="width: 60px; height: 60px; object-fit: cover;" />
                            </template>
                        </n-thing>
                    </n-list-item>
                  </n-list>
                  <div v-if="order" style="width: 100%">
                    <n-flex class="order-info" justify="space-between">
                      <span>配送费</span>
                      <span>¥{{ (order.deliveryFee / 100).toFixed(2) }}</span>
                    </n-flex>
                    <n-flex class="order-info" justify="space-between">
                      <span>合计</span>
                      <span>¥{{ (order.total / 100).toFixed(2) }}</span>
                    </n-flex>
                    <n-flex class="order-info" justify="space-between">
                      <span>备注</span>
                      <span>{{ order.note }}</span>
                    </n-flex>
                  </div>
                </n-card>
                <n-card v-if="riderInfo">
                  <n-thing :title="riderInfo.name" description="骑手">
                    <template #avatar>
                      <n-avatar :src="riderInfo.avatar.thumbnail" fallback-src="/default-avatar.webp" />
                    </template>
                    <template #header-extra>
                      <n-button @click="router.push(`/user/${riderInfo.id}`)">查看骑手信息</n-button>
                    </template>
                  </n-thing>
                </n-card>
                <n-card>
                  <div v-if="order" style="width: 100%">
                    <n-flex class="order-info" justify="space-between">
                      <span>订单编号</span>
                      <span>{{ order.id }}</span>
                    </n-flex>
                    <n-flex class="order-info" justify="space-between">
                      <span>下单时间</span>
                      <span>{{ (new Date(order.createdAt)).toLocaleString() }}</span>
                    </n-flex>
                    <n-flex v-if="order.paidAt" class="order-info" justify="space-between">
                      <span>付款时间</span>
                      <span>{{ (new Date(order.paidAt)).toLocaleString() }}</span>
                    </n-flex>
                    <n-flex v-if="order.preparedAt" class="order-info" justify="space-between">
                      <span>准备完成时间</span>
                      <span>{{ (new Date(order.preparedAt)).toLocaleString() }}</span>
                    </n-flex>
                    <n-flex v-if="order.deliveredAt" class="order-info" justify="space-between">
                      <span>配送开始时间</span>
                      <span>{{ (new Date(order.deliveredAt)).toLocaleString() }}</span>
                    </n-flex>
                    <n-flex v-if="order.finishedAt" class="order-info" justify="space-between">
                      <span>配送完成时间</span>
                      <span>{{ (new Date(order.finishedAt)).toLocaleString() }}</span>
                    </n-flex>
                    <n-flex v-if="order.canceledAt" class="order-info" justify="space-between">
                      <span>取消时间</span>
                      <span>{{ (new Date(order.canceledAt)).toLocaleString() }}</span>
                    </n-flex>
                  </div>
                </n-card>
                <n-card class="map-container" v-if="order && order.shopAddress && order.customerAddress">
                  <n-flex v-if="order.shopAddress" class="order-info" justify="space-between">
                   <DeliveryMap 
                      style="height: 300px;"
                      :start-longitude="order.shopAddress.coordinate[0]" 
                      :start-latitude="order.shopAddress.coordinate[1]"
                      :end-longitude="order.customerAddress.coordinate[0]"
                      :end-latitude="order.customerAddress.coordinate[1]"
                      v-if="order.shopAddress && order.customerAddress"
                      :current-longitude="order.delivery ? order.delivery.longitude : 0"
                      :current-latitude="order.delivery ? order.delivery.latitude : 0"
                    />
                  </n-flex>
                  <n-flex v-if="order.shopAddress" class="order-info" justify="space-between">
                    <span>店铺地址</span>
                    <span>{{ order.shopAddress.province }}{{ order.shopAddress.city }}{{ order.shopAddress.district }}{{ order.shopAddress.address }}</span>
                  </n-flex>
                  <n-flex v-if="order.shopAddress" class="order-info" justify="space-between">
                    <span>店铺联系方式</span>
                    <span>{{ order.shopAddress.name }} {{ order.shopAddress.tel }}</span>
                  </n-flex>
                  <n-flex v-if="order.shopAddress" class="order-info" justify="space-between">
                    <span>顾客地址</span>
                    <span>{{ order.customerAddress.province }}{{ order.customerAddress.city }}{{ order.customerAddress.district }}{{ order.customerAddress.address }}</span>
                  </n-flex>
                  <n-flex v-if="order.shopAddress" class="order-info" justify="space-between">
                    <span>顾客联系方式</span>
                    <span>{{ order.customerAddress.name }} {{ order.customerAddress.tel }}</span>
                  </n-flex>
              </n-card>
            </div>
        </div>
    </div>
    <n-back-top :bottom="160"></n-back-top>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessage, useDialog } from 'naive-ui'
import { fetchOrderDetail, updateOrderStatus, deleteCanceledOrder } from '@/api/orders'
import { getShopInfo } from '@/api/shop'
import { getUser } from '@/api/user'
import { useTokenStore } from '@/stores/token'
import { Status, type Order } from '@/types/order'
import type { ShopInfo } from '@/types/shop'
import type { UserData } from '@/types/user'
import DeliveryMap from '@/views/DeliveryMap.vue'
import axios from 'axios'
import { apiRoot } from '@/config/api'
import { ArrowBack } from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const dialog = useDialog()
const tokenStore = useTokenStore()

const order = ref<Order | null>(null)
const shopInfo = ref<ShopInfo | null>(null)
const riderInfo = ref<UserData | null>(null)
const customerInfo = ref<UserData | null>(null)
const loading = ref(true)

const orderId = route.params.id as string

// 角色判定
const userId = computed(() => tokenStore.userId)
const role = computed(() => {
  if (!order.value) return 'unknown'
  if (order.value.customer === userId.value) return 'customer'
  if (shopInfo.value && shopInfo.value.owner === userId.value) return 'merchant'
  if (order.value.rider === userId.value) return 'rider'
  return 'other'
})

// 加载订单、店铺、用户信息
async function loadOrder() {
  loading.value = true
  try {
    const data = await fetchOrderDetail(orderId)
    order.value = data
    if (data.shop) {
      shopInfo.value = await getShopInfo(data.shop)
    }
    if (data.rider) {
      riderInfo.value = await getUser(data.rider)
    }
    if (data.customer) {
      customerInfo.value = await getUser(data.customer)
    }
  } catch (e) {
    message.error('订单信息加载失败')
  } finally {
    loading.value = false
  }
}
onMounted(loadOrder)

// 操作按钮
async function handleDeleteOrder() {
  if (!order.value) return
  dialog.warning({
    title: '删除订单',
    content: '确定要删除该订单吗？',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteCanceledOrder(order.value!.id)
        message.success('订单已删除')
        router.back()
      } catch {
        message.error('删除失败')
      }
    }
  })
}
async function handleMarkPrepared() {
  if (!order.value) return
  try {
    await updateOrderStatus(order.value.id, Status.Prepared)
    message.success('已标记为已备餐')
    loadOrder()
  } catch {
    message.error('操作失败')
  }
}
async function handleMarkFinished() {
  if (!order.value) return
  try {
    await updateOrderStatus(order.value.id, Status.Finished)
    message.success('已标记为已送达')
    loadOrder()
  } catch {
    message.error('操作失败')
  }
}
async function handleUpdateDeliveryLocation() {
  if (!order.value) return
  if (!navigator.geolocation) {
    message.error('当前浏览器不支持定位')
    return
  }
  navigator.geolocation.getCurrentPosition(async pos => {
    try {
      const { latitude, longitude } = pos.coords
      await updateOrderDelivery(order.value!.id, latitude, longitude)
      message.success('位置已更新')
      loadOrder()
    } catch {
      message.error('位置更新失败')
    }
  }, () => message.error('定位失败'))
}

function goBack() {
  router.go(-1)
}
function goToShop(shopId: string) {
  router.push(`/customer/shops/${shopId}`)
}

// 商品列表
const orderItems = computed(() => order.value?.items || [])
// 地图参数
const mapStart = computed(() => order.value?.shopAddress?.coordinate || [0,0])
const mapEnd = computed(() => order.value?.customerAddress?.coordinate || [0,0])
const mapCurrent = computed(() => order.value?.delivery ? [order.value.delivery.longitude, order.value.delivery.latitude] : null)

// 修正 updateOrderDelivery 的导入和实现
async function updateOrderDelivery(orderId: string, latitude: number, longitude: number) {
  await axios.patch(`${apiRoot}/orders/${orderId}/delivery`, {
    latitude, longitude
  }, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}
</script>

<style scoped>
.order-info-container {
    padding: 16px;
}

.top-bar {
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 8px 0;
  flex-shrink: 0;
}

.title {
  margin-left: 16px;
    font-size: 20px;
    font-weight: bold;
}

.summary-card {
    margin-bottom: 16px;
}

.summary-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.info-list {
    display: flex;
    flex-direction: column;
    font-size: 14px;
    color: #555;
}

.store-name {
    font-weight: bold;
    font-size: 16px;
}

.order-time {
    color: #888;
    font-size: 13px;
}

.summary-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.store-link {
    color: #409eff;
    cursor: pointer;
    font-weight: 500;
}

.detail-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.actions {
    display: flex;
    gap: 8px;
}

.feedback-card {
    margin-bottom: 16px;
    font-size: 14px;
    color: #666;
}

.recommend-card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
}

.recommend-card-container::after {
    display: table;
    content: '';
    clear: both;
}

.recommend-card {
    font-size: 14px;
}

.recommend-items {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    font-size: 12px;
    color: #444;
}
.order-info > span:last-child {
  opacity: 0.8;
}
</style>
