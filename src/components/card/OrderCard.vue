<template>
    <n-card class="mb-4" :title="shopInfo?.name || '未知店铺'" hoverable>
        <template #header-extra>
            <n-tag type="info">{{ order.status ||  '未知状态'}}</n-tag>
        </template>
        <div class="order-card-info" @click="getOrderItem(order.id)">
            <n-space align="start" :wrap="false" size="large">
                <div class="order-left">
                    <n-avatar :size="120" :src="shopInfo?.cover.thumbnail" />
                </div>

                <div class="order-right">
                    <div class="order-detail-time">下单时间：{{ (new Date(order.createdAt)).toLocaleString() }}</div>
                    <div class="order-items">{{ order.items.map(item => item.name).join('、') }}</div>
                    <div class="order-total">￥{{ (order.total / 100).toFixed(2) }}</div>
                </div>
            </n-space>
        </div>
        <!-- 送餐进度条 -->
        <div style="overflow-x: auto" class="timeline-container">
                <!-- 横向进度条 -->
                <n-steps :current="currentStep" horizontal>
                    <n-step v-for="(step, index) in steps"
                        :title="step.title" :description="step.content"/>
                </n-steps>
                <!-- 订单完成后显示的按钮组 -->
                <div class="action-buttons" >
                    <n-button v-if="role.includes('customer') && order.status === Status.Finished" primary @click="evaluate(order)">评价</n-button>
                    <n-button v-if="role.includes('customer') && order.status === Status.Unpaid" primary @click="pay(order)">付款</n-button>
                    <n-button v-if="role.includes('customer') && order.status === Status.Unpaid" type="error" @click="cancel(order)" primary>取消</n-button>
                    <n-button v-if="role.includes('merchant') && order.status === Status.Preparing" primary @click="finishPreparing(order)">准备完成</n-button>
                    <n-button v-if="role.includes('rider') && order.status === Status.Delivering" primary @click="finishDelivering(order)">配送完成</n-button>
                </div>
        </div>

    </n-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { NTag, NCard, NSteps, NStep } from 'naive-ui'
import { useRoute, useRouter } from 'vue-router'
import { Status, type Order, type OrderItem } from '@/types/order'
import { useTokenStore } from '@/stores/token'
import type { ShopInfo } from '@/types/shop'
import { getShopInfo } from '@/api/shop'
import { updateOrderStatus } from '@/api/orders'

const route = useRoute()
const router = useRouter()
// TODO: 根据订单状态决定是否显示进度条的逻辑
const isShowTimeline = (status: string) => {
    if (status === '已完成') {
        return true
    }
    return false
}
// 组件参数
const order = defineModel<Order>('order', { required: true })

const shopInfo = ref<ShopInfo | null>(null)
onMounted(async () => {
    try {
        shopInfo.value =await getShopInfo(order.value.shop!)
    } catch (error) {
        shopInfo.value = null
    }
    
})

// 定义进度条状态数据
const steps = computed(() => [
    {
        title: '下单成功',
        content: order.value.paidAt ? (new Date(order.value.paidAt)).toLocaleString() : '',
    },
    {
        title: '商品准备完成',
        content: order.value.preparedAt ? (new Date(order.value.preparedAt)).toLocaleString() : '',
    },
    {
        title: '配送中',
        content: order.value.deliveredAt ? (new Date(order.value.deliveredAt)).toLocaleString() : '',
    },
    {
        title: '送达',
        content: order.value.finishedAt ? (new Date(order.value.finishedAt)).toLocaleString() : '',
    },
])

const currentStep = computed(() => {
    switch (order.value.status) {
        case Status.Preparing:
            return 1
        case Status.Prepared:
            return 2
        case Status.Delivering:
            return 3
        case Status.Finished:
            return 4
        default:
            return 0
    }
})

const tokenStore = useTokenStore()

const role = computed<('customer' | 'merchant' | 'rider')[]>(() => {
    const ret = []
    if (tokenStore.userId === order.value.customer) {
        ret.push('customer')
    }
    if (tokenStore.userId === shopInfo.value?.owner) {
        ret.push('merchant')
    }
    if (tokenStore.userId === order.value.rider) {
        ret.push('rider')
    }
    return ret as any
})

const getOrderItem = (id: string) => {
    console.log('获取订单详情', id)
    router.push({ path: `/orders/${id}` }) // 添加路由参数
}

// TODO：按钮逻辑
const evaluate = (order: Order) => {
    router.push({ path: `/comments/${order.id}` })
}

const pay = async (o: Order) => {
    order.value = await updateOrderStatus(o.id, Status.Preparing)
}

const cancel = async (o: Order) => {
    order.value = await updateOrderStatus(o.id, Status.Canceled)
}

const finishPreparing = async (o: Order) => {
    order.value = await updateOrderStatus(o.id, Status.Prepared)
}

const finishDelivering = async (o: Order) => {
    order.value = await updateOrderStatus(o.id, Status.Finished)
}

</script>

<style scoped>

/* 动态光影 */
.mb-4 {
    margin-bottom: 1rem;
    border-radius: 12px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

/* 悬停效果 */
.mb-4:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* .order-card-info {
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background-color: white;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    margin: 8px 5px;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
} */

/* .order-card-info:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
} */

.order-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-width: 160px;
}

.store-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.store-name {
    font-size: 16px;
    font-weight: 500;
    color: #1f2937;
}

.order-time {
    font-size: 14px;
    color: #6b7280;
}

.order-right {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
}

.order-detail-time {
    font-size: 14px;
    color: #6b7280;
}

.order-items {
    font-size: 15px;
    color: #374151;
}

.order-total {
    font-size: 18px;
    font-weight: bold;
    color: #ef4444;
}

/* 进度条 */
.timeline-container {
    display: flex;
    margin-top: 1rem;
    max-height: 10rem;
    overflow-y: hidden;
}

.action-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding: 12px;
    justify-content: flex-start;
}
</style>
