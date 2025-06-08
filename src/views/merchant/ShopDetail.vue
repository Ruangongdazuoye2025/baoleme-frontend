<template>
    <div class="shop-detail-page">
    <n-page-header :title="shop?.name || '店铺详情'" @back="goBack">
        <template #avatar>
        <n-avatar v-if="shop?.avatarUrl" :src="shop.avatarUrl" round :size="40" object-fit="cover" />
        <n-icon v-else :component="StorefrontOutline" :size="32" />
        </template>
        <template #extra>
        <n-space>
            <n-button type="primary" @click="handleEditShop">
            <template #icon><n-icon :component="CreateOutline" /></template>
            编辑店铺信息
            </n-button>
        </n-space>
        </template>
        <template #footer v-if="shop">
        <n-tabs v-model:value="currentTab" type="line" animated>
            <n-tab-pane name="overview" tab="店铺概览">
            </n-tab-pane>
            <n-tab-pane name="products" tab="商品管理">
            <ProductList :shop-id="shop?.id" v-if="shop" />
            </n-tab-pane>
            <n-tab-pane name="categories" tab="分类管理">
            <ShopItemCategoryView v-if="shop" :key="shop.id" />
            </n-tab-pane>
            <n-tab-pane name="orders" tab="订单处理">
              <ShopOrders v-if="shop" :shop-id="shop.id" />
            </n-tab-pane>
            <n-tab-pane name="statistics" tab="数据统计">
              <ShopStatistics v-if="shop" :shop-id="shop.id" />
            </n-tab-pane>
            </n-tabs>
        </template>
    </n-page-header>

    <div v-if="isLoading" class="loading-container">
        <n-spin size="large" />
        <p>正在加载店铺信息...</p>
    </div>

    <div v-else-if="!shop" class="empty-container">
        <n-empty description="未能找到该店铺信息。" size="huge" />
    </div>

    <div v-else class="shop-content-container">
        <div v-if="currentTab === 'overview'">
        <n-grid :x-gap="20" :y-gap="24" cols="1 s:1 m:2" responsive="screen">
            <n-gi>
            <n-card title="基本信息与状态" class="detail-card" :segmented="{ content: true }">
                <n-descriptions label-placement="left" bordered :column="1" size="small">
                <n-descriptions-item label="店铺ID">{{ shop.id }}</n-descriptions-item>
                <n-descriptions-item label="店铺名称">{{ shop.name }}</n-descriptions-item>
                <n-descriptions-item label="开业状态">
                    <n-tag :type="shop.opened ? 'success' : 'error'" round>
                    {{ shop.opened ? '营业中' : '休息中' }}
                    </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="认证状态">
                    <n-tag :type="shop.verified ? 'success' : 'warning'" round>
                    {{ shop.verified ? '已认证' : '未认证' }}
                    </n-tag>
                </n-descriptions-item>
                <n-descriptions-item label="营业时间 (每日)">
                    <span v-if="shop.openTimeStart !== null && shop.openTimeEnd !== null">
                    {{ utcMinutesToHHMM(shop.openTimeStart) }} - {{ utcMinutesToHHMM(shop.openTimeEnd) }}
                    </span>
                    <span v-else>未设置</span>
                </n-descriptions-item>
                <n-descriptions-item label="店铺简介">
                    <n-ellipsis expand-trigger="click" line-clamp="3" :tooltip="{ width: 300 }">
                    {{ shop.description || '店主很懒，什么都没留下...' }}
                    </n-ellipsis>
                </n-descriptions-item>
                </n-descriptions>
            </n-card>
            </n-gi>

            <n-gi>
            <n-card title="配送与费用" class="detail-card" :segmented="{ content: true }">
                <n-descriptions label-placement="left" bordered :column="1" size="small">
                <n-descriptions-item label="配送费用">
                    {{ shop.deliveryPrice !== null ? `¥${shop.deliveryPrice.toFixed(2)}` : '未设置' }}
                </n-descriptions-item>
                <n-descriptions-item label="起送价格">
                    {{ shop.deliveryThreshold !== null ? `¥${shop.deliveryThreshold.toFixed(2)}` : '未设置' }}
                </n-descriptions-item>
                <n-descriptions-item label="最远配送距离">
                    {{ shop.maximumDistance !== null ? `${shop.maximumDistance} 公里` : '未设置' }}
                </n-descriptions-item>
                <n-descriptions-item label="店铺类型">
                    <n-space v-if="shop.categories && shop.categories.length > 0">
                        <n-tag v-for="cat in shop.categories" :key="cat" type="info" round>
                        {{ formatCategory(cat) }}
                        </n-tag>
                    </n-space>
                    <span v-else>未设置</span>
                </n-descriptions-item>
                </n-descriptions>
            </n-card>
            </n-gi>

            <n-gi :span="2">
            <n-card title="地址与联系方式" class="detail-card" :segmented="{ content: true }">
                <n-descriptions label-placement="left" bordered :column="1" size="small">
                <n-descriptions-item label="联系人">{{ shop.address.name }}</n-descriptions-item>
                <n-descriptions-item label="联系电话">{{ shop.address.tel }}</n-descriptions-item>
                <n-descriptions-item label="省份">{{ shop.address.province }}</n-descriptions-item>
                <n-descriptions-item label="城市">{{ shop.address.city }}</n-descriptions-item>
                <n-descriptions-item label="区/县">{{ shop.address.district }}</n-descriptions-item>
                <n-descriptions-item v-if="shop.address.town" label="街道/乡镇">
                    {{ shop.address.town }}
                </n-descriptions-item>
                <n-descriptions-item label="详细地址">{{ shop.address.address }}</n-descriptions-item>
                <n-descriptions-item label="坐标 (经度, 纬度)">
                    {{ shop.address.coordinate[0] }}, {{ shop.address.coordinate[1] }}
                </n-descriptions-item>
                </n-descriptions>
                <div style="margin-top: 16px">
                <div
                    v-if="shop.address.coordinate[0] !== null && shop.address.coordinate[1] !== null"
                    id="shop-map-container"
                    style="height: 260px; width: 100%; border-radius: 8px; overflow: hidden;"
                ></div>
                </div>
            </n-card>
            </n-gi>
        </n-grid>
        </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
    NPageHeader, NSpace, NButton, NIcon, NAvatar, NCard, NDescriptions,
    NDescriptionsItem, NSpin, NEmpty, NTag, NGrid, NGi, NEllipsis,
    NTabs, NTabPane, NText, useMessage
} from 'naive-ui'
import {
    CreateOutline, StorefrontOutline, LocationOutline, CallOutline, StarOutline, // StarOutline 可以替换为其他相关图标
    // ArrowBackOutline // n-page-header自带返回
} from '@vicons/ionicons5'
import { getShopInfo, getShopCategories } from '@/api/shop'
import AMapLoader from '@amap/amap-jsapi-loader';
import ProductList from './product/ProductList.vue';
import ShopItemCategoryView from './ShopItemCategoryView.vue';
import ShopStatistics from './shop/ShopStatistics.vue';
import ShopOrders from './ShopOrders.vue';

// --- 复用 ShopEditForm.vue 中的数据模型定义 ---
interface 地址 {
    address: string;
    city: string;
    coordinate: [number | null, number | null];
    district: string;
    name: string;
    province: string;
    tel: string;
    town?: string;
}

// 店铺资料接口 (与 ShopEditForm.vue 中的 店铺资料Editable 类似，但这里是展示用)
interface 店铺资料 {
    id: string;
    name: string;
    description: string;
    avatarUrl?: string; // 注意：这里是 avatarUrl，对应编辑表单的字段
    opened: boolean;
    openTimeStart: number | null;
    openTimeEnd: number | null;
    deliveryPrice: number | null;
    deliveryThreshold: number | null;
    maximumDistance: number | null;
    categories: string[];
    address: 地址;
    verified: boolean;
    // 如果还有其他只读字段，如评分、创建时间等，可以加回来
    rating?: number; // 假设有评分
    createdAt?: string; // 假设有创建时间
}


const route = useRoute()
const router = useRouter()
const message = useMessage()

const shopId = computed(() => route.params.shopId as string)
const shop = ref<店铺资料 | null>(null) // 使用更新后的接口
const isLoading = ref(true)
const currentTab = ref('overview')
const validTabs = ['overview', 'products', 'categories', 'orders', 'statistics']

// 初始化时根据 hash 设置 tab
onMounted(() => {
  const hash = window.location.hash.replace('#', '')
  if (hash && validTabs.includes(hash)) {
    currentTab.value = hash
  }
})

watch(currentTab, (tab) => {
  if (tab) {
    window.location.hash = tab
  }
})

// 监听浏览器后退/前进，切换 tab
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '')
  if (hash && validTabs.includes(hash)) {
    currentTab.value = hash
  }
})

const categoryMap = ref<Record<string, string>>({});

// const mockShopDatabaseFromEdit: Record<string, 店铺资料> = { // 类型改为 店铺资料
//     'shop-1': {
//     id: 'shop-1', name: '创意轻食坊', description: '健康美味，沙拉与三明治首选。',
    // avatarUrl: 'https://picsum.photos/seed/shop-1/200/200',
    // opened: true, openTimeStart: 540, openTimeEnd: 1200,
    // deliveryPrice: 500, deliveryThreshold: 2000, maximumDistance: 3.0,
    // categories: ['fast_food', 'local_snacks'],
    // address: {
    //     name: '李经理', tel: '13800001111', province: '北京市', city: '北京市', district: '海淀区', town: '中关村街道',
    //     address: '宇宙中心五道口大厦101室', coordinate: [116.334935, 39.996249]
    // },
    // verified: true, rating: 4.8, createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    // },
//     'shop-2': {
//     id: 'shop-2', name: '甜蜜角落咖啡馆', description: '手冲咖啡与精致甜点。',
    // avatarUrl: 'https://picsum.photos/seed/shop-2/200/200',
    // opened: false, openTimeStart: 600, openTimeEnd: 1080,
    // deliveryPrice: 300, deliveryThreshold: 1500, maximumDistance: 2.0,
    // categories: ['dessert_drink'],
    // address: {
    //     name: '王老板', tel: '13911112222', province: '上海市', city: '上海市', district: '徐汇区',
    //     address: '衡山路123号', coordinate: [121.452323, 31.209175]
    // },
    // verified: false, rating: 4.2, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    // },
// };

// 模拟店铺类型选项 (与 ShopEditForm.vue 中保持一致，用于显示)
const categoryDisplayMap: Record<string, string> = {
    'fast_food': '快餐便当',
    'dessert_drink': '甜品饮品',
    'sichuan_hunan': '川湘菜',
    'local_snacks': '地方小吃',
    'japanese_korean': '日韩料理',
    'supermarket': '超市便利',
};


const fetchShopDetails = async (id: string) => {
    isLoading.value = true;
    try {
        const data = await getShopInfo(id);
        // 分转元
        data.deliveryPrice = typeof data.deliveryPrice === 'number' ? +(data.deliveryPrice / 100).toFixed(2) : 0;
        data.deliveryThreshold = typeof data.deliveryThreshold === 'number' ? +(data.deliveryThreshold / 100).toFixed(2) : 0;
        shop.value = JSON.parse(JSON.stringify(data));
    } catch (err) {
        shop.value = null;
        message.error('店铺信息加载失败或店铺不存在');
    }
    isLoading.value = false;
};

const fetchCategories = async () => {
    try {
        const categories = await getShopCategories();
        categoryMap.value = Object.fromEntries(categories.map(c => [c.id, c.name]));
    } catch {
        categoryMap.value = {};
    }
};

// --- 时间转换函数 ---
const utcMinutesToHHMM = (minutes: number | null): string => {
    if (minutes === null || minutes < 0 || minutes > 1439) return '未设置';
    const utc0 = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, 0));
    const local = new Date(utc0.getTime() + minutes * 60000);
    const h = local.getHours();
    const m = local.getMinutes();
    return `${h < 10 ? '0' + h : h}:${m < 10 ? '0' + m : m}`;
};

// 价格格式化 (分 -> 元)
// const formatPrice = (priceInCents: number | null): string => {
//     if (priceInCents === null || typeof priceInCents !== 'number') return '未设置';
//     return `¥${(priceInCents / 100).toFixed(2)}`;
// };

// 格式化分类显示
const formatCategory = (categoryKey: string): string => {
    return categoryMap.value[categoryKey] || categoryKey;
}

let map: any = null;
let AMap: any = null;

function renderShopMap() {
  if (!shop.value || shop.value.address.coordinate[0] == null || shop.value.address.coordinate[1] == null) return;
  const lng = shop.value.address.coordinate[0];
  const lat = shop.value.address.coordinate[1];
  if (!AMap) return;
  if (map) {
    map.destroy();
    map = null;
  }
  map = new AMap.Map('shop-map-container', {
    viewMode: '3D',
    zoom: 16,
    center: [lng, lat],
  });
  const marker = new AMap.Marker({
    position: [lng, lat],
    anchor: 'bottom-center',
  });
  map.add(marker);
}

onMounted(async () => {
  fetchCategories();
  if (shopId.value) {
      fetchShopDetails(shopId.value);
  } else {
      message.error('无效的店铺ID');
      isLoading.value = false;
  }

  // 加载高德地图API
  AMap = await AMapLoader.load({
    key: import.meta.env.VITE_AMAP_KEY,
    version: '2.0',
    plugins: ['AMap.Scale'],
  });
  // 地图渲染需等DOM ready
  watch(shop, async (val) => {
    if (val && val.address.coordinate[0] !== null && val.address.coordinate[1] !== null) {
      await nextTick();
      renderShopMap();
    }
  }, { immediate: true });
});

// 监听路由参数变化，如果 shopId 变了，重新加载数据
watch(() => route.params.shopId, (newId) => {
    if (newId && typeof newId === 'string') {
        fetchShopDetails(newId);
        currentTab.value = 'overview'; // 重置 Tab
    }
});


const goBack = () => {
    router.back();
};

const handleEditShop = () => {
    if (!shop.value) return;
    router.push(`/merchant/shops/edit/${shop.value.id}`);
};

// 解决切换 tab 回到概览页后地图消失的问题
watch(currentTab, async (tab) => {
  if (tab === 'overview' && shop.value && shop.value.address.coordinate[0] !== null && shop.value.address.coordinate[1] !== null) {
    await nextTick();
    renderShopMap();
  }
});

</script>

<style scoped>
.shop-detail-page {
    padding: 16px;
    background-color: #f8f8f8;
}

.n-page-header {
    background-color: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.loading-container, .empty-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    padding: 20px;
    color: var(--text-color2);
}
.loading-container p {
    margin-top: 10px;
}

.shop-content-container {
    margin-top: 20px;
}

.detail-card {
    margin-bottom: 20px; /* 在Grid布局中，y-gap会处理垂直间距，这里可以移除或保留作为独立卡片的间距 */
}

.n-descriptions .n-descriptions-item-label {
    font-weight: 500; /* 标签加粗一点点 */
    color: var(--n-text-color-secondary);
}
</style>