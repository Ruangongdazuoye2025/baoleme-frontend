<template>
  <div class="shop-comment-list">
    <n-list hoverable>
      <template v-for="review in reviews" :key="review.id">
        <n-card class="review-card">
          <n-thing>
            <template #header>
              <div class="review-header">
                <n-avatar :src="review.user.avatar?.thumbnail" round size="medium" class="user-avatar" fallback-src="/default-avatar.webp" @click.stop="goToUser(review.user.id)" />
                <span class="username" @click.stop="goToUser(review.user.id)">{{ review.user.name }}</span>
                <n-rate readonly :value="review.rating / 10" :count="5" size="small" style="margin-left: 12px;" />
              </div>
            </template>
            <template #description>
              <div class="review-content">{{ review.content }}</div>
            </template>
          </n-thing>
        </n-card>
      </template>
      <div v-if="loading" class="loading"><n-spin size="small" /> 加载中...</div>
      <div v-if="!hasMore && reviews.length > 0" class="no-more">没有更多评论了</div>
      <div v-if="!loading && reviews.length === 0" class="empty"><n-empty description="暂无评论" /></div>
    </n-list>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NList, NCard, NThing, NAvatar, NRate, NSpin, NEmpty, useMessage } from 'naive-ui'
import { getShopComments } from '@/api/comment'
import { useRouter } from 'vue-router'
import type { Comment } from '@/types/comment'

const props = defineProps<{ shopId: string }>()
const router = useRouter()
const message = useMessage()

const reviews = ref<Comment[]>([])
const page = ref(0)
const pageSize = 10
const loading = ref(false)
const hasMore = ref(true)

const fetchReviews = async () => {
  if (loading.value || !hasMore.value) return
  loading.value = true
  try {
    const data = await getShopComments(props.shopId, page.value, pageSize)
    if (data.length > 0) {
      reviews.value.push(...data)
      page.value++
      hasMore.value = data.length === pageSize
    } else {
      hasMore.value = false
    }
  } catch (e) {
    message.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

const onScroll = (e: Event) => {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
    fetchReviews()
  }
}

const goToUser = (userId: string) => {
  router.push(`/user/${userId}`)
}

onMounted(() => {
  fetchReviews()
})
</script>

<style scoped>
.shop-comment-list {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  height: 60vh;
  overflow-y: auto;
}
.review-card {
  margin-bottom: 16px;
}
.review-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar {
  cursor: pointer;
}
.username {
  font-weight: bold;
  margin-left: 8px;
  cursor: pointer;
}
.review-content {
  margin-top: 8px;
  color: #333;
  font-size: 15px;
}
.loading, .no-more, .empty {
  text-align: center;
  color: #888;
  margin: 16px 0;
}
</style>