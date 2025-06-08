<template>
  <n-modal
    :show="show"
    preset="card"
    :style="{ width: '90%', maxWidth: '600px' }"
    :title="productDetail ? productDetail.name : '加载中...'"
    @update:show="$emit('update:show', $event)"
  >
    <div v-if="isLoading" class="loading-container">
      <n-spin size="large" />
    </div>
    <div v-else-if="productDetail && productDetail.cover" class="detail-container">
      <img
        :src="productDetail.cover.origin"
        class="detail-image"
      />
      <p class="detail-description">{{ productDetail.description }}</p>
      <n-space justify="space-between" class="detail-stats">
        <span>月售 {{ productDetail.sale }}</span>
        <n-rate readonly :default-value="productDetail.rating / 10" size="small" />
      </n-space>
      <n-divider />
      <n-space justify="space-between" align="center">
        <div>
          <span class="detail-price">¥{{ (productDetail.price / 100).toFixed(2) }}</span>
          <span v-if="productDetail.priceWithoutPromotion > productDetail.price" class="product-price-del">¥{{ (productDetail.priceWithoutPromotion / 100).toFixed(2) }}</span>
        </div>
        <n-button 
          type="primary" 
          @click="handleAddToCart"
          :disabled="productDetail.stockout"
        >
          <template #icon>
            <n-icon><PlusOutlined /></n-icon>
          </template>
          {{ productDetail.stockout ? '已售罄' : '加入购物车' }}
        </n-button>
      </n-space>
    </div>
    <div v-else class="empty-state">
      <p>无法加载商品详情，请稍后重试。</p>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
// 变更点：导入 PropType
import { ref, watch, type PropType } from 'vue';
import { NModal, NImage, NSpace, NButton, NIcon, NSpin, NRate, NDivider } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';
import { getProductDetail } from '@/api/product';
import type { ProductData } from '@/types/product';

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  // 变更点：修复错误 3，明确允许 productId 为 null
  productId: {
    type: String as PropType<string | null>,
    default: null,
  }
});

const emit = defineEmits(['update:show', 'add-to-cart']);

const productDetail = ref<ProductData | null>(null);
const isLoading = ref(false);

watch(() => props.show, async (isShown) => {
  if (isShown && props.productId) {
    isLoading.value = true;
    productDetail.value = null;
    try {
      const data = await getProductDetail(props.productId);
      
      if (props.show) {
        productDetail.value = data;
      }
    } catch (error) {
      console.error('获取商品详情失败:', error);
    } finally {
      if (props.show) {
        isLoading.value = false;
      }
    }
  }
});

const handleAddToCart = () => {
  if (productDetail.value) {
    emit('add-to-cart', productDetail.value.id);
  }
};
</script>

<style scoped>
.loading-container,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}
.detail-image {
  width: 100%;
  max-height: 300px;
  border-radius: 8px;
  margin-bottom: 16px;
}
.detail-description {
  font-size: 14px;
  color: #555;
  line-height: 1.6;
}
.detail-stats {
  margin: 16px 0;
  font-size: 14px;
  color: #888;
}
.detail-price {
  font-size: 24px;
  font-weight: bold;
  color: #ff4d4f;
}
.product-price-del {
  margin-left: 4px;
  text-decoration: line-through;
  color: #0000007f
}
</style>