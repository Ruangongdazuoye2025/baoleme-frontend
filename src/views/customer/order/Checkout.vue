<template>
  <div class="checkout-container">
    <!--顶部导航栏 -->
    <div class="header">
      <n-icon size="24" class="back-icon" @click="router.back()">
        <arrow-left-outlined />
      </n-icon>
      <div class="title">确认订单</div>
      <div class="placeholder"></div>
    </div>

    <div class="checkout-content">
      <!-- 收货地址 -->
      <div class="section address-section" @click="handleSelectAddress">
        <template v-if="selectedAddress">
          <div class="address-content">
            <div class="address-icon">
              <n-icon size="24">
                <environment-outlined />
              </n-icon>
            </div>
            <div class="address-info">
              <div class="address-top">
                <span class="name">{{ selectedAddress.name }}</span>
                <span class="tel">{{ selectedAddress.tel }}</span>
              </div>
              <div class="address-detail">
                {{ formatAddress(selectedAddress) }}
              </div>
            </div>
            <div class="address-arrow">
              <n-icon>
                <right-outlined />
              </n-icon>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="no-address">
            <div class="no-address-text">请选择收货地址</div>
            <div class="address-arrow">
              <n-icon>
                <right-outlined />
              </n-icon>
            </div>
          </div>
        </template>
      </div>

      <!-- 店铺信息 -->
      <div class="section shop-section">
        <div class="shop-header">
          <div class="shop-name">{{ shopInfo.name }}</div>
        </div>
        
        <!-- 商品列表 -->
        <div class="cart-items">
          <div v-for="cartItem in cartItems" :key="cartItem.item.id" class="cart-item">
            <div class="item-image">
              <img :src="cartItem.item.cover.thumbnail" :alt="cartItem.item.name" />
            </div>
            <div class="item-info">
              <div class="item-header">
                <div class="item-name">{{ cartItem.item.name }}</div>
                <div class="item-price">
                  <span class="actual-price">¥{{ cartItem.item.price?.toFixed(2) }}</span>
                  <span class="original-price">¥{{ cartItem.item.priceWithoutPromotion.toFixed(2) }}</span>
                </div>
              </div>
              <div class="item-quantity">x{{ cartItem.quantity }}</div>
            </div>
          </div>
        </div>

        <!-- 配送费 -->
        <div class="fee-item">
          <span>配送费</span>
          <span>¥{{ shopInfo.deliveryPrice.toFixed(2) }}</span>
        </div>
        
        <!-- 订单总额 -->
        <div class="total-price">
          <span>订单总额</span>
          <span>¥{{ (cartInfo.total + shopInfo.deliveryPrice).toFixed(2) }}</span>
        </div>
      </div>

      <!-- 订单备注 -->
      <div class="section remark-section" @click="showRemarkModal = true">
        <div class="remark-row">
          <span class="remark-label">备注</span>
          <div class="remark-content">
            <span v-if="orderNote" class="remark-text">{{ orderNote }}</span>
            <span v-else class="placeholder">选填</span>
            <n-icon size="16" class="arrow-icon">
              <right-outlined />
            </n-icon>
          </div>
        </div>
      </div>

      <!-- 备注模态框 -->
      <n-modal v-model:show="showRemarkModal" preset="card" title="订单备注" class="remark-modal">
        <n-input
          v-model:value="orderNote"
          type="textarea"
          placeholder="请输入备注信息（如：不要辣、少盐等）"
          :autosize="{
            minRows: 4,
            maxRows: 6
          }"
          class="remark-input"
        />
        <div class="modal-footer">
          <n-button @click="showRemarkModal = false">取消</n-button>
          <n-button type="primary" @click="showRemarkModal = false">确定</n-button>
        </div>
      </n-modal>

      <!-- 支付方式 -->
      <div class="section payment-section">
        <div class="section-title">支付方式</div>
        <div class="section-content">
          <n-radio-group v-model:value="paymentMethod">
            <n-space vertical>
              <n-radio value="alipay">
                <div class="payment-option">
                  <n-icon size="20" color="#1677FF">
                    <alipay-circle-filled />
                  </n-icon>
                  <span>支付宝</span>
                </div>
              </n-radio>
              <n-radio value="wechat">
                <div class="payment-option">
                  <n-icon size="20" color="#07C160">
                    <wechat-filled />
                  </n-icon>
                  <span>微信支付</span>
                </div>
              </n-radio>
              <n-radio value="creditcard">
                <div class="payment-option">
                  <n-icon size="20" color="#FF6B01">
                    <credit-card-outlined />
                  </n-icon>
                  <span>银行卡</span>
                </div>
              </n-radio>
            </n-space>
          </n-radio-group>
        </div>
      </div>

      <!-- 底部提交栏（移动到支付方式下面） -->
      <div class="bottom-bar">
        <div class="total-section">
          <div class="total-amount">¥{{ (cartInfo.total + shopInfo.deliveryPrice).toFixed(2) }}</div>
        </div>
        <div class="submit-section">
          <n-button 
            type="primary" 
            :disabled="!canSubmit" 
            :loading="loading" 
            @click="handleSubmitOrder"
          >
            提交订单
          </n-button>
        </div>
      </div>
    </div>

    <!-- 确认支付弹窗 -->
    <n-modal v-model:show="showPaymentConfirmModal" preset="dialog" title="确认支付">
      <template #content>
        <p>您确定要支付这笔订单吗？</p></template>
      <template #action>
        <n-button @click="cancelPayment">取消</n-button>
        <n-button type="primary" @click="confirmPayment">去支付</n-button>
      </template>
    </n-modal>

    <!-- 地址选择模态框 -->
    <n-modal v-model:show="showAddressSelectModal" preset="card" title="选择收货地址" style="max-width: 500px;">
      <div style="max-height: 400px; overflow-y: auto;">
        <AddressSelect
          v-model:addressId="tempSelectedAddressId"
          style="min-width: 320px;"
        />
      </div>
      <template #footer>
        <n-space justify="end">
          <n-button @click="handleAddressSelectCancel">取消</n-button>
          <n-button type="primary" @click="handleAddressSelectConfirm">确定</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeftOutlined, 
  RightOutlined, 
  EnvironmentOutlined,
  WechatFilled,
  AlipayCircleFilled,
  CreditCardOutlined
} from '@vicons/antd'
import { getAddresses } from '@/api/address'
import { getCart, getCartItems } from '@/api/cart'
import { getShopInfo } from '@/api/shop'
import { createOrder ,updateOrderStatus } from '@/api/orders'
import type { Address } from '@/types/address'
import { useMessage } from 'naive-ui'
import type { CartItem } from '@/types/cart'
import { Status } from '@/types/order'
import AddressSelect from '@/views/customer/address/AddressSelect.vue'
const router = useRouter()
const route = useRoute()
const message = useMessage()

// 地址相关
const addresses = ref<Address[]>([])
const selectedAddress = ref<Address | null>(null)
const loading = ref(false)
const paymentMethod = ref('alipay')

// 购物车信息
const cartInfo = ref({
  total: 0,
  totalWithoutPromotion: 0,
  settlable: false
})

// 修改cartItems定义
const cartItems = ref<CartItem[]>([])

// 店铺信息
const shopInfo = ref({
  id: '',
  name: '',
  deliveryPrice: 0
})

// 是否可以提交订单
const canSubmit = computed(() => {
  return selectedAddress.value !== null && cartInfo.value.settlable
})

// 格式化地址
const formatAddress = (address: Address): string => {
  return `${address.province}${address.city}${address.district}${address.address}`
}

// TODO 跳转到地址选择页面
// const handleSelectAddress = () => {
//   router.push('/address/select')
// }

// 确认支付弹窗
const showPaymentConfirmModal = ref(false)
let createdOrderId = ''
// 提交订单
const handleSubmitOrder = async () => {
  
  if (!selectedAddress.value) {
    message.warning('请选择收货地址')
    return
  }
  loading.value = true
  try {
    
    const shopId = shopInfo.value.id
    const addressId = selectedAddress.value.id
    const note = orderNote.value || ''
    
    
    const result = await createOrder(shopId,addressId,note)
    if (result) {
      createdOrderId = result.id
      showPaymentConfirmModal.value = true
    } else {
      message.error('下单失败')
    }
  } catch (error) {
    message.error('下单失败');
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 取消支付
const cancelPayment = () => {
  showPaymentConfirmModal.value = false
  message.info('您可以稍后在订单列表中完成支付')
  router.push(`/orders/${createdOrderId}`) // 跳转到订单详情
}

// 确认支付
const confirmPayment = async () => {
  try {
    const result = await updateOrderStatus(createdOrderId,Status.Preparing)
    if (result) {
      message.success('支付成功')
      router.push(`/orders/${createdOrderId}`)
    } else {
      message.error('支付失败')
    }
  } catch (error) {
    message.error('支付失败')
    console.error(error)
  } finally {
    showPaymentConfirmModal.value = false
  }
}
// 加载地址列表
const loadAddresses = async () => {
  try {
    const data = await getAddresses()
    addresses.value = data
    const addressId = route.query.addressId as string
    if (addressId) {
      const address = addresses.value.find(addr => addr.id === addressId)
      if (address) {
        selectedAddress.value = address
      }
    } else {
      const defaultAddress = addresses.value.find(addr => addr.isDefault);
      if (defaultAddress) {
        selectedAddress.value = defaultAddress
      }
    }
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

// 加载购物车信息和商品列表
const loadCartInfo = async () => {
  try {
    const shopId = route.params.shopId as string
    const [cartData, cartItemsData, shopData] = await Promise.all([
      getCart(shopId),
      getCartItems(shopId),
      getShopInfo(shopId)
    ])
    // 金额单位分转元
    cartInfo.value = {
      ...cartData,
      total: (cartData.total || 0) / 100,
      totalWithoutPromotion: (cartData.totalWithoutPromotion || 0) / 100
    }
    cartItems.value = cartItemsData.map(item => ({
      ...item,
      item: {
        ...item.item,
        price: (item.item.price || 0) / 100,
        priceWithoutPromotion: (item.item.priceWithoutPromotion || 0) / 100
      }
    }))
    shopInfo.value = {
      ...shopData,
      deliveryPrice: (shopData.deliveryPrice || 0) / 100
    }
  } catch (error) {
    console.error('获取购物车信息失败:', error)
    message.error('获取购物车信息失败')
  }
}
const orderNote = ref('')
const showRemarkModal = ref(false)

// 地址选择模态框相关
const showAddressSelectModal = ref(false)
const tempSelectedAddressId = ref<string | null>(null)

const openAddressSelect = () => {
  tempSelectedAddressId.value = selectedAddress.value?.id || null
  showAddressSelectModal.value = true
}

const handleAddressSelectCancel = () => {
  showAddressSelectModal.value = false
}

const handleAddressSelectConfirm = () => {
  // 只在点击确定时同步到 selectedAddress 和 query
  const addr = addresses.value.find(addr => addr.id === tempSelectedAddressId.value)
  if (addr) {
    // 先判断 id 是否变化，变化才赋值，确保响应式
    if (!selectedAddress.value || selectedAddress.value.id !== addr.id) {
      selectedAddress.value = { ...addr }
      router.replace({ query: { ...route.query, addressId: addr.id } })
    }
  }
  showAddressSelectModal.value = false
}

onMounted(() => {
  loadAddresses()
  loadCartInfo()
})

// 修改 handleSelectAddress
const handleSelectAddress = () => {
  openAddressSelect()
}
</script>

<style scoped>
.checkout-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px; /* 调整内边距 */
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 16px;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.back-icon {
  cursor: pointer;
}

.title {
  font-size: 18px;
  font-weight: 500;
}

.placeholder {
  width: 24px;
}

.checkout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
}

.section {
  margin-bottom: 12px;
  background-color: #ffffff;
  padding: 16px;
}

.address-section {
  margin-top: 12px;
}

.address-content {
  display: flex;
  align-items: center;
}

.address-icon {
  margin-right: 12px;
  color: #ff6b01;
}

.address-info {
  flex: 1;
}

.address-top {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}

.name {
  font-weight: 500;
  margin-right: 8px;
}

.tel {
  color: #666;
}

.address-detail {
  font-size: 14px;
  color: #333;
  line-height: 1.4;
}

.address-arrow {
  margin-left: 12px;
  color: #999;
}

.no-address {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.no-address-text {
  font-size: 18px;
  color: #333;
  font-weight: 500
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.section-content {
  padding: 8px 0;
}

.shop-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.shop-name {
  font-size: 16px;
  font-weight: 500;
  color: #999;
}

.cart-items {
  margin-bottom: 16px;
}

.cart-item {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  margin-right: 12px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}
.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.item-name {
  font-size: 16px;
  flex: 1;
  margin-bottom: 8px;
}

.item-price {
  color: #ff6b01;
  font-weight: 500;
  font-size: 16px;
}
.item-quantity {
  color: #999;
  font-size: 14px;
}


.fee-item {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 8px 0;
  border-top: 1px solid #f5f5f5;
}

.total-price {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  padding: 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.payment-option {
  display: flex;
  align-items: center;
}

.payment-option span {
  margin-left: 8px;
}

.scheduled-time {
  margin-top: 12px;
}

.bottom-bar {
  display: flex;
  background-color: #ffffff;
  padding: 8px 16px;
  margin-top: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.total-section {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.total-amount {
  font-size: 20px;
  font-weight: 500;
  color: #ff6b01;
}

.submit-section {
  width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remark-section {
  cursor: pointer;
}

.remark-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remark-label {
  font-size: 16px;
  font-weight: 500;
}

.remark-content {
  display: flex;
  align-items: center;
  color: #666;
}

.remark-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
}

.placeholder {
  color: #999;
  margin-right: 8px;
  display: inline-block; 
  white-space: nowrap;   
}

.arrow-icon {
  color: #999;
}

.remark-modal {
  width: 90%;
  max-width: 500px;
}

.remark-input {
  margin: 10px 0 20px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.original-price {
  color: #999;
  text-decoration: line-through;font-size: 12px;
  margin-left: 4px;
}

.total-section {
  flex: 1;
  display: flex;
  align-items: center;
}

.total-amount {
  font-size: 20px;
  font-weight: 500;
  color: #ff6b01;
}

.submit-section {
  width: 120px;
}

.submit-section .n-button {
  width: 100%;
  height: 40px;
}
</style>