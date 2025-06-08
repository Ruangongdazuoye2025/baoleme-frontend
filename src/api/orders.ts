import axios from 'axios'
import { ref, onMounted } from 'vue'
import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import type { createOrderreturn,Status, ItemInfo, Order,OrderInfoForShopAndrider } from '@/types/order'

export async function fetch
(page: number, pageSize: number, s: string) {
  const res = await axios.get(`${apiRoot}/orders`, {
    params: {
      p: page,
      pn: pageSize,
      s: s
    },
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })

  return res.data as Order[]
}

export async function fetchOrderDetail(orderId: string) {
  const res = await axios.get(`${apiRoot}/orders/${orderId}`, {
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })

  return res.data as Order
}

export async function fetchCustomerOrderList(page: number, pageSize: number, s?: string) {
  const res = await axios.get(`${apiRoot}/orders/as-customer`, {
    params: {
      p: page,
      pn: pageSize,
      s: s
    },
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })

  return res.data as Order[]
}

export async function fetchShopOrderList(id: string, page: number, pageSize: number, s?: string) {
  const res = await axios.get(`${apiRoot}/orders/as-shop/${id}`, {
    params: {
      p: page,
      pn: pageSize,
      s: s
    },
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })

  return res.data as Order[]
}

export async function fetchRiderOrderList(page: number, pageSize: number, s?: string) {
  const res = await axios.get(`${apiRoot}/orders/as-rider`, {
    params: {
      p: page,
      pn: pageSize,
      s: s
    },
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })

  return res.data as Order[]
}

export async function postOrder(shopId: string, addressId: string, note: string) {
  const res = await axios.post(`${apiRoot}/orders`, {
    data: {
      shopId,
      addressId,
      note
    },
    headers: {Authorization: `Bearer ${useTokenStore().token}`
    }
  })
  return res.data as Order[]
}

export async function getOrder(orderId: number) {
  const res = await axios.patch(`${apiRoot}/orders/${orderId}/rider`, {
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })
  return res.data as Order
}

export async function patchOrderStatus(id: string, status: string) {
  const res = await axios.patch(`${apiRoot}/orders/${id}/status`, {
    data: {
      status: status
    },
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })

  return res.data as Order
}

export async function deleteCanceledOrder(id: string) {
  const res = await axios.delete(`${apiRoot}/orders/${id}`, {
    headers: {Authorization: `Bearer ${useTokenStore().token}`}
  })

  return res.data
}

export const createOrder = async (shopId: string,addressId: string,note?: string) => {
    const res = await axios.post(`${apiRoot}/orders`, {
        shopId,
        addressId,
        note
    }, {
        headers: { 
            Authorization: `Bearer ${useTokenStore().token}`
        },
    })
    return res.data as createOrderreturn
}

export const updateOrderStatus = async (orderId: string, status: Status) => {
  const res = await axios.patch(`${apiRoot}/orders/${orderId}/status`, 
    { status },
    {
      headers: { 
        Authorization: `Bearer ${useTokenStore().token}`
      }
    }
  );
  return res.data as createOrderreturn;
}
