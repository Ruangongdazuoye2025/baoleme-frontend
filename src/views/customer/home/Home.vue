<template>
  <div class="home-container">
    <div class="search-bar">
      <n-space align="center" :size="12">
        <n-button quaternary circle @click="showLocationPicker = true">
          <n-icon size="18"><environment-outlined /></n-icon>
        </n-button>
        <div class="location-text" @click="showLocationPicker = true">
          {{ currentLocation }}
          <n-icon size="12"><down-outlined /></n-icon>
        </div>
      </n-space>
      <div class="search-input-wrapper" @click="router.push('/customer/search')">
        <n-icon size="16"><search-outlined /></n-icon>
        <n-input
          placeholder="搜索商家、美食"
          readonly
        />
        <n-button
          class="search-button"
          @click.stop="router.push('/customer/search')"
        >
          搜索
        </n-button>
      </div>
    </div>

    <div class="banner-wrapper">
      <n-carousel
        autoplay
        dot-type="line"
        show-arrow
        :interval="3000"
        class="banner"
      >
        <n-carousel-item v-for="(banner, index) in banners" :key="index">
          <img :src="banner.image" :alt="banner.title" class="banner-image" />
        </n-carousel-item>
      </n-carousel>
    </div>

    <div class="activity-cards">
      <div class="activity-card" v-for="(activity, index) in activities" :key="index">
        <div class="activity-content">
          <div class="activity-title">{{ activity.title }}</div>
          <div class="activity-desc">{{ activity.description }}</div>
        </div>
        <div class="activity-image">
          <img :src="activity.image" :alt="activity.title" />
        </div>
      </div>
    </div>

    <div class="section-title">
      <span>热门商家</span>
    </div>

    <div v-if="isLoadingShops" class="loading-state">
      <n-spin size="medium" />
      <p>正在加载热门商家...</p>
    </div>
    <div v-else-if="errorShops" class="error-state">
      <n-alert title="加载失败" type="error">{{ errorShops }}</n-alert>
    </div>
    <div v-else-if="recommendedShops.length > 0" class="store-list">
      <div class="store-item" v-for="shop in recommendedShops" :key="shop.id" @click="router.push(`/customer/shops/${shop.id}`)">
        <div class="store-image">
          <img :src="shop.cover.thumbnail" :alt="shop.name" />
        </div>
        <div class="store-info">
          <div class="store-name">{{ shop.name }}</div>
          <div class="store-rating">
            <n-rate readonly allow-half size="small" :value="shop.rating / 10" />
            <span class="rating-text">{{ (shop.rating / 10).toFixed(1) }}</span>
            <span class="monthly-sales">月售{{ shop.sale }}+</span>
          </div>
          <div class="store-delivery">
            <span class="delivery-fee">配送费¥{{ formatPrice(shop.deliveryPrice) }}</span>
            <span class="divider">|</span>
            <span class="delivery-time">{{ shop.time }}分钟</span>
          </div>
          <div class="store-tags">
            <n-tag size="small" :bordered="false" type="info">起送 ¥{{ formatPrice(shop.deliveryThreshold) }}</n-tag>
            <n-tag v-if="shop.recommends.length > 0" size="small" :bordered="false" type="warning">{{ shop.recommends[0].name }}</n-tag>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
        <n-empty description="附近暂无推荐商家"></n-empty>
    </div>
    <div class="section-title">
      <span>猜你喜欢</span>
    </div>

    <div v-if="isLoadingItems" class="loading-state">
        <n-spin size="medium" />
      <p>正在加载推荐商品...</p>
    </div>
      <div v-else-if="errorItems" class="error-state">
      <n-alert title="加载失败" type="error">{{ errorItems }}</n-alert>
    </div>
    <div v-else-if="recommendedItems.length > 0" class="recommendation-list">
      <div class="recommendation-item" v-for="item in recommendedItems" :key="item.id" @click="router.push(`/customer/shops/${item.shopId}`)">
        <div class="recommendation-image">
          <img :src="item.cover.thumbnail" :alt="item.name" />
        </div>
        <div class="recommendation-info">
          <div class="recommendation-name">{{ item.name }}</div>
          <div class="recommendation-price-sales">
            <div class="recommendation-price">¥{{ formatPrice(item.price) }}</div>
            <div class="recommendation-sales">已售{{ item.sale }}+</div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
        <n-empty description="暂无推荐商品"></n-empty>
    </div>
    
    <n-modal
      v-model:show="showLocationPicker"
      preset="card"
      title="选择收货地址"
      style="width: 90%; max-width: 500px;"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <div class="location-list">
        <div v-if="isLoadingAddresses" class="loading-state">
          <n-spin size="small" />
          <p>正在加载地址...</p>
        </div>

        <div v-else-if="errorAddresses" class="error-state">
          <n-alert title="加载失败" type="error" :show-icon="false">
            {{ errorAddresses }}
          </n-alert>
          <n-button @click="fetchUserAddresses" type="primary" secondary block class="retry-btn">
            点击重试
          </n-button>
        </div>
        
        <div v-else>
          <n-empty v-if="userAddresses.length === 0" description="您还没有添加过收货地址">
            <template #extra>
              <n-button type="primary" @click="router.push('/address/new')">
                立即添加
              </n-button>
            </template>
          </n-empty>

          <div v-else>
             <div class="location-header">
                <n-icon size="18"><pushpin-filled /></n-icon>
                <span>我的收货地址</span>
              </div>
              <div 
                v-for="address in userAddresses" 
                :key="address.id"
                class="location-item"
                @click="selectLocation(address)"
              >
                <div class="location-info">
                  <div class="location-name">
                    {{ address.name }}
                    <n-tag v-if="address.isDefault" size="small" type="success" :bordered="false">默认</n-tag>
                  </div>
                  <div class="location-details">
                    <span>{{ address.tel }}</span>
                  </div>
                  <div class="location-address">
                    {{ address.province }}{{ address.city }}{{ address.district }}{{ address.address }}
                  </div>
                </div>
                <n-button text @click.stop="router.push(`/address/${address.id}/edit`)">
                   <n-icon size="16"><edit-outlined /></n-icon>
                </n-button>
              </div>
          </div>
        </div>

        <n-button 
          v-if="!isLoadingAddresses && !errorAddresses && userAddresses.length > 0" 
          block 
          type="primary" 
          class="add-address-btn" 
          @click="router.push('/address/new')"
        >
          添加新地址
        </n-button>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { NIcon, NSpace, NButton, NInput, NCarousel, NCarouselItem, NCard, NRate, NTag, NModal, NSpin, NAlert, NEmpty } from 'naive-ui'
import { 
  EnvironmentOutlined, 
  DownOutlined, 
  SearchOutlined,
  PushpinFilled,
  EditOutlined, // 新增导入
} from '@vicons/antd'
import { getRecommendedShops, getRecommendedItems } from '@/api/recommend'
import type { RecommendedShop, RecommendedItem } from '@/types/recommend'
import { getAddresses } from '@/api/address'
import type { Address } from '@/types/address'

const router = useRouter()

// -- 修改地址相关状态 --
const userAddresses = ref<Address[]>([])
const isLoadingAddresses = ref(false)
const errorAddresses = ref<string | null>(null)
const currentLocation = ref('请选择收货地址') // 默认提示
const showLocationPicker = ref(false)

// 选择位置的函数，现在接收一个完整的地址对象
const selectLocation = (address: Address) => {
  currentLocation.value = address.name
  // 后续可以考虑将选中的地址信息存入 Pinia store 或 emit 出去
  showLocationPicker.value = false
}

// 获取地址列表的函数
const fetchUserAddresses = async () => {
  isLoadingAddresses.value = true
  errorAddresses.value = null
  try {
    const addresses = await getAddresses()
    userAddresses.value = addresses

    // 如果有地址，默认选中“默认地址”或第一个地址
    if (addresses.length > 0) {
      const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0]
      currentLocation.value = defaultAddress.name
    } else {
      currentLocation.value = '无可用地址'
    }
  } catch (e) {
    console.error('获取地址列表失败:', e)
    errorAddresses.value = '无法加载您的地址列表，请稍后重试。'
    currentLocation.value = '加载地址失败'
  } finally {
    isLoadingAddresses.value = false
  }
}

// ########## API数据、加载和错误状态 ##########
const recommendedShops = ref<RecommendedShop[]>([])
const recommendedItems = ref<RecommendedItem[]>([])
const isLoadingShops = ref(true)
const isLoadingItems = ref(true)
const errorShops = ref<string | null>(null)
const errorItems = ref<string | null>(null)

// 格式化价格（分 -> 元）
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

// 轮播图数据(保持不变)
const banners = ref([
  {
    title: "校园专享优惠",
    image: "https://placehold.co/600x200/FFF5F0/FF6B01?text=校园专享优惠"
  },
  {
    title: "新用户立减10元",
    image: "https://placehold.co/600x200/FFF5F0/FF6B01?text=新用户立减10元"
  },
  {
    title: "限时满减活动",
    image: "https://placehold.co/600x200/FFF5F0/FF6B01?text=限时满减活动"
  }
])

// 活动卡片数据(保持不变)
const activities = ref([
  {
    title: "新人专享",
    description: "首单立减8元",
    image: "https://placehold.co/100x100/FFF5F0/FF6B01?text=新人专享"
  },
  {
    title: "限时满减",
    description: "满30减31元",
    image: "https://placehold.co/100x100/FFF5F0/FF6B01?text=限时满减"
  }
])

// ########## 修改 onMounted, 添加数据获取逻辑 ##########
onMounted(async () => {
  // 首次进入页面时获取地址
  fetchUserAddresses()

  // 获取热门商家
  try {
    isLoadingShops.value = true
    recommendedShops.value = await getRecommendedShops({ p: 0, pn: 10, rc: 1 })
  } catch (e: any) {
    console.error('获取推荐店铺失败:', e)
    errorShops.value = '无法加载推荐商家，请检查网络后重试。'
  } finally {
    isLoadingShops.value = false
  }

  // 获取推荐商品
  try {
    isLoadingItems.value = true
    recommendedItems.value = await getRecommendedItems({ p: 0, pn: 10 })
  } catch (e: any) {
    console.error('获取推荐商品失败:', e)
    errorItems.value = '无法加载推荐商品，请检查网络后重试。'
  } finally {
    isLoadingItems.value = false
  }
})
</script>

<style scoped>
.home-container {
  padding-bottom: 60px; /* 为底部导航留出空间 */
}

/* 搜索栏样式 */
.search-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.location-text {
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  padding: 0 12px;
  margin-left: 10px;
}
.search-input-wrapper .n-icon {
  color: #999;
  margin-right: 8px;
}

.search-button {
  margin-left: 12px;
  background-color: #ff6b01;
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  height: 32px;
}

/* 轮播图样式 */
.banner-wrapper {
  margin: 12px 16px;
  border-radius: 8px;
  overflow: hidden;
}

.banner {
  height: 150px;
  border-radius: 8px;
}

.banner-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* 功能入口样式 */
.feature-entries {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  margin-bottom: 12px;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 25%;
}

.entry-icon {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.entry-text {
  font-size: 12px;
  color: #333;
}

/* 活动卡片样式 */
.activity-cards {
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 16px;
}

.activity-card {
  width: 48%;
  background-color: #fff5f0;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-title {
  font-size: 16px;
  font-weight: bold;
  color: #ff6b01;
  margin-bottom: 4px;
}

.activity-desc {
  font-size: 12px;
  color: #ff6b01;
}

.activity-image {
  width: 50px;
  height: 50px;
}

.activity-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

/* 章节标题样式 */
.section-title {
  padding: 0 16px;
  margin: 20px 0 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title span {
  font-size: 18px;
  font-weight: bold;
  position: relative;
  padding-left: 12px;
}

.section-title span:before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  background-color: #ff6b01;
  border-radius: 2px;
}

/* 商家列表样式 */
.store-list {
  padding: 0 16px;
}

.store-item {
  display: flex;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.store-image {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin-right: 12px;
  flex-shrink: 0;
}

.store-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.store-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.store-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 6px;
}

.store-rating {
  display: flex;
  align-items: center;
  font-size: 12px;
  margin-bottom: 6px;
}

.rating-text {
  margin: 0 4px 0 2px;
  color: #ff6b01;
}

.monthly-sales {
  color: #999;
}

.store-delivery {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.divider {
  margin: 0 6px;
}

.store-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* 推荐列表样式 */
.recommendation-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 0 16px;
}

.recommendation-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.recommendation-image {
  height: 120px;
  overflow: hidden;
}

.recommendation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommendation-info {
  padding: 8px;
}

.recommendation-name {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommendation-price-sales {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recommendation-price {
  font-size: 16px;
  color: #ff6b01;
  font-weight: bold;
}

.recommendation-sales {
  font-size: 12px;
  color: #999;
}


/* 位置选择模态框样式 */
.location-list {
  max-height: 60vh;
  overflow-y: auto;
}

.location-header {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 14px;
  margin: 12px 0;
}

.location-header span {
  margin-left: 6px;
}

.location-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background-color: #f9f9f9;
  margin-bottom: 12px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.3s;
}

.location-item:hover {
  border-color: #ff6b01;
}

.location-info {
  flex-grow: 1;
}

.location-name {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.location-details {
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}

.location-address {
  font-size: 13px;
  color: #999;
}

.add-address-btn {
  margin-top: 16px;
  background-color: #ff6b01;
}

/* 新增的加载、错误和空状态样式 */
.loading-state, .empty-state, .error-state {
    padding: 40px 16px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #999;
    font-size: 14px;
}
.loading-state p {
    margin-top: 8px;
}
.error-state {
    padding: 10px 16px;
}
.retry-btn {
  margin-top: 16px;
}
</style>