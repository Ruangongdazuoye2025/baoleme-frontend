<template>
  <div>
    <n-page-header title="发现店铺" class="header">
      <template #extra>
        <n-input
          v-model:value="searchQuery"
          placeholder="搜索店铺"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <n-icon><SearchOutlined /></n-icon>
          </template>
        </n-input>
      </template>
      <n-tabs v-model:value="sortBy" type="line" @update:value="handleSortChange">
        <n-tab name="c">综合排序</n-tab>
        <n-tab name="r">评分最高</n-tab>
        <n-tab name="t">速度最快</n-tab>
      </n-tabs>
    </n-page-header>

    <div style="padding: 24px;">
        <n-infinite-scroll v-if="canRenderScroll" @load="loadMoreShops" :distance="100">
          <n-grid cols="1 s:2 m:3 l:4" responsive="screen" :x-gap="16" :y-gap="16">
              <n-gi v-for="shop in shops" :key="shop.id">
                <ShopCard :shop="shop" />
              </n-gi>
          </n-grid>

          <template #load-more>
            <div v-if="isLoading" class="loading-state">
              <n-spin size="small" />
              <span>加载中...</span>
            </div>
            <div v-if="!hasMore" class="loading-state">
              <span>没有更多店铺了</span>
            </div>
          </template>
        </n-infinite-scroll>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, onBeforeRouteLeave } from 'vue-router';
import { 
  NPageHeader, NInput, NIcon, NTabs, NTab, NGrid, NGi, 
  NInfiniteScroll, NSpin 
} from 'naive-ui';
import { SearchOutlined } from '@vicons/antd';
import { getRecommendedShops } from '@/api/recommend';
import { type RecommendedShop, type GetRecommendedShopsRequest, RecommendedShopsSortBy } from '@/types/recommend';
import ShopCard from '@/components/shop/ShopCard.vue';

const canRenderScroll = ref(true);

const route = useRoute();
const shops = ref<RecommendedShop[]>([]);
const searchQuery = ref((route.query.q as string) || '');
const sortBy = ref<GetRecommendedShopsRequest['s']>(RecommendedShopsSortBy.Comprehensive);
const page = ref(1);
const pageSize = 12;
const isLoading = ref(false);
const hasMore = ref(true);

const fetchShops = async (isNewSearch = false) => {
  if (isLoading.value) return;
  isLoading.value = true;

  try {
    const params: GetRecommendedShopsRequest = {
      p: page.value,
      pn: pageSize,
      q: searchQuery.value || undefined,
      s: sortBy.value,
    };
    const newShops = await getRecommendedShops(params);

    if (isNewSearch) {
      shops.value = newShops;
    } else {
      shops.value.push(...newShops);
    }

    if (newShops.length < pageSize) {
      hasMore.value = false;
    }

    page.value += 1;
  } catch (error) {
    console.error('获取店铺列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

const resetAndFetch = () => {
  page.value = 1;
  shops.value = [];
  hasMore.value = true;
};

const handleSearch = () => {
  resetAndFetch();
  fetchShops(true);
};

const handleSortChange = () => {
  resetAndFetch();
  fetchShops(true);
};

const loadMoreShops = () => {
  if (hasMore.value && !isLoading.value) {
    fetchShops();
  }
};

onMounted(() => {
  fetchShops(true);
});

onBeforeRouteLeave((to, from, next) => {
  // 立即将 v-if 的值设为 false
  canRenderScroll.value = false;
  // 允许路由跳转继续进行
  next();
});
</script>

<style scoped>
.header {
  padding: 0 24px;
  background-color: #fff;
  position: sticky;
  top: 0;
  z-index: 1;
}
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: #888;
  gap: 8px;
}
</style>