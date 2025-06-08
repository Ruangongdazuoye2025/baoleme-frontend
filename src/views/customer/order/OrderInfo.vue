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

        <!-- 概要部分 -->
        <n-card class="summary-card">
            <div class="summary-wrapper">
                <!-- 左侧头像与概要 -->
                <div class="summary-left">
                    <n-avatar v-if="shopInfo?.cover" :src="shopInfo.cover.origin" :size="200" />
                    <div class="info-list">
                        <div class="store-name">{{ shopInfo?.name || "未知店铺" }}</div>
                        <div class="order-time">{{ order?.createdAt }}</div>
                        <div v-if="riderInfo">骑手：{{ riderInfo.name }}</div>
                    </div>
                </div>
                <!-- 右侧详情 -->
                <div class="summary-right">
                    <div class="store-link" @click="goToShop(order?.shop!)">店铺链接 →</div>
                    <div class="detail-wrapper">
                        <div class="actions">
                            <n-button v-if="role==='customer' && order?.status===Status.Unpaid" strong size="small" type="error" @click="handleDeleteOrder">删除订单</n-button>
                            <n-button v-if="role==='merchant' && order?.status===Status.Preparing" strong size="small" type="success" @click="handleMarkPrepared">标记为已备餐</n-button>
                            <n-button v-if="role==='rider' && order?.status===Status.Delivering" strong size="small" type="success" @click="handleMarkFinished">标记为已送达</n-button>
                            <n-button v-if="role==='rider' && order?.status===Status.Delivering" strong size="small" @click="handleUpdateDeliveryLocation">更新当前位置</n-button>
                        </div>
                        <n-collapse class="order-info-collapse">
                            <n-collapse-item title="交易信息" name="1">
                                <p>实付：￥{{ order?.total ? (order.total/100).toFixed(2) : '--' }}</p>
                                <p>配送费：￥{{ order?.deliveryFee ? (order.deliveryFee/100).toFixed(2) : '--' }}</p>
                                <p>合计：￥{{ order?.total && order?.deliveryFee ? ((order.total+order.deliveryFee)/100).toFixed(2) : '--' }}</p>
                                <p>订单号：{{ order?.id }}</p>
                                <p>支付时间：{{ order?.paidAt }}</p>
                                <p>准备完成时间：{{ order?.preparedAt }}</p>
                                <p>配送时间：{{ order?.deliveredAt }}</p>
                                <p>送达时间：{{ order?.finishedAt }}</p>
                            </n-collapse-item>
                            <n-collapse-item title="收货信息" name="2">
                                <p>收货人：{{ customerInfo?.name }}</p>
                                <p>联系电话：{{ order?.customerAddress?.tel }}</p>
                                <p>地址：{{ order?.customerAddress?.address }} {{ order?.customerAddress?.city }} {{ order?.customerAddress?.district }}</p>
                            </n-collapse-item>
                            <n-collapse-item title="物流信息" name="3">
                                <p>配送员：{{ riderInfo?.name || '暂无' }}</p>
                                <p>配送时间：{{ order?.deliveredAt }}</p>
                                <p>送达时间：{{ order?.finishedAt }}</p>
                                <p>配送位置：{{ order?.delivery ? order.delivery.longitude + ',' + order.delivery.latitude : '暂无' }}</p>
                                <p>店铺信息：{{ shopInfo?.address?.address }}</p>
                            </n-collapse-item>
                            <n-collapse-item title="商品列表" name="5">
                                <ul>
                                    <li v-for="item in orderItems" :key="item.id">
                                        <img :src="item.cover?.origin" style="width:40px;height:40px;object-fit:cover;margin-right:8px;" />
                                        {{ item.name }} x{{ item.quantity }} ￥{{ item.price/100 }}
                                    </li>
                                </ul>
                            </n-collapse-item>
                            <n-collapse-item title="其它信息" name="4">
                                <p>备注： {{ order?.note || "无" }} </p>
                            </n-collapse-item>
                        </n-collapse>
                    </div>
                </div>
            </div>
        </n-card>
        <!-- 反馈与权益 -->
        <n-card class="feedback-card">
            <p>如有问题，请点击反馈或查看订单权益。</p>
        </n-card>
        <n-card class="map-container" v-if="order && order.shopAddress && order.customerAddress">
            <DeliveryMap 
                :start-longitude="order.shopAddress.coordinate[0]" 
                :start-latitude="order.shopAddress.coordinate[1]"
                :end-longitude="order.customerAddress.coordinate[0]"
                :end-latitude="order.customerAddress.coordinate[1]"
                v-if="order.shopAddress && order.customerAddress"
                :current-longitude="order.delivery ? order.delivery.longitude : 0"
                :current-latitude="order.delivery ? order.delivery.latitude : 0"
            />
        </n-card>
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
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  flex-shrink: 0;
}

.title {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 12px;
}

.summary-card {
    margin-bottom: 16px;
}

.summary-wrapper {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
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

.map-container {
    margin-top: auto;
    margin-bottom: auto;
    width: 100%;
    aspect-ratio: 16 / 9;
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
</style>
