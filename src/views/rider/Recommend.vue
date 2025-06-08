<template>
  <div class="recommend-container">
    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="new" tab="新任务">
        <div class="filter-sort-container">
          <n-input-number v-model:value="maxDistance" placeholder="最大配送距离(km)" />
          <n-input-number v-model:value="maxTime" placeholder="最长配送时间(分钟)" />
          <n-input-number v-model:value="minIncome" placeholder="最低预计收入" />
          <n-button primary @click="getLocation">获取定位{{ typeof(riderLat) === 'number' ? ` (${riderLon.toFixed(3)}, ${riderLat.toFixed(3) })` : ''  }}</n-button>
          <n-button @click="applyFilters">应用筛选</n-button>
        </div>
        <n-spin :show="loading">
          <n-list v-infinite-scroll="() => fetchOrders(true)" 
                 :infinite-scroll-disabled="loading || !hasMore" 
                 :infinite-scroll-distance="10">
            <n-list-item v-for="order in newOrders" :key="order.id">
              <n-card class="order-item">
                <div class="order-header">
                  <div class="time-group">
                    <span class="delivery-time">{{ formatDeliveryTime(order) }}</span>
                    <span class="delivery-lasttime">{{ formatLastDeliveryTime(order) }}</span>
                  </div>
                  <span class="delivery-fee">¥{{ order.deliveryFee }}</span>
                </div>

                <div class="address-info">
                  <div class="address-item">
                    <div>
                      <span class="distance">{{ calculateDistance(order.shopAddress) }}km</span>
                    </div>
                    <div class="address-detail">
                      <div class="address-title">{{order.shop}}</div>
                      <div class="address-content">{{formatAddress(order.shopAddress) }}</div>
                    </div>
                  </div>
                  <br>
                  <div class="address-item">
                    <span class="distance">{{ calculateDistance(order.customerAddress) }}km</span>
                    <div class="address-detail">
                      <div class="address-title">{{ order.customerAddress.address }}</div>
                    </div>
                  </div>
                </div>

                <div class="order-info">
                  <div class="info-line">
                    <span class="status">{{ order.status === 'prepared' ? '商家已出餐' : '商家未出餐' }}</span>
                  </div>
                  <div class="info-line collapsible" :class="{expanded: expandedItems[order.id]}">
                    <n-button text @click="toggleExpand(order.id, 'items')">
                      商品数量: {{ calculateTotalItems(order.items) }}
                      <n-icon class="info-icon">
                        <chevron-down />
                      </n-icon>
                    </n-button>
                    <div class="items-detail" v-if="expandedItems[order.id]">
                      <div v-for="item in order.items" :key="item.id" class="item">
                        <span>{{ item.name }}</span>
                        <span>x{{ item.quantity }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="info-line collapsible" :class="{expanded: expandedNotes[order.id]}">
                    <n-button text @click="toggleExpand(order.id, 'note')">
                      备注
                      <n-icon class="info-icon">
                        <chevron-down />
                      </n-icon>
                    </n-button>
                    <div class="note-detail" v-if="expandedNotes[order.id]">
                      {{ order.note || '无备注' }}
                    </div>
                  </div>
                </div>

                <div class="slide-container">
                  <n-slider 
                    v-model:value="sliderValue[order.id]" 
                    :step="1" 
                    :max="100"
                    :disabled="order.rider"
                    @update:value="handleSliderChange($event, order)"
                    @click="handleSliderClick(order)"
                  >
                    <template #thumb>
                      <div class="custom-thumb"></div>
                    </template>
                  </n-slider>
                  <span class="slide-text">滑动接单</span>
                </div>
              </n-card>
            </n-list-item>
            <n-empty v-if="!loading && newOrders.length === 0" description="暂无订单" />
            <div v-if="loading" class="loading-more">
              <n-spin size="small" /> 加载中...
            </div>
            <div v-if="!loading && !hasMore && newOrders.length > 0" class="no-more">
              没有更多订单了
            </div>
          </n-list>
        </n-spin>
      </n-tab-pane>
      
      <n-tab-pane name="delivering" tab="配送中">
        <n-list v-infinite-scroll="() => fetchOrders(true)"
               :infinite-scroll-disabled="loading || !hasMore"
               :infinite-scroll-distance="10">
          <n-list-item v-for="order in deliveringOrders" :key="order.id">
            <n-card class="order-item">
              <div class="order-header">
                  <div class="time-group">
                    <span class="delivery-time">还剩{{ formatDeliveryTime(order) }}</span>
                    <span class="delivery-lasttime">{{ formatLastDeliveryTime(order) }}</span>
                  </div>
                <span class="delivery-fee">¥{{ order.deliveryFee }}</span>
              </div>

              <div class="address-info">
                <div class="address-item">
                  <div>
                    <span class="distance" style="visibility: hidden">{{ calculateDistance(order.shopAddress) }}km</span>
                  </div>
                  <div class="address-detail">
                    <div class="address-title">{{order.shop}}</div>
                   </div>
                </div>
                <br>
                <div class="address-item">
                  <span class="distance">{{ calculateDistance(order.customerAddress) }}km</span>
                  <div class="address-detail">
                    <div class="address-title">{{ order.customerAddress.address }}</div>
                    <n-button text @click="showMap(order)">
                      <n-icon><map-outline /></n-icon>
                    </n-button>
                  </div>
                </div>
              </div>

              <div class="customer-info">
                <div class="phone-info">
                  <n-icon><call-outline /></n-icon>
                  <span>收货人手机号：{{formatPhone(order.customerPhone) }}</span>
                </div>
              </div>

              <div class="note-info collapsible" :class="{expanded: expandedNotes[order.id]}">
                <n-button text @click="toggleExpand(order.id, 'note')">
                  备注
                  <n-icon class="info-icon">
                    <chevron-down />
                  </n-icon>
                </n-button>
                <div class="note-detail" v-if="expandedNotes[order.id]">
                  {{ order.note || '无备注' }}
                </div>
              </div>

              <div class="action-buttons">
                <n-button @click="contactCustomer(order)">
                  <n-icon><call-outline /></n-icon>
                  联系
                </n-button>
                <n-button type="primary" @click="completeDelivery(order)">
                  送达
                </n-button>
              </div>
            </n-card>
          </n-list-item>            <n-empty v-if="!loading && deliveringOrders.length === 0" description="暂无配送中的订单" />
            <div v-if="loading" class="loading-more">
              <n-spin size="small" /> 加载中...
            </div>
            <div v-if="!loading && !hasMore && deliveringOrders.length > 0" class="no-more">
              没有更多订单了
            </div>
          </n-list>
      </n-tab-pane>
    </n-tabs>

    <n-modal v-model:show="showMapModalFlag" title="配送地图" style="width: 90%; max-width: 800px;">
      <delivery-map v-if="selectedOrder && showMapModalFlag"
        :start-longitude="selectedOrder.shop.longitude"
        :start-latitude="selectedOrder.shop.latitude"
        :current-longitude="riderLon"
        :current-latitude="riderLat"
        :end-longitude="selectedOrder.customerAddress.longitude"
        :end-latitude="selectedOrder.customerAddress.latitude"
      />
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { ChevronDown, MapOutline, CallOutline } from '@vicons/ionicons5'
import axios from 'axios'
import DeliveryMap from '../DeliveryMap.vue'
import { apiRoot } from '@/config/api'
import { useGeolocation } from '@/composables/useGeolocation'
import { useTokenStore } from '@/stores/token'

// 状态变量
const activeTab = ref('new')
const orders = ref([])
const loading = ref(false)
const message = useMessage()
const sliderValue = ref({})
const slidingOrderId = ref(null)
const showMapModalFlag = ref(false)
const selectedOrder = ref(null)
const expandedItems = ref({})
const expandedNotes = ref({})

// 分页相关
const currentPage = ref(0)
const pageSize = 10
const hasMore = ref(true)

const maxDistance = ref(undefined)
const maxTime = ref(undefined)
const minIncome = ref(undefined)
const riderLat = ref(undefined)
const riderLon = ref(undefined)

// 计算属性
const newOrders = computed(() => orders.value.filter(order => order.status === 'prepared'))
const deliveringOrders = computed(() => orders.value.filter(order => order.status === 'delivering'))

const tokenStore = useTokenStore()

// 获取订单列表
const fetchOrders = async (isLoadMore = false) => {
  if (loading.value || (!isLoadMore && !hasMore.value)) return

  try {
    loading.value = true
    const response = await axios.get(`${apiRoot}/recommended/orders`, {
      headers: {
        'Authorization': `Bearer ${tokenStore.token}`,
      },
      params: {
        p: currentPage.value,
        pn: pageSize,
        d: maxDistance.value,
        t: maxTime.value,
        m: minIncome.value ? minIncome.value / 100 : undefined,
        lat: riderLat.value,
        lon: riderLon.value
      }
    })

    const newOrders = response.data
    
    // 更新分页状态
    hasMore.value = newOrders.length === pageSize
    if (hasMore.value) {
      currentPage.value++
    }

    // 更新订单列表
    if (isLoadMore) {
      orders.value = [...orders.value, ...newOrders]
    } else {
      orders.value = newOrders
    }

    // 初始化新订单的状态
    newOrders.forEach(order => {
      if (!sliderValue.value[order.id]) {
        sliderValue.value[order.id] = 0
      }
      expandedItems.value[order.id] = false
      expandedNotes.value[order.id] = false
    })
  } catch (error) {
    message.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 新增筛选方法
const applyFilters = () => {
  resetAndFetch()
}

const geolocation = useGeolocation()

const getLocation = async () => {
  const location = await geolocation.getCurrentLocation()
  riderLon.value = location.longitude
  riderLat.value = location.latitude
}

// 重置分页并重新获取数据
const resetAndFetch = () => {
  currentPage.value = 1
  hasMore.value = true
  orders.value = []
  fetchOrders()
}
// 切换展开状态
const toggleExpand = (orderId, type) => {
  if (type === 'items') {
    expandedItems.value[orderId] = !expandedItems.value[orderId]
  } else {
    expandedNotes.value[orderId] = !expandedNotes.value[orderId]
  }
}

//滑块变化处理
const handleSliderChange = async (value, order) => {
  if (value >= 100 && slidingOrderId.value !== order.id) {
    slidingOrderId.value = order.id
    await takeOrder(order)
  }
}

// 滑块点击处理
const handleSliderClick = (order) => {
  if (sliderValue.value[order.id] < 100) {
    sliderValue.value[order.id] = 0
  }
}

// 接单方法
const takeOrder = async (order) => {
  try {
    await axios.patch(`/orders/${order.id}/status`, {status: 'delivering'})
    message.success('接单成功')
    order.status = 'delivering';
    sliderValue.value[order.id] = 0
    slidingOrderId.value = null} 
  catch {
    message.error('接单失败');
    sliderValue.value[order.id] = 0
    slidingOrderId.value = null
  }
}

// 计算总商品数量
const calculateTotalItems = (items) => {
  return items.reduce((total, item) => total + item.quantity, 0)
}

// 格式化地址
const formatAddress = (address) => {
  return `${address.province}${address.city}${address.district}${address.address}`
}

// 计算距离（模拟）
const calculateDistance = (address) => {
  // 这里需要根据实际情况计算距离，可能需要使用地图API
  return (Math.random() * 3+ 0.5).toFixed(1)
}

// 格式化配送时间需要接入api，但是我没找着是哪个api，如果这个功能不需要的话后续删除
const formatDeliveryTime = (order) => {
  const baseTime = order.status === 'prepared' ? 20 : 30
  const randomTime = Math.floor(Math.random() * 10)
  const totalMinutes = baseTime + randomTime
  return `${totalMinutes}分钟`
}
// 需要接入api，但是我没找着是哪个api，如果这个功能不需要的话后续删除
const formatLastDeliveryTime = (order) => {
  const baseTime = order.status === 'prepared' ? 20 : 30
  const randomTime = Math.floor(Math.random() * 10)
  const totalMinutes = baseTime + randomTime
  const now = new Date()
  const deliveryTime = new Date(now.getTime() + totalMinutes * 60000)
  return `(${deliveryTime.getHours().toString().padStart(2, '0')}:${deliveryTime.getMinutes().toString().padStart(2, '0')}前送达)`
}

// 格式化手机号
const formatPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 显示地图模态框
const showMap = (order) => {
  if (!riderLat.value || !riderLon.value) {
    message.warning('请先设置骑手位置')
    return
  }
  selectedOrder.value = order
  showMapModalFlag.value = true
}

// 联系客户
const contactCustomer = (order) => {
  message.info(`正在拨打客户电话：${formatPhone(order.customerAddress.tel)}`)
}

// 完成配送
const completeDelivery = async (order) => {
  try {
    await axios.patch(`/orders/${order.id}/status`, {status: 'finished'})
    message.success(`订单 ${order.id} 已送达`)
    orders.value = orders.value.filter(o => o.id !== order.id)} catch {
    message.error('更新订单状态失败')
  }
}

// 监听标签页切换
watch(activeTab, () => {
  resetAndFetch()
})

onMounted(() => {
  resetAndFetch()
})
</script>

<style scoped>
.recommend-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 16px;
}


.order-item {
  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}
.time-group {
  display: flex;
  gap: 4px;
}

.delivery-time {
  color: #ff6b6b;
  font-weight: bold;
  font-size: 16px;
}
.delivery-lasttime {
  color: #333;
  font-size: 16px;
  font-weight: bold;
}

.delivery-fee {
  color: #ff6b6b;
  font-weight: bold;
  font-size: 20px;
}

.address-info {
  margin-bottom: 12px;
}

.address-item {
  display: flex;
  margin-bottom: 8px;
}

.distance {
  color: #666;
  margin-right: 10px;
  min-width: 40px;
  font-size: 13px;
}

.address-detail {
  flex: 1;
}

.address-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 2px;
  font-weight: 500;
}

.address-content {
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.order-info {
  margin-bottom: 12px;
  font-size: 13px;
}

.info-line {
  margin-bottom: 8px;
}

.info-line.collapsible {
  cursor: pointer;
}

.info-line.collapsible:hover {
  background-color: #f9f9f9;
}

.info-line.collapsible.expanded {
  margin-bottom: 12px;
}

.status {
  color: #666;
  font-size: 13px;
}

.items-detail {
  padding: 8px 0 0 16px;
}

.item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 12px;
  color: #666;
}

.note-detail {
  padding: 8px 0 0 16px;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
}

.slide-container {
  position: relative;
  margin-top: 16px;
}

.slide-text {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 14px;
  color: #ff6b6b;
  pointer-events: none; 
}

.custom-thumb {
  width: 40px;
  height: 24px;
  border-radius: 12px;
  background-color: #ff6b6b; /* 改为橙色 */
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

:deep(.n-slider-rail) {
  background-color: #e0e0e0;
  height: 24px;
  border-radius: 12px;
}

:deep(.n-slider-fill) {
  background-color:#ffe5e5;
  height: 24px;
  border-radius: 12px;
}

.shop-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.shop-name {
  color: #333;
  font-weight: 500;
}

.customer-info {
  margin-bottom: 8px;
  font-size: 13px;
}

.phone-info {
  display: flex;
  align-items: center;
  color: #666;
  margin-top: 4px;
  font-size: 13px;
}

.phone-info .n-icon {
  margin-right: 4px;
}

.note-info {
  margin-bottom: 12px;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}

.action-buttons .n-button {
  flex: 1;
  margin: 0 4px;
}

.n-icon {
  vertical-align: middle;
}

.info-icon {
  margin-left: 4px;
  transition: transform 0.2s;
}

.collapsible.expanded .info-icon {
  transform: rotate(180deg);
}

.filter-sort-container {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-sort-container > * {
  flex: 1;
  min-width: 150px;
}

.check-icon {
  color: #4caf50;
}

.loading-more, .no-more {
  text-align: center;
  padding: 16px;
  color: #999;
  font-size: 14px;
}

.loading-more {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.no-more {
  border-top: 1px solid #f0f0f0;
}
</style>