<template>
  <n-list hoverable clickable>
    <n-list-item v-for="fav in visibleFavorites" :key="fav.item.id">
      <template #prefix>
        <n-avatar :src="fav.item.cover.thumbnail" />
      </template>
      <router-link :to="`/customer/shops/${fav.item.shopId}`" class="item-link">
        <n-thing :title="fav.item.name" :description="`¥${(fav.item.price / 100).toFixed(2)}`" />
      </router-link>
      <template #suffix>
        <n-button type="error" @click.stop="handleDelete(fav.item.id)">取消收藏</n-button>
      </template>
    </n-list-item>
    <n-empty v-if="visibleFavorites.length === 0" description="暂无收藏的商品" />
  </n-list>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NList, NListItem, NThing, NAvatar, NButton, NEmpty, useMessage } from 'naive-ui'
import { getItemFavorites, deleteItemFavorite } from '@/api/favorites'
import type { ItemFavoriteRecord } from '@/types/favorite'
import { RouterLink } from 'vue-router'

const favorites = ref<ItemFavoriteRecord[]>([])
const message = useMessage()

const fetchFavorites = async () => {
  try {
    favorites.value = await getItemFavorites(0, 100)
  } catch (error) {
    message.error('加载商品收藏失败')
  }
}

// 过滤掉不可用或缺货的商品
const visibleFavorites = computed(() =>
  favorites.value.filter(fav => fav.item.available && !fav.item.stockout)
)

const handleDelete = async (itemId: string) => {
  try {
    await deleteItemFavorite(itemId)
    message.success('已取消收藏')
    await fetchFavorites()
  } catch (error) {
    message.error('操作失败')
  }
}

onMounted(fetchFavorites)
</script>

<style scoped>
.item-link {
  text-decoration: none;
  color: inherit;
}
</style>