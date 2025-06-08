<template>
  <div class="shop-view-container">
    <div class="header-section">
      <n-image
        v-if="shopInfo?.cover.origin"
        :src="shopInfo.cover.origin"
        class="shop-banner"
        object-fit="cover"
      />
      <n-page-header :title="shopInfo?.name || '加载中...'" @back="goBack" class="page-header" />
    </div>
    
    <n-layout has-sider class="main-layout">
      <n-layout-sider bordered width="100" class="category-sider">
        <n-menu
          :options="categoryMenuOptions"
          v-model:value="activeCategory"
          @update:value="handleCategoryClick"
        />
      </n-layout-sider>

      <n-layout-content ref="contentRef" class="product-content" @scroll="handleScroll">
        <div v-if="isLoading" class="loading-container">
          <n-spin size="large" />
        </div>
        <div v-else>
          <div v-for="group in categoryGroups" :key="group.id">
            <h3 class="category-title" :ref="el => setCategoryTitleRef(el, group.id)">
              {{ group.name }}
            </h3>
            <div v-if="group.products.length > 0">
              <ProductListItem
                v-for="product in group.products"
                :key="product.id"
                :product="product"
                :quantity="cartStore.itemQuantity(product.id)"
                @item-click="handleItemClick"
                @add-to-cart="cartStore.addItem(product.id)"
                @remove-from-cart="cartStore.removeItem(product.id)"
              />
            </div>
            <n-empty v-else :description="`该分类下暂无商品`" class="category-empty" />
          </div>
        </div>
      </n-layout-content>
    </n-layout>
    
    <div class="cart-bar" @click="showCartDrawer = true">
      <n-badge :value="cartStore.totalItemsCount" :max="99" class="cart-badge">
        <n-icon :component="CartOutline" size="28" />
      </n-badge>
      <div class="cart-price">
        <div class="cart-total">¥{{ (cartStore.totalPrice / 100).toFixed(2) }}</div>
        另需配送费 ¥{{ shopInfo ? (shopInfo.deliveryPrice / 100).toFixed(2) : '0.00' }}{{ shopInfo && cartStore.totalPrice + shopInfo.deliveryPrice < shopInfo.deliveryThreshold ? `，距起送金额还差¥${((shopInfo.deliveryThreshold - cartStore.totalPrice - shopInfo.deliveryPrice) / 100).toFixed(2)}` : '' }}
      </div>
      <n-button 
        type="primary"
        size="medium"
        :disabled="!cartStore.info?.settlable"
        @click.stop="goToCheckout"
      >
        去结算
      </n-button>
    </div>

    <ProductDetailModal
      v-model:show="showDetailModal"
      :product-id="selectedProductId"
    />

    <CartView v-model:show="showCartDrawer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, type ComponentPublicInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { NPageHeader, NImage, NLayout, NLayoutSider, NLayoutContent, NMenu, NSpin, NEmpty, useMessage, NBadge, NIcon, NButton } from 'naive-ui';
import { CartOutline } from '@vicons/ionicons5';
import ProductListItem from '@/components/product/ProductListItem.vue';
import ProductDetailModal from '@/components/product/ProductDetailModal.vue';
import CartView from '@/components/cart/CartView.vue';
import { useCartStore } from '@/stores/cart';
import { getShopInfo } from '@/api/shop';
import { getShopAllProducts } from '@/api/product';
import { getShopItemCategories } from '@/api/category.ts';
import type { ShopInfo } from '@/types/shop';
import type { ProductData } from '@/types/product';
import type { ItemCategory } from '@/types/category';
import type { MenuOption } from 'naive-ui';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const shopId = route.params.shopId as string;
const cartStore = useCartStore();

const isLoading = ref(true);
const shopInfo = ref<ShopInfo | null>(null);
const categories = ref<ItemCategory[]>([]);
const products = ref<ProductData[]>([]);

const activeCategory = ref<string | null>(null);
const contentRef = ref<InstanceType<typeof NLayoutContent> | null>(null);
const categoryTitleRefs = ref<Record<string, HTMLElement>>({});
const setCategoryTitleRef = (el: Element | ComponentPublicInstance | null, id: string) => {
  if (el) categoryTitleRefs.value[id] = el as HTMLElement;
}
const isScrollingProgrammatically = ref(false);
const showDetailModal = ref(false);
const selectedProductId = ref<string | null>(null);
const showCartDrawer = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    // 并行获取店铺信息、分类和所有商品
    const [shopData, categoriesData, productsData] = await Promise.all([
      getShopInfo(shopId),
      getShopItemCategories(shopId),
      getShopAllProducts(shopId)
    ]);

    shopInfo.value = shopData;
    categories.value = categoriesData;
    products.value = productsData.filter(p => p.available);

    if (categoriesData.length > 0) {
      activeCategory.value = categoriesData[0].id;
    }

    // 加载该店铺的购物车信息
    cartStore.loadCart(shopId);

  } catch (error) {
    console.error("加载店铺数据失败:", error);
    message.error("加载店铺信息失败，请稍后重试。");
  } finally {
    isLoading.value = false;
  }
});

const categoryMenuOptions = computed((): MenuOption[] => 
  categories.value.map(cat => ({ label: cat.name, key: cat.id }))
);

const categoryGroups = computed(() => {
  const categoryMap: Record<string, { id: string; name: string; products: ProductData[] }> = {};
  for (const cat of categories.value) {
    categoryMap[cat.id] = { ...cat, products: [] };
  }

  for (const product of products.value) {
    for (const catId of product.categories) {
      if (categoryMap[catId]) {
        categoryMap[catId].products.push(product);
      }
    }
  }
  return Object.values(categoryMap);
});

const handleCategoryClick = (key: string) => {
  const targetEl = categoryTitleRefs.value[key];
  if (targetEl) {
    isScrollingProgrammatically.value = true;
    targetEl.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      isScrollingProgrammatically.value = false;
    }, 800);
  }
};

const handleScroll = () => {
  if (isScrollingProgrammatically.value) return;
  const scrollContainer = contentRef.value?.$el;
  if (!scrollContainer) return;
  const containerTop = scrollContainer.getBoundingClientRect().top;
  
  for (let i = categoryGroups.value.length - 1; i >= 0; i--) {
    const group = categoryGroups.value[i];
    const titleEl = categoryTitleRefs.value[group.id];
    if (titleEl && titleEl.getBoundingClientRect().top <= containerTop + 1) {
      if (activeCategory.value !== group.id) {
        activeCategory.value = group.id;
      }
      break;
    }
  }
};

const handleItemClick = (productId: string) => {
  selectedProductId.value = productId;
  showDetailModal.value = true;
};

const goToCheckout = () => {
  if (cartStore.info?.settlable) {
    router.push({ name: 'Checkout', params: { shopId } });
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.shop-view-container { display: flex; flex-direction: column; height: 100vh; background-color: #fff; overflow: hidden; }
.header-section { flex-shrink: 0; }
.shop-banner { width: 100%; height: 120px; }
.page-header { border-bottom: 1px solid #eee; }
.main-layout { flex-grow: 1; overflow: hidden; }
.category-sider { height: 100%; overflow-y: auto; background-color: #f8f8f8; }
.product-content { height: 100%; overflow-y: auto; padding: 0 16px; }
.category-title { padding: 16px 0 8px 0; font-size: 16px; font-weight: 600; position: sticky; top: 0; background-color: #fff; z-index: 1; }
.category-empty { padding: 40px 0; }
.cart-bar { flex-shrink: 0; height: 60px; background-color: #4a4a4a; color: #fff; display: flex; align-items: center; padding: 0 16px; justify-content: space-between; }
.cart-badge { color: #fff; }
.cart-price { margin-left: 16px; flex-grow: 1; }
.cart-total { font-size: 18px; font-weight: bold; }
.loading-container { display: flex; justify-content: center; align-items: center; height: 100%; }
</style>