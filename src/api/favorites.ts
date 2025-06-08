import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import axios from 'axios'
import type { ShopFavoriteRecord, ItemFavoriteRecord } from '@/types/favorite'

const getToken = () => useTokenStore().token

/**
 * 获取店铺收藏列表 
 * @param p 分页编号
 * @param pn 每页数量
 */
export const getShopFavorites = async (p: number, pn: number): Promise<ShopFavoriteRecord[]> => {
  const res = await axios.get(`${apiRoot}/favorites/shops`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { p, pn }
  })
  return res.data
}

/**
 * 删除单条店铺收藏
 * @param shopId 店铺ID 
 */
export const deleteShopFavorite = async (shopId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/favorites/shops/${shopId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * 获取商品收藏列表 
 * @param p 分页编号
 * @param pn 每页数量
 */
export const getItemFavorites = async (p: number, pn: number): Promise<ItemFavoriteRecord[]> => {
  const res = await axios.get(`${apiRoot}/favorites/items`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { p, pn }
  })
  return res.data
}

/**
 * 删除单条商品收藏
 * @param itemId 商品ID 
 */
export const deleteItemFavorite = async (itemId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/favorites/items/${itemId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * 获取单个店铺收藏
 * @param shopId 店铺ID
 */
export const getShopFavorite = async (shopId: string): Promise<ShopFavoriteRecord> => {
  const res = await axios.get(`${apiRoot}/favorites/shops/${shopId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.data
}

/**
 * 增加店铺收藏
 * @param shopId 店铺ID
 */
export const addShopFavorite = async (shopId: string): Promise<void> => {
  await axios.post(`${apiRoot}/favorites/shops/${shopId}`, {}, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * 获取单个商品收藏
 * @param itemId 商品ID
 */
export const getItemFavorite = async (itemId: string): Promise<ItemFavoriteRecord> => {
  const res = await axios.get(`${apiRoot}/favorites/items/${itemId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.data
}

/**
 * 增加商品收藏
 * @param itemId 商品ID
 */
export const addItemFavorite = async (itemId: string): Promise<void> => {
  await axios.post(`${apiRoot}/favorites/items/${itemId}`, {}, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}