<template>
  <n-list hoverable clickable>
    <n-list-item v-for="record in visibleRecords" :key="record.shop.id">
      <template #prefix>
        <n-avatar :src="record.shop.cover.thumbnail" />
      </template>
      <router-link :to="`/customer/shops/${record.shop.id}`" class="shop-link">
        <n-thing :title="record.shop.name" :description="record.shop.description" />
      </router-link>
      <template #suffix>
        <n-button type="error" @click.stop="handleDelete(record.shop.id)">删除</n-button>
      </template>
    </n-list-item>
    <n-empty v-if="visibleRecords.length === 0" description="暂无店铺浏览记录" />
  </n-list>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NList, NListItem, NThing, NAvatar, NButton, NEmpty, useMessage } from 'naive-ui'
import { getShopHistory, deleteShopHistory } from '@/api/records'
import type { ShopHistoryRecord } from '@/types/record'
import { RouterLink } from 'vue-router'

const records = ref<ShopHistoryRecord[]>([])
const message = useMessage()

const fetchHistory = async () => {
  try {
    // 暂定获取第一页，每页100条记录
    records.value = await getShopHistory(0, 100)
  } catch (error) {
    console.error(error)
    message.error('加载店铺历史记录失败')
  }
}

// 过滤掉未认证或已关闭的店铺 
const visibleRecords = computed(() =>
  records.value.filter(record => record.shop.verified && record.shop.opened)
)

const handleDelete = async (shopId: string) => {
  try {
    await deleteShopHistory(shopId)
    message.success('删除成功')
    await fetchHistory()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(fetchHistory)
</script>

<style scoped>
.shop-link {
  text-decoration: none;
  color: inherit;
}
</style>