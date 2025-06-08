<template>
    <div class="merchant-shop-list-page">
      <n-page-header>
        <template #title>
          我的店铺
        </template>
        <template #extra>
          <n-space>
            <n-button type="primary" ghost @click="toggleManagementMode">
              <template #icon>
                <n-icon :component="isManaging ? CheckmarkCircleOutline : SettingsOutline" />
              </template>
              {{ isManaging ? '完成管理' : '管理店铺' }}
            </n-button>
            <n-button type="primary" @click="handleAddShop">
              <template #icon>
                <n-icon :component="AddOutline" />
              </template>
              增加商铺
            </n-button>
          </n-space>
        </template>
      </n-page-header>
  
      <div class="shop-list-container">
        <infinite-scroll-list
          :items="shops"
          :load-more="loadMoreShops"
          :is-loading="isLoading"
          :has-more="hasMore"
          item-key="id"
          class="shop-scroll-list"
        >
          <template #item="{ item }">
            <n-card :title="item.name" hoverable class="shop-card">
              <template #header-extra v-if="isManaging">
                  <n-icon :component="StorefrontOutline" size="20" style="vertical-align: middle; margin-right: 5px;" />
              </template>
              <n-thing>
                <template #avatar v-if="item.avatar">
                  <n-avatar :src="item.avatar" :size="48" object-fit="cover" />
                </template>
                <template #header>
                  </template>
                <template #description>
                  <n-ellipsis :line-clamp="2" :tooltip="false">
                    {{ item.description || '暂无描述' }}
                  </n-ellipsis>
                </template>
  
                <n-space vertical :size="12" style="margin-top: 10px;">
                  <n-text :depth="3">
                    <n-icon :component="LocationOutline" style="vertical-align: middle;" /> 地址: {{ item.address }}
                  </n-text>
                  <n-text :depth="3">
                    <n-icon :component="StarOutline" style="vertical-align: middle;" /> 评分: {{ item.rating }} / 5
                  </n-text>
                </n-space>
              </n-thing>
  
              <template #action>
                <n-space justify="end">
                  <n-button tertiary type="info" @click="viewShopDetails(item.id)">
                     <template #icon>
                        <n-icon :component="EyeOutline" />
                      </template>
                    查看详情
                  </n-button>
                  <template v-if="isManaging">
                    <n-button type="primary" ghost @click="handleEditShop(item)">
                      <template #icon>
                        <n-icon :component="CreateOutline" />
                      </template>
                      编辑
                    </n-button>
                    <n-button type="error" ghost @click="handleDeleteShop(item)">
                      <template #icon>
                        <n-icon :component="TrashOutline" />
                      </template>
                      删除
                    </n-button>
                  </template>
                </n-space>
              </template>
            </n-card>
          </template>
  
          <template #loading>
            <div style="display: flex; justify-content: center; padding: 20px; align-items: center;">
              <n-spin size="medium" />
              <p style="margin-left: 10px; color: var(--text-color2);">正在努力加载店铺...</p>
            </div>
          </template>
  
          <template #noMore>
            <div style="text-align: center; padding: 20px; color: var(--text-color3);">
              老板，所有店铺都在这里啦！
            </div>
          </template>
  
           <template #empty>
            <div style="text-align: center; padding: 40px 20px;">
              <n-empty description="您还没有开通任何店铺哦，点击右上角“增加商铺”开始吧！" size="large" />
            </div>
          </template>
        </infinite-scroll-list>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue'
  import {
    NPageHeader, NSpace, NButton, NIcon, NCard, NAvatar, NText,
    NSpin, NEmpty, useDialog, useMessage, NThing, NEllipsis
  } from 'naive-ui'
  import {
    AddOutline, CreateOutline, TrashOutline, SettingsOutline, CheckmarkCircleOutline,
    EyeOutline, LocationOutline, StarOutline, StorefrontOutline
  } from '@vicons/ionicons5'
  import InfiniteScrollList from '@/components/common/InfiniteScrollList.vue'
  import { useRouter } from 'vue-router' // 如果需要跳转
import { getUserShops } from '@/api/shop'
import { useTokenStore } from '@/stores/token'
  
  // 模拟店铺数据类型
  interface Shop {
    id: string
    name: string
    address: string
    rating: number
    description?: string
    avatar?: string // 店铺头像
  }
  
  const shops = ref<Shop[]>([])
  const isLoading = ref(false)
  const hasMore = ref(true)
  const currentPage = ref(1)
  const itemsPerPage = 5
  
  const isManaging = ref(false) // 控制是否处于管理模式
  
  const dialog = useDialog() // Naive UI 对话框服务
  const message = useMessage() // Naive UI 消息服务
  const router = useRouter() // Vue Router实例
  const tokenStore = useTokenStore()
  
  const loadMoreShops = async () => {
    if (isLoading.value || !hasMore.value) return
    isLoading.value = true
    try {
      const newItems = await getUserShops(tokenStore.userId!)
      if (newItems.length > 0) {
        shops.value.push(...newItems.map(shop => ({
          id: shop.id,
          name: shop.name,
          address: shop.address.address,
          rating: shop.rating,
          description: shop.description,
          avatar: shop.cover.thumbnail
        })))
        currentPage.value++
        hasMore.value = false
      } else {
        hasMore.value = false
      }
    } catch (error) {
      console.error('加载店铺失败:', error)
      message.error('加载店铺列表失败，请稍后重试')
    } finally {
      isLoading.value = false
    }
  }
  
  const toggleManagementMode = () => {
    isManaging.value = !isManaging.value
    message.info(isManaging.value ? '已进入店铺管理模式' : '已退出店铺管理模式')
  }
  
  const handleAddShop = () => {
    console.log('触发增加商铺操作')
    router.push('/merchant/shops/create');
  }
  
  const handleEditShop = (shop: Shop) => {
    console.log('触发编辑商铺操作:', shop)
    router.push(`/merchant/shops/edit/${shop.id}`);
  }
  
  const handleDeleteShop = (shop: Shop) => {
    dialog.warning({
      title: '删除确认',
      content: `您确定要删除店铺 “${shop.name}” 吗？此操作不可恢复。`,
      positiveText: '确定删除',
      negativeText: '取消',
      onPositiveClick: () => {
        // 模拟删除逻辑
        shops.value = shops.value.filter(s => s.id !== shop.id)
        message.success(`店铺 “${shop.name}” 已删除`)
        console.log('触发删除商铺操作:', shop)
        // 此处应调用API删除，并在成功后更新列表或重新加载
      },
      onNegativeClick: () => {
        message.info('已取消删除操作')
      }
    })
  }
  
  const viewShopDetails = (shopId: string) => {
    router.push(`/merchant/shops/${shopId}/detail`)
  }
  </script>
  
  <style scoped>
  .merchant-shop-list-page {
    padding: 16px;
    background-color: #f8f8f8; /* 给页面一个浅色背景，使其与卡片区分 */
    min-height: calc(100vh - 64px); /* 假设顶部导航栏高度为 64px */
  }
  
  .n-page-header {
    background-color: #fff;
    padding: 16px 24px;
    border-radius: 8px;
    margin-bottom: 20px;
    box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  }
  
  .shop-list-container {
    /* 可以根据需要设置最大宽度和居中 */
    /* max-width: 900px; */
    /* margin: 0 auto; */
  }
  
  .shop-scroll-list {
    /* 如果希望滚动列表有固定高度 */
    /* height: calc(100vh - 180px); */ /* 减去 PageHeader 和其他可能的间距 */
    /* overflow-y: auto; */
  }
  
  .shop-card {
    /* margin-bottom 已由 InfiniteScrollList 的 .list-item-wrapper 提供 */
    transition: box-shadow 0.3s ease-in-out;
  }
  .shop-card:hover {
    box-shadow: var(--n-box-shadow-popover); /* 使用 Naive UI 的悬浮阴影变量 */
  }
  
  .n-card .n-thing .n-ellipsis {
    color: var(--n-text-color-disabled); /* 描述文字颜色变浅 */
  }
  </style>