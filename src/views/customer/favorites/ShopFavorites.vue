<template>
  <n-list hoverable clickable>
    <n-list-item v-for="fav in visibleFavorites" :key="fav.shop.id">
      <template #prefix>
        <n-avatar :src="fav.shop.cover.thumbnail" />
      </template>
       <router-link :to="`/customer/shops/${fav.shop.id}`" class="shop-link">
        <n-thing :title="fav.shop.name" :description="fav.shop.description" />
      </router-link>
      <template #suffix>
        <n-button type="error" @click.stop="handleDelete(fav.shop.id)">取消收藏</n-button>
      </template>
    </n-list-item>
    <n-empty v-if="visibleFavorites.length === 0" description="暂无收藏的店铺" />
  </n-list>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NList, NListItem, NThing, NAvatar, NButton, NEmpty, useMessage } from 'naive-ui'
import { getShopFavorites, deleteShopFavorite } from '@/api/favorites'
import type { ShopFavoriteRecord } from '@/types/favorite'
import { RouterLink } from 'vue-router'

const favorites = ref<ShopFavoriteRecord[]>([])
const message = useMessage()

const fetchFavorites = async () => {
  try {
    favorites.value = await getShopFavorites(0, 100)
  } catch (error) {
    message.error('加载店铺收藏失败')
  }
}

// 过滤掉未认证或已关闭的店铺
const visibleFavorites = computed(() =>
  favorites.value.filter(fav => fav.shop.verified && fav.shop.opened)
)

const handleDelete = async (shopId: string) => {
  try {
    await deleteShopFavorite(shopId)
    message.success('已取消收藏')
    await fetchFavorites()
  } catch (error) {
    message.error('操作失败')
  }
}

onMounted(fetchFavorites)
</script>

<style scoped>
.shop-link {
  text-decoration: none;
  color: inherit;
}
</style>