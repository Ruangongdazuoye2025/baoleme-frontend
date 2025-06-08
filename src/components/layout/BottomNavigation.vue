<template>
  <div class="bottom-navigation">
    <div v-for="(item, index) in navItems" :key="index" class="nav-item" :class="{ active: isActive(item.path) }"
      @click="navigate(item.path)">
      <n-icon size="20">
        <component :is="item.icon" />
      </n-icon>
      <span>{{ item.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  HomeFilled,
  FileTextOutlined,
  ShoppingCartOutlined,
  UserOutlined
} from '@vicons/antd';
import { useTokenStore } from '@/stores/token';

const router = useRouter();
const route = useRoute();
const tokenStore = useTokenStore();

const navItems = computed(() => {
  let home =  {
    label: '首页',
    icon: HomeFilled,
    path: [
      '/customer/home',
      '/merchant/shops',
      '/rider/recommend'
    ]
  };
  let order = {
    label: '订单',
    icon: FileTextOutlined,
    path: [
      '/customer/order',
      '/merchant/order',
      '/rider/recommend'
    ]
  }
  let myPage = {
    label: '我的',
    icon: UserOutlined,
    path: [
      `/user/${tokenStore.userId}`,
      `/user/${tokenStore.userId}`,
      `/user/${tokenStore.userId}`
    ]
  }
  if (tokenStore.role === 'merchant') {
    return [home, myPage]
  } else {
    return [home, order, myPage]
  }
});

const isActive = (path: string[]) => {
  // 简单匹配或者更复杂的前缀匹配
  const offset = ref(0)
  switch (tokenStore.role) {
    case 'customer':
      offset.value = 0;
      break
    case 'merchant':
      offset.value = 1;
      break
    case 'rider':
      offset.value = 2;
      break
    default:
  }
  return route.path === path[offset.value] || route.path.startsWith(path[offset.value]);
};

const navigate = (path: string[]) => {
  const offset = ref(1)
  switch (tokenStore.role) {
    case 'customer':
      offset.value = 0;
      break
    case 'merchant':
      offset.value = 1;
      break
    case 'rider':
      offset.value = 2;
      break
    default:
  }
  if (route.path !== path[offset.value]) {
    router.push(path[offset.value]);
  }
};
</script>

<style scoped>
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 56px;
  background-color: white;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #999;
  cursor: pointer;
}

.nav-item.active {
  color: #ff6b01;
}

.nav-item span {
  margin-top: 2px;
}
</style>