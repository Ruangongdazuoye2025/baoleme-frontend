<!-- src/views/customer/search/SearchResult.vue -->
<template>
  <div class="search-result-container">
  <!-- 搜索头部 -->
  <div class="search-header">
    <div class="header-row">
      <n-button quaternary circle @click="router.back()">
        <n-icon size="18"><arrow-left-outlined /></n-icon>
      </n-button>
      <div class="location-selector" @click="openLocationPicker">
        <n-icon size="18"><environment-filled /></n-icon>
        <span>{{ currentLocation }}</span>
        <n-icon size="12"><down-outlined /></n-icon>
      </div>
    </div>
    <div class="search-input-wrapper" @click="router.push('/customer/search')">
      <n-input
        v-model:value="searchText"
        placeholder="搜索商家、美食"
        readonly
      />
    </div>
  </div>

    <!-- 搜索过滤器 -->
    <div class="search-filters">
      <n-radio-group v-model:value="searchType" class="search-type-selector">
        <n-radio-button value="product">商品</n-radio-button>
        <n-radio-button value="shop">店铺</n-radio-button>
      </n-radio-group>
      
      <div class="filter-controls">
        <n-dropdown :options="sortOptions" @select="handleSortChange">
          <n-button quaternary size="small">
            {{ getCurrentSortLabel() }}
            <n-icon size="tiny"><down-outlined /></n-icon>
          </n-button>
        </n-dropdown>
        
        <n-button quaternary size="small" @click="showFilterModal = true">
          筛选
          <n-icon size="tiny"><filter-outlined /></n-icon>
        </n-button>
      </div>
    </div>

    <!-- 筛选弹窗 -->
    <n-modal v-model:show="showFilterModal" preset="card" title="筛选选项">
      <n-form :model="filterForm" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
        <n-form-item label="最低评分">
          <n-input-number v-model:value="filterForm.minRating" :min="0" :max="5" :step="0.1" />
        </n-form-item>
        <n-form-item v-if="searchType === 'product'" label="价格范围">
          <n-input-group>
            <n-input-number v-model:value="filterForm.minPrice" placeholder="最低价格" />
            <n-input-number v-model:value="filterForm.maxPrice" placeholder="最高价格" />
          </n-input-group>
        </n-form-item>
        <n-form-item v-if="searchType === 'shop'" label="最大距离(km)">
          <n-input-number v-model:value="filterForm.maxDistance" :min="0" :step="0.1" />
        </n-form-item>
        <n-form-item v-if="searchType === 'shop'" label="最长配送时间(分钟)">
          <n-input-number v-model:value="filterForm.maxDeliveryTime" :min="0" :step="1" />
        </n-form-item>
      </n-form>
        <template #footer>
      <div style="display: flex; justify-content: space-between; padding-top: 16px;">
        <n-button type="primary" @click="applyFilters">确定</n-button>
      </div>
    </template>
    </n-modal>


    <!-- 搜索结果 -->
    <div class="search-result">
      <div v-if="loading" class="loading-state">
        <n-spin size="large" />
      </div>
      <template v-else>
        <div v-if="searchType === 'product'">
          <div v-if="productResults.length === 0" class="empty-state">
            <n-empty description="您搜索的商品不存在" />
            <div class="recommendation-section">
              <div class="recommendation-title">为您推荐</div>
              <div class="result-list">
                <div 
                  v-for="product in recommendedProducts" 
                  :key="product.id"
                  class="result-item"
                  @click="handleProductClick(product)"
                >
                  <div class="item-image">
                    <img :src="product.cover.thumbnail || product.cover.origin" :alt="product.name" />
                  </div>
                  <div class="item-info">
                    <div class="item-name">{{ product.name }}</div>
                    <div class="item-description">{{ product.description }}</div>
                    <div class="item-price-sales">
                      <div class="item-price">¥{{ product.price }}</div>
                      <div class="item-sales">已售{{ product.sale }}+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="result-list">
            <div 
              v-for="product in productResults" 
              :key="product.id"
              class="result-item"
              @click="handleProductClick(product)"
            >
              <div class="item-image">
                <img :src="product.cover.thumbnail || product.cover.origin" :alt="product.name" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ product.name }}</div>
                <div class="item-description">{{ product.description }}</div>
                <div class="item-price-sales">
                  <div class="item-price">¥{{ product.price }}</div>
                  <div class="item-sales">已售{{ product.sale }}+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else>
          <div v-if="shopResults.length === 0" class="empty-state">
            <n-empty description="您搜索的店铺不存在" />
            <div class="recommendation-section">
              <div class="recommendation-title">为您推荐</div>
              <div class="result-list">
                <div 
                  v-for="shop in recommendedShops" 
                  :key="shop.id"
                  class="result-item shop-item"
                  @click="handleShopClick(shop)"
                >
                  <div class="item-image">
                    <img :src="shop.cover.thumbnail || shop.cover.origin" :alt="shop.name" />
                  </div>
                  <div class="item-info">
                    <div class="item-name">{{ shop.name }}</div>
                    <div class="item-description">{{ shop.description }}</div>
                    <div class="shop-details">
                      <div class="shop-rating">
                        <n-rate readonly size="small" :value="shop.rating" />
                        <span>{{ shop.rating }}</span>
                      </div>
                      <div class="shop-distance">{{ formatDistance(shop.distance) }}</div>
                      <div class="shop-time">{{ formatTime(shop.time) }}</div>
                    </div>
                    
                    <div v-if="shop.recommends && shop.recommends.length > 0" class="shop-recommends">
                      <div 
                        v-for="(product, idx) in shop.recommends" 
                        :key="product.id"
                        class="recommend-product"
                      >
                        <img :src="product.cover.thumbnail || product.cover.origin" :alt="product.name" />
                        <div class="recommend-price">¥{{ product.price }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="result-list">
            <div 
              v-for="shop in shopResults" 
              :key="shop.id"
              class="result-item shop-item"
              @click="handleShopClick(shop)"
            >
              <div class="item-image">
                <img :src="shop.cover.thumbnail || shop.cover.origin" :alt="shop.name" />
              </div>
              <div class="item-info">
                <div class="item-name">{{ shop.name }}</div>
                <div class="item-description">{{ shop.description }}</div>
                <div class="shop-details">
                  <div class="shop-rating">
                    <n-rate readonly size="small" :value="shop.rating" />
                    <span>{{ shop.rating }}</span>
                  </div>
                  <div class="shop-distance">{{ formatDistance(shop.distance) }}</div>
                  <div class="shop-time">{{ formatTime(shop.time) }}</div>
                </div>
                
                <div v-if="shop.recommends && shop.recommends.length > 0" class="shop-recommends">
                  <div 
                    v-for="(product, idx) in shop.recommends" 
                    :key="product.id"
                    class="recommend-product"
                  >
                    <img :src="product.cover.thumbnail || product.cover.origin" :alt="product.name" />
                    <div class="recommend-price">¥{{ product.price }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
    <!-- 位置选择模态框 -->
    <n-modal
      v-model:show="showLocationPicker"
      preset="card"
      title="选择收货地址"
      style="width: 90%; max-width: 500px;"
      :bordered="false"
      :segmented="{ content: true }"
    >
      <div class="location-list">
        <!-- 当前定位 -->
        <div class="location-header">
          <n-icon size="18"><environment-filled /></n-icon>
          <span>当前定位</span>
        </div>
        <div class="current-location-item" @click="selectAddress({
          id: 'current',
          name: '北京航空航天大学-学生宿舍区',
          address: '北京市海淀区学院路37号',
          province: '北京市',
          city: '北京市',
          district: '海淀区',
          isDefault: false,
          tel: '13888888888',
          coordinate: [116.397428, 39.908569],
        })">
          <div class="location-name">北京航空航天大学-学生宿舍区</div>
          <div class="location-address">北京市海淀区学院路37号</div>
        </div>
        
        <!-- 收货地址列表 -->
        <div class="location-header">
          <n-icon size="18"><pushpin-filled /></n-icon>
          <span>收货地址</span>
        </div>
        <div 
          v-for="address in addressList" 
          :key="address.id"
          class="address-item"
          @click="selectAddress(address)"
        >
          <div class="address-info">
            <div class="address-name">{{ address.name }}</div>
            <div class="address-detail">{{ address.address }}</div>
          </div>
          <n-tag v-if="address.isDefault" size="small" type="success">默认</n-tag>
          <n-icon v-if="currentLocation === `${address.province}${address.city}${address.district}${address.address}`" size="16" class="check-icon">
            <check-circle-filled />
          </n-icon>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeftOutlined, 
  DownOutlined, 
  FilterOutlined, 
  EnvironmentOutlined,
  EnvironmentFilled,
  PushpinFilled,
  CheckCircleFilled
} from '@vicons/antd'
import { getRecommendedItems } from '@/api/recommend'
import { getRecommendedShops } from '@/api/recommend'
import { getAddresses } from '@/api/address'
import type { RecommendedItem as RecommendedProduct, RecommendedShop } from '@/types/recommend'
import type { Address } from '@/types/address'
import InfiniteScrollList from '@/components/common/InfiniteScrollList.vue'

const router = useRouter()
const route = useRoute()
const searchText = ref(route.query.keyword as string || '')
const loading = ref(false)
const searchType = ref<'product' | 'shop'>('product')
const showFilterModal = ref(false)
const filterForm = reactive({
  category: null as string | null,
  minRating: null as number | null,
  minPrice: null as number | null,
  maxPrice: null as number | null,
  maxDistance: null as number | null,
  maxDeliveryTime: null as number | null,
  addressId: null as string | number | null,
})
// 结果列表
const productResults = ref<RecommendedProduct[]>([])
const shopResults = ref<RecommendedShop[]>([])
const recommendedProducts = ref<RecommendedProduct[]>([])
const recommendedShops = ref<RecommendedShop[]>([])
const showLocationPicker = ref(false)
const addressList = ref<Address[]>([])

// 分页相关
const isProductListFinished = ref(false)
const isShopListFinished = ref(false)
const pageSize = 20

// 获取地址列表
const loadAddresses = async () => {
  try {
    addressList.value = await getAddresses()
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

// 选择地址
const selectAddress = (address: Address) => {
  currentLocation.value = `${address.address}`
  filterForm.addressId = address.id
  showLocationPicker.value = false
  // 重新搜索
  searchContent()
}

// 打开地址选择器
const openLocationPicker = () => {
  loadAddresses()
  showLocationPicker.value = true
}

// 分页参数
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 过滤和排序选项
const sortOption = ref<string>('default')
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)
const minRating = ref<number | null>(null)
const categories = ref<string[]>([])
const currentLocation = ref('选择收货地址')
const sortOptions = [
  { label: '默认排序', key: 'default' },
  { label: '销量优先', key: 'sale' },
  { label: '评分优先', key: 'rating' },
  { label: '价格从低到高', key: 'price_asc' },
  { label: '价格从高到低', key: 'price_desc' }
]
// 格式化距离
const formatDistance = (distance: number) => {
  if (!distance) return '未知距离'
  if (distance < 1000) {
    return `${distance}m`
  }
  return `${(distance / 1000).toFixed(1)}km`
}

// 格式化配送时间
const formatTime = (time: number) => {
  if (!time) return '未知时间'
  return `${time}分钟`
}
// 处理排序变更
const handleSortChange = (key: string) => {
  sortOption.value = key
  searchContent()
}

// 应用筛选条件
const applyFilters = () => {
  showFilterModal.value = false
  searchContent()
}
// 获取当前排序方式的标签
const getCurrentSortLabel = () => {
  const option = sortOptions.find(option => option.key === sortOption.value)
  return option ? option.label : '默认排序'
}

// 处理商品点击
const handleProductClick = (product: RecommendedProduct) => {
  router.push(`/customer/shops/${product.shopId}?product=${product.id}`)
}
// 选择位置
const selectLocation = (location: string) => {
  currentLocation.value = location
  showLocationPicker.value = false
}
// 处理店铺点击
const handleShopClick = (shop: RecommendedShop) => {
  router.push(`/customer/shops/${shop.id}`)
}

//搜索内容
const searchContent = async () => {
  loading.value = true
  // 重置分页状态
  isProductListFinished.value = false
  isShopListFinished.value = false
  productResults.value = []
  shopResults.value = []
  
  try {
    const params: any = {
      q: searchText.value.trim(),
      p: 1,
      pn: pageSize,
      s: sortOption.value !== 'default' ? sortOption.value : undefined,
      c: filterForm.category,
      r: filterForm.minRating,
      a: filterForm.addressId,
    }
    if (searchType.value === 'product') {
      if (filterForm.minPrice !== null) params.min_p = filterForm.minPrice
      if (filterForm.maxPrice !== null) params.max_p = filterForm.maxPrice
      const data = await getRecommendedItems(params)
      productResults.value = data
      isProductListFinished.value = data.length < pageSize
      
      if (data.length === 0 && !params.q) {
        recommendedProducts.value = await getRecommendedItems({ pn: 10 })
      }
    } else {
      if (filterForm.maxDistance !== null) params.d = filterForm.maxDistance
      if (filterForm.maxDeliveryTime !== null) params.t = filterForm.maxDeliveryTime
      params.rc = 3 // 获取3个推荐商品
      
      const data = await getRecommendedShops(params)
      shopResults.value = data
      isShopListFinished.value = data.length < pageSize
      
      if (data.length === 0 && !params.q) {
        recommendedShops.value = await getRecommendedShops({ pn: 5, rc: 3 })
      }
    }
  } catch (error) {
    console.error('获取搜索结果失败', error)
  } finally {
    loading.value = false
  }
}

// 加载更多
const loadMore = async () => {
  if (loading.value) return

  const currentPage = Math.floor(
    (searchType.value === 'product' ? productResults.value.length : shopResults.value.length) / pageSize
  ) + 1

  try {
    loading.value = true
    const params: any = {
      q: searchText.value.trim(),
      p: currentPage,
      pn: pageSize,
      s: sortOption.value !== 'default' ? sortOption.value : undefined,
      c: filterForm.category,
      r: filterForm.minRating,
      a: filterForm.addressId,
    }

    if (searchType.value === 'product') {
      if (filterForm.minPrice !== null) params.min_p = filterForm.minPrice
      if (filterForm.maxPrice !== null) params.max_p = filterForm.maxPrice
      const data = await getRecommendedItems(params)
      productResults.value = [...productResults.value, ...data]
      isProductListFinished.value = data.length < pageSize
    } else {
      if (filterForm.maxDistance !== null) params.d = filterForm.maxDistance
      if (filterForm.maxDeliveryTime !== null) params.t = filterForm.maxDeliveryTime
      params.rc = 3 // 获取3个推荐商品
      
      const data = await getRecommendedShops(params)
      shopResults.value = [...shopResults.value, ...data]
      isShopListFinished.value = data.length < pageSize
    }
  } catch (error) {
    console.error('加载更多失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听路由参数变化
watch(
  () => route.query.keyword,
  (newKeyword) => {
    if (newKeyword) {
      searchText.value = newKeyword as string
      searchContent()
    }
  },
  { immediate: true }
)

// 监听搜索类型变化
watch(searchType, () => {
  // 重置筛选条件和分页状态
  sortOption.value = 'default'
  minPrice.value = null
  maxPrice.value = null
  minRating.value = null
  categories.value = []
  isProductListFinished.value = false
  isShopListFinished.value = false
  productResults.value = []
  shopResults.value = []
  searchContent()
})

// 组件挂载时获取初始数据
onMounted(async () => {
  await loadAddresses() // 加载地址列表
  if (addressList.value.length > 0) {
    const defaultAddress = addressList.value.find(a => a.isDefault) || addressList.value[0];
    currentLocation.value = defaultAddress.address;
    filterForm.addressId = defaultAddress.id;
  }
  searchContent()
})
</script>

<style scoped>
.search-result-container {
  min-height: 100vh;
  background-color: #fff;
}

.search-header {
  display: flex;
  align-items: column;
  padding: 12px 16px;
  background-color: #fff;
}

.header-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.location-selector {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  margin-left: 12px;
}

.location-selector .n-icon {
  margin-right: 4px;
}

.location-selector span {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-input-wrapper {
  width: 100%;
}
.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  padding: 0 12px;
  margin-left: 12px;
  cursor: pointer;
}

.search-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.search-type-selector {
  margin-right: 8px;
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.search-result {
  padding: 16px;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.recommendation-section {
  width: 100%;
  margin-top: 24px;
}

.recommendation-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-item {
  display: flex;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.shop-item {
  flex-direction: column;
}

.shop-item .item-image {
  width: 100%;
  height: 140px;
}

.item-image {
  width: 120px;
  height: 120px;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}

.item-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.item-price-sales {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-price {
  font-size: 16px;
  color: #ff6b01;
  font-weight: bold;
}

.item-sales {
  font-size: 12px;
  color: #999;
}

.shop-details {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin: 8px 0;
}

.shop-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}

.shop-recommends {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  overflow-x: auto;
}

.recommend-product {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  flex-shrink: 0;
}

.recommend-product img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recommend-price {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  padding: 2px 4px;
  text-align: center;
}

.location-list {
  max-height: 400px;
  overflow-y: auto;
}

.location-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9f9f9;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: #333;
}

.current-location-item {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background-color: #fff;
  border-radius: 8px;
  margin: 8px 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.location-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.location-address {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.address-item:last-child {
  border-bottom: none;
}

.address-info {
  flex: 1;
}

.address-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.address-detail {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.check-icon {
  color: #4caf50;
}
</style>