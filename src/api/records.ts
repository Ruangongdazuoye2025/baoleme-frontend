import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import axios from 'axios'
import type { ShopHistoryRecord, ItemHistoryRecord } from '@/types/record'

export const getShopHistory = async (p: number, pn: number): Promise<ShopHistoryRecord[]> => {
  const res = await axios.get(`${apiRoot}/records/shops`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { p, pn }
  })
  return res.data as ShopHistoryRecord[]
}

export const deleteShopHistory = async (shopId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/records/shops/${shopId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getItemHistory = async (p: number, pn: number): Promise<ItemHistoryRecord[]> => {
  const res = await axios.get(`${apiRoot}/records/items`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { p, pn }
  })
  return res.data as ItemHistoryRecord[]
}

export const deleteItemHistory = async (itemId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/records/items/${itemId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getShopHistoryRecord = async (shopId: string): Promise<ShopHistoryRecord> => {
  const res = await axios.get(`${apiRoot}/records/shops/${shopId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ShopHistoryRecord
}

export const addShopHistory = async (shopId: string): Promise<void> => {
  await axios.post(`${apiRoot}/records/shops/${shopId}`, {}, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getItemHistoryRecord = async (itemId: string): Promise<ItemHistoryRecord> => {
  const res = await axios.get(`${apiRoot}/records/items/${itemId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ItemHistoryRecord
}

export const addItemHistory = async (itemId: string): Promise<void> => {
  await axios.post(`${apiRoot}/records/items/${itemId}`, {}, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}