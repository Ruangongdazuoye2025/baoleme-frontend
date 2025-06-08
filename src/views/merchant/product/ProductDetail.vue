<template>
  <n-card :title="productData?.name || '商品详情'" v-if="!loading && productData">
    <n-descriptions label-placement="left" bordered :column="1">
      <n-descriptions-item label="商品ID">{{ productData.id }}</n-descriptions-item>
      <n-descriptions-item label="商品名称">{{ productData.name }}</n-descriptions-item>
      <n-descriptions-item label="商品描述">
        <n-text>{{ productData.description }}</n-text>
      </n-descriptions-item>
      <n-descriptions-item label="价格">
        ¥{{ (productData.price / 100).toFixed(2) }}
        <n-text v-if="productData.priceWithoutPromotion && productData.priceWithoutPromotion > productData.price" depth="3" delete style="margin-left: 8px;">
          ¥{{ (productData.priceWithoutPromotion / 100).toFixed(2) }}
        </n-text>
      </n-descriptions-item>
      <n-descriptions-item label="所属店铺ID">{{ productData.shopId }}</n-descriptions-item>
      <n-descriptions-item label="分类">
        <n-space>
          <n-tag v-for="catId in productData.categories" :key="catId" type="info" size="small">
            {{ categoryMap[catId] || catId }}
          </n-tag>
        </n-space>

      </n-descriptions-item>
      <n-descriptions-item label="销量">{{ productData.sale }}</n-descriptions-item>
      <n-descriptions-item label="评分">{{ (productData.rating / 10).toFixed(1) }} / 5.0</n-descriptions-item>
      <n-descriptions-item label="上架状态">
        <n-tag :type="productData.available ? 'success' : 'error'">
          {{ productData.available ? '已上架' : '已下架' }}
        </n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="库存状态">
        <n-tag :type="productData.stockout ? 'error' : 'warning'">
          {{ productData.stockout ? '缺货' : '有货' }}
        </n-tag>
      </n-descriptions-item>
      <n-descriptions-item label="创建时间">
        {{ new Date(productData.createdAt).toLocaleString() }}
      </n-descriptions-item>
      <n-descriptions-item label="商品封面">
        <n-image width="150" :src="productData.cover?.origin" :alt="productData.name" />
      </n-descriptions-item>
    </n-descriptions>

    <template #action>
      <n-space justify="end">
        <n-button @click="goBack">返回列表</n-button>
        <n-button type="primary" @click="goToEditPage">编辑商品</n-button>
      </n-space>
    </template>
  </n-card>

  <n-card v-else-if="loading" title="加载中...">
    <n-spin size="large" />
  </n-card>

  <n-card v-else title="错误">
    <n-empty description="无法加载商品详情，或商品不存在。" />
     <template #action>
      <n-button @click="goBack">返回列表</n-button>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NCard, NDescriptions, NDescriptionsItem, NImage, NTag, NSpin, NButton, useMessage, NSpace, NEmpty, NText } from 'naive-ui';
import { getProductDetail } from '@/api/product';
import { getShopItemCategories } from '@/api/category';
import type { ProductData } from '@/types/product';
import type { ItemCategory } from '@/types/category';

const route = useRoute();
const router = useRouter();
const message = useMessage();

const productId = ref<string | null>(null);
const productData = ref<ProductData | null>(null);
const loading = ref(false);
const categoryMap = ref<Record<string, string>>({});

productId.value = route.params.productId as string;

const fetchCategoriesForShop = async (shopId: string) => {
  try {
    const categories: ItemCategory[] = await getShopItemCategories(shopId);
    categoryMap.value = Object.fromEntries(categories.map(c => [c.id, c.name]));
  } catch (err) {
    message.error('获取商品分类失败');
    categoryMap.value = {};
  }
};

const fetchDetails = async () => {
  if (!productId.value) {
    message.error('无效的商品ID');
    return;
  }
  loading.value = true;
  try {
    const data = await getProductDetail(productId.value);
    productData.value = data;
    if (data.shopId) {
      await fetchCategoriesForShop(data.shopId);
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    message.error('获取商品详情失败');
    productData.value = null; // 清空数据以便显示错误状态
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetails();
});

const goToEditPage = () => {
  if (productId.value) {
    router.push({ name: 'MerchantProductEdit', params: { productId: productId.value } });
  }
};

const goBack = () => {
    // 尝试返回上一页，如果无法返回（比如直接打开的当前页），则导航到店铺的商品列表
    if (window.history.length > 2 && productData.value?.shopId) { // window.history.length > 1/2 判断是否有历史记录
        router.back();
    } else if (productData.value?.shopId) {
        router.push({ name: 'MerchantShopProductList', params: { shopId: productData.value.shopId } });
    } else {
        // Fallback, if shopId is not available for some reason
        router.push({ name: 'MerchantShopList' });
    }
};
</script>

<style scoped>
/* 组件特定样式 */
</style>