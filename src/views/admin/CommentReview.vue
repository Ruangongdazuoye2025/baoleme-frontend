<template>
  <n-card :title="`店铺评价管理 - ${shopName}`" :bordered="false">
    <n-space vertical>
      <n-button @click="router.back()">返回店铺列表</n-button>
      <n-data-table
        :columns="columns"
        :data="comments"
        :loading="loading"
        :pagination="pagination"
        :remote="true"
        @update:page="handlePageChange"
      />
    </n-space>
  </n-card>
</template>

<script setup lang="ts">
import { ref, onMounted, h, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NSpace, NTag, useMessage, NPopconfirm, NAvatar, NRate, NText } from 'naive-ui'
import { getShopComments, deleteComment, type Comment } from '@/api/admin'
import { getShopInfo } from '@/api/shop'
import type { DataTableColumns, PaginationProps } from 'naive-ui'
import { getDisplayUserName } from '@/types/user' // 复用用户名显示逻辑

const route = useRoute()
const router = useRouter()
const message = useMessage()

const shopId = computed(() => route.params.shopId as string)
const shopName = ref('')
const comments = ref<Comment[]>([])
const loading = ref(true)
const pagination = ref<PaginationProps>({ page: 0, pageSize: 10, itemCount: 0 })

const fetchShopDetails = async () => { /* ... 与ItemReview.vue中的逻辑相同 ... */ }

const fetchComments = async () => {
    if (!shopId.value) return;
    loading.value = true
    try {
        const response = await getShopComments(shopId.value, { p: pagination.value.page ?? 1, pn: pagination.value.pageSize ?? 10 });
        comments.value = response
    } catch (error) {
        message.error('加载评价列表失败');
    } finally {
        loading.value = false
    }
}

const createColumns = (): DataTableColumns<Comment> => [
    {
        title: '用户',
        key: 'user',
        render: (row) => h(NSpace, { align: 'center' }, { default: () => [
            h(NAvatar, { src: row.user.avatar.thumbnail, round: true }),
            h(NText, null, { default: () => getDisplayUserName(row.user.name, row.user.id) })
        ]})
    },
    {
        title: '评分',
        key: 'rating',
        render: (row) => h(NRate, { readonly: true, value: row.rating / 10, size: 'small' })
    },
    { title: '评价内容', key: 'content', ellipsis: { tooltip: true } },
    { title: '评价时间', key: 'createdAt', render: (row) => new Date(row.createdAt).toLocaleString() },
    {
        title: '操作',
        key: 'actions',
        render(row) {
            return h(
                NPopconfirm,
                { onPositiveClick: () => handleDelete(row.id) },
                {
                    trigger: () => h(NButton, { size: 'small', type: 'error' }, { default: () => '删除' }),
                    default: () => '确定要删除这条评价吗？此操作不可撤销。'
                }
            )
        }
    }
]

const columns = createColumns()

const handleDelete = async (commentId: string) => {
    try {
        await deleteComment(commentId);
        message.success('删除成功！');
        fetchComments();
    } catch (error) {
        message.error('删除失败');
    }
}

const handlePageChange = (page: number) => {
    pagination.value.page = page;
    fetchComments();
}

onMounted(() => {
    fetchShopDetails();
    fetchComments();
});
</script>