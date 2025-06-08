<template>
  <div class="product-list-item" @click="handleItemClick">
    <n-image
      :src="product.cover.thumbnail"
      class="product-image"
      lazy
      object-fit="cover"
    >
      <template #placeholder>
        <div class="image-placeholder">
          <n-spin size="small" />
        </div>
      </template>
    </n-image>

    <div class="product-info">
      <n-h4 class="product-name">{{ product.name }}</n-h4>
      <p class="product-description">{{ product.description }}</p>
      <p class="product-sale">月售 {{ product.sale }} 评分 {{ (product.rating / 10).toFixed(1) }}</p>
      <n-space justify="space-between" align="center" class="product-footer">
        <div>
          <span class="product-price">¥{{ (product.price / 100).toFixed(2) }}</span>
          <span v-if="product.priceWithoutPromotion > product.price" class="product-price-del">¥{{ (product.priceWithoutPromotion / 100).toFixed(2) }}</span>
        </div>
        <n-button v-if="product.stockout" size="small" disabled>
          已售罄
        </n-button>
        <n-button v-else type="primary" size="small" circle @click.stop="handleAddToCart">
          <template #icon>
            <n-icon><PlusOutlined /></n-icon>
          </template>
        </n-button>
      </n-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { NImage, NSpace, NButton, NIcon, NH4, NSpin } from 'naive-ui';
import { PlusOutlined } from '@vicons/antd';
import type { ProductData } from '@/types/product';

const props = defineProps({
  product: {
    type: Object as PropType<ProductData>,
    required: true
  }
});

const emit = defineEmits(['item-click', 'add-to-cart']);

// 点击整个商品项
const handleItemClick = () => {
  emit('item-click', props.product.id);
};

// 点击加号按钮
const handleAddToCart = () => {
  emit('add-to-cart', props.product.id);
};
</script>

<style scoped>
.product-list-item {
  display: flex;
  padding: 12px 0;
  cursor: pointer;
}
.product-image {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  margin-right: 12px;
  flex-shrink: 0;
}
.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  border-radius: 8px;
}
.product-info {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  min-width: 0; /* 防止 flex 布局溢出 */
}
.product-name {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-description,
.product-sale {
  font-size: 12px;
  color: #888;
  margin: 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.product-footer {
  margin-top: auto; /* 将价格和按钮推到底部 */
}
.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4d4f;
}
.product-price-del {
  margin-left: 4px;
  text-decoration: line-through;
  color: #0000007f
}
</style>