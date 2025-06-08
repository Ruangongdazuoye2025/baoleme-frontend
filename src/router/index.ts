// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Login from '@/views/user/auth/Login.vue'
import { defineAsyncComponent } from 'vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/login'
  },

  // 登录
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/user/auth/Login.vue')
  },

  // 忘记密码
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/user/auth/ForgotPassword.vue')
  },
  {
    path: '/email-postprocess/reset-password',
    name: 'ResetPasswordEmail',
    component: () => import('@/views/user/auth/ResetPasswordEmail.vue'),
    props: route=> ({ query: route.query})
  },

  // 注册验证
  {
    path: '/email-postprocess/verify-register',
    name: 'EmailVerification',
    component: () => import('@/views/user/auth/EmailVerification.vue'),
    props: route => ({ query: route.query })
  },

  // 用户主页面
  {
    path: '/customer/home',
    name: 'CustomerHome',
    component: () => import('@/views/customer/home/Home.vue')
  },
  {
    path: '/user/:userId',
    name: 'UserProfile',
    component: () => import('@/views/user/UserView.vue'),
    props: true
  },
  // 订单
  {
    path: '/orders',
    name: 'CustomerOrder',
    component: () => import('@/views/customer/order/Order.vue')
  },
  // 订单详情，路由参数和api匹配
  {
    path: '/orders/:id',
    name: 'OrderDetail',
    component: () => import('@/views/customer/order/OrderInfo.vue')
  },
      // 搜索页面
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/customer/home/Search.vue'),
  },
  // 搜索结果页面
  {
    path: '/search/result',
    name: 'SearchResult',
    component: () => import('@/views/customer/home/SearchResult.vue'),
  },
  {
    path: '/merchant/shops', // 商户的店铺列表
    name: 'MerchantShopList',
    component: () => import('@/views/merchant/ShopList.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    name: 'NotFound',
    component: () => import('@/views/result/404.vue')
  },
  {
    path: '/user/:userId',
    name: 'UserProfile',
    component: () => import('@/views/user/UserView.vue'),
    props: true
  },
  {
    path: '/customer/order/submit',
    name: 'OrderSubmit',
    component: () => import('@/views/customer/order/OrderSubmit.vue')
  },
  {
    path: '/order/getsubmit',
    name: 'GetOrderSubmit',
    component: () => import('@/views/customer/order/GetOrder.vue')
  },
  {
    path: '/merchant/shops/create', // 新增：创建店铺的路由
    name: 'MerchantShopCreate',
    component: () => import('@/views/merchant/ShopCreateForm.vue'),
  },
  {
    path: '/merchant/shops/:shopId/detail',
    name: 'MerchantShopDetail',
    component: () => import('@/views/merchant/ShopDetail.vue'),
    props: true,
    children: [
      {
        path: 'products',
        name: 'MerchantShopProductList',
        component: () => import('@/views/merchant/product/ProductList.vue'), // 商品列表组件
        props: true
      }
    ]
  },
  {
    path: '/merchant/shops/edit/:shopId', // 编辑店铺信息的路由
    name: 'MerchantShopEdit',
    component: () => import('@/views/merchant/ShopEditForm.vue'),
    props: true,
  },
  {
    path: '/merchant/shops/:shopId/products/create',
    name: 'MerchantProductCreate',
    component: () => import('@/views/merchant/product/ProductForm.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'merchant' }
  },
  {
    path: '/merchant/products/:productId/edit', 
    name: 'MerchantProductEdit',
    component: () => import('@/views/merchant/product/ProductForm.vue'),
    props: true, // productId 会被传递
    meta: { requiresAuth: true, role: 'merchant' }
  },
  {path: '/merchant/shop/{id}/comments',
    name: 'ShopCommentsList',
    component: () => import('@/views/merchant/shop/ShopCommentList.vue'),
    meta: { requiresAuth: true, role: 'merchant' }
  },
  {
    path: '/merchant/products/:productId',
    name: 'MerchantProductDetail',
    component: () => import('@/views/merchant/product/ProductDetail.vue'),
    props: true, // productId 会被传递
    meta: { requiresAuth: true, role: 'merchant' }
  },
  {
    path: '/merchant/order',
    name: 'MerchantOrder',
    component: () => import('@/views/customer/order/Order.vue'),
    meta: { requiresAuth: true, role: 'merchant' }
  },
  {
    path: '/shop-statistics',
    name: 'ShopStatistics',
    component: () => import('@/views/merchant/shop/ShopStatistics.vue')
  },
    // 下单页面
  {
    path: '/checkout/:shopId',
    name: 'Checkout',
    component: () => import('@/views/customer/order/Checkout.vue'),
    meta: { requiresAuth: true }
  },
   //评价页面
  {
    path: '/comments/:id',
    name: 'Comments',
    component: () => import('@/views/customer/order/OrderComment.vue'),
  },
  {
    path: '/rider/recommend',
    name: 'Recommend',
    component: () => import('@/views/rider/Recommend.vue'),

    meta: { requiresAuth: true }
  },
  // 顾客店铺列表页
  {
    path: '/customer/shops',
    name: 'CustomerShopList',
    component: () => import('@/views/customer/shop/ShopListView.vue'),
    props: route => ({ query: route.query })
  },
  {
    path: '/customer/shops/:shopId', // 使用 :shopId 动态匹配店铺ID
    name: 'CustomerShopProducts',
    component: () => import('@/views/customer/shop/ShopProductsView.vue'),
    props: true // 自动将路由参数 (shopId) 作为 props 传递给组件
  },

  {
  path: '/address/add',
  name: 'AddressAdd',
  component: () => import('@/views/AddressSelector.vue'),
  meta: {
    requiresAuth: true
  }
  },
  {
    path: '/address/select',
    name: 'AddressSelect',
    component: () => import('@/views/customer/address/AddressSelect.vue')
  },
  {
    path: '/address/new',
    name: 'AddressCreate',
    component: () => import('@/views/customer/address/AddressForm.vue')
  },
  {
    path: '/address/:id/edit',
    name: 'AddressEdit',
    component: () => import('@/views/customer/address/AddressForm.vue'),
    props: true
  },

  // 管理员首页
  {
    path: '/admin',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  // 管理员查看店铺
  {
    path: '/admin/shops',
    name: 'AdminShopReview',
    component: () => import('@/views/admin/ShopReview.vue'),
    meta: { requiresAuth: true, role: 'admin' } // 确保只有管理员能访问
  },
  {
    path: '/admin/shops/:shopId/items',
    name: 'AdminShopItemReview',
    component: () => import('@/views/admin/ItemReview.vue'),
    props: true, // 允许将 shopId 作为 prop 传递给组件
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/shops/:shopId/comments',
    name: 'AdminShopCommentReview',
    component: () => import('@/views/admin/CommentReview.vue'),
    props: true,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/orders',
    name: 'AdminOrderManagement',
    component: () => import('@/views/admin/OrderManagement.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  // 搜索页面
  {
    path: '/customer/search',
    name: 'Search',
    component: () => import('@/views/customer/home/Search.vue')
  },
  {
    path: '/customer/search/result',
    name: 'SearchResult',
    component: () => import('@/views/customer/home/SearchResult.vue')
  },
  // 配送地图
  {
    path: '/order/delivery-map',
    name: 'DeliveryMap',
    component: () => import('@/views/DeliveryMap.vue')
  },
  // 新增：历史记录
  {
    path: '/customer/records',
    name: 'CustomerRecords',
    component: () => import('@/views/customer/RecordsView.vue'),
    meta: { requiresAuth: true, role: 'customer' }
  },
  {
    path: '/customer/favorites',
    name: 'CustomerFavorites',
    component: () => import('@/views/customer/FavoritesView.vue'),
    meta: { requiresAuth: true, role: 'customer' }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router