import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import axios from 'axios'
import type { ShopFavoriteRecord, ItemFavoriteRecord } from '@/types/favorite'


export const getShopFavorites = async (p: number, pn: number): Promise<ShopFavoriteRecord[]> => {
  const res = await axios.get(`${apiRoot}/favorites/shops`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { p, pn }
  })
  return res.data as ShopFavoriteRecord[]
}

export const deleteShopFavorite = async (shopId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/favorites/shops/${shopId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getItemFavorites = async (p: number, pn: number): Promise<ItemFavoriteRecord[]> => {
  const res = await axios.get(`${apiRoot}/favorites/items`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { p, pn }
  })
  return res.data as ItemFavoriteRecord[]
}

export const deleteItemFavorite = async (itemId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/favorites/items/${itemId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getShopFavorite = async (shopId: string): Promise<ShopFavoriteRecord> => {
  const res = await axios.get(`${apiRoot}/favorites/shops/${shopId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ShopFavoriteRecord
}

export const addShopFavorite = async (shopId: string): Promise<void> => {
  await axios.post(`${apiRoot}/favorites/shops/${shopId}`, {}, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getItemFavorite = async (itemId: string): Promise<ItemFavoriteRecord> => {
  const res = await axios.get(`${apiRoot}/favorites/items/${itemId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ItemFavoriteRecord
}

export const addItemFavorite = async (itemId: string): Promise<void> => {
  await axios.post(`${apiRoot}/favorites/items/${itemId}`, {}, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}