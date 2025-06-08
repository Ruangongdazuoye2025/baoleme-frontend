<template>
  <n-list hoverable clickable>
    <n-list-item v-for="record in visibleRecords" :key="record.item.id">
      <template #prefix>
        <n-avatar :src="record.item.cover.thumbnail" />
      </template>
      <router-link :to="`/customer/shops/${record.item.shopId}`" class="item-link">
        <n-thing :title="record.item.name" :description="`¥${(record.item.price / 100).toFixed(2)}`" />
      </router-link>
      <template #suffix>
        <n-button type="error" @click.stop="handleDelete(record.item.id)">删除</n-button>
      </template>
    </n-list-item>
     <n-empty v-if="visibleRecords.length === 0" description="暂无商品浏览记录" />
  </n-list>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { NList, NListItem, NThing, NAvatar, NButton, NEmpty, useMessage } from 'naive-ui'
import { getItemHistory, deleteItemHistory } from '@/api/records'
import type { ItemHistoryRecord } from '@/types/record'
import { RouterLink } from 'vue-router'

const records = ref<ItemHistoryRecord[]>([])
const message = useMessage()

const fetchHistory = async () => {
  try {
    records.value = await getItemHistory(0, 100)
  } catch (error) {
    message.error('加载商品历史记录失败')
  }
}

// 过滤掉不可用或缺货的商品 
const visibleRecords = computed(() =>
  records.value.filter(record => record.item.available && !record.item.stockout)
)

const handleDelete = async (itemId: string) => {
  try {
    await deleteItemHistory(itemId)
    message.success('删除成功')
    await fetchHistory()
  } catch (error) {
    message.error('删除失败')
  }
}

onMounted(fetchHistory)
</script>

<style scoped>
.item-link {
  text-decoration: none;
  color: inherit;
}
</style>