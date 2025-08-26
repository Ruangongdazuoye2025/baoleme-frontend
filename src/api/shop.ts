import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import type { OrderStats, ShopProfile, ShopStats, TopProducts } from '@/types/shop'
import axios from 'axios'
import type { ShopInfo } from '@/types/shop'
import type { Item } from '@/types/order'
import type { ItemCategory } from '@/types/item'
import type { imgURL } from '@/types/img'

export const getOrderStats = async (shopId: string, s: Date, t: Date) : Promise<OrderStats> => {
    const res = await axios.get(`${apiRoot}/shops/${shopId}/stats`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` },
        params: { s, t }
    })
    return res.data as OrderStats
}

export const getTopProducts = async (shopId: string, s: Date, t: Date, n: number) : Promise<TopProducts> => {
    const res = await axios.get(`${apiRoot}/shops/${shopId}/top-items`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` },
        params: { s, t, n }
    })
    return res.data as TopProducts
}

export const getShopInfo = async (shopId: string) : Promise<ShopInfo> => {
    const res = await axios.get(`${apiRoot}/shops/${shopId}`, {
        headers: { 
            Authorization: `Bearer ${useTokenStore().token}`
        }
    })
    return res.data as ShopInfo 
}

export const getGlobalShopList = async (params?: {
  p?: number
  pn?: number
  q?: string
  min_ca?: string
  max_ca?: string
}): Promise<ShopInfo[]> => {
  const res = await axios.get<ShopInfo[]>(`${apiRoot}/shops`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params
  })
  return res.data as ShopInfo[]
}

export const createShop = async (data: Omit<ShopProfile, 'verified'>): Promise<ShopInfo> => {
  const res = await axios.post(`${apiRoot}/shops`, data, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ShopInfo
}

export const getUserShops = async (id: string): Promise<ShopInfo[]> => {
  const res = await axios.get(`${apiRoot}/user/${id}/shops`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ShopInfo[]
}

export const deleteShop = async (id: string) => {
  return await axios.delete(`${apiRoot}/shops/${id}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const updateShopProfile = async (
  id: string,
  data: Partial<ShopProfile>
): Promise<ShopProfile> => {
  const res = await axios.patch<ShopProfile>(`${apiRoot}/shops/${id}/profile`, data, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ShopProfile
}

export const updateShopImages = async (
  id: string,
  data: { cover?: Blob; detailImage?: Blob; license?: Blob } // Use Blob for binary data
): Promise<{ cover?: imgURL; detailImage?: imgURL; license?: imgURL }> => {
  const formData = new FormData();
  if (data.cover) formData.append('cover', data.cover);
  if (data.detailImage) formData.append('detailImage', data.detailImage);
  if (data.license) formData.append('license', data.license);

  const res = await axios.patch(
    `${apiRoot}/shops/${id}/image`,
    formData,
    {
      headers: { 
        Authorization: `Bearer ${useTokenStore().token}`,
        'Content-Type': 'multipart/form-data' // Important for file uploads
      }
    }
  );
  return res.data as { cover?: imgURL; detailImage?: imgURL; license?: imgURL };
};

export const transferShopOwnership = async (id: string, newOwnerId: string): Promise<void> => {
  await axios.patch(`${apiRoot}/shops/${id}/owner`, { owner: newOwnerId }, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getShopStats = async (id: string, s: string, t: string): Promise<ShopStats> => {
  const res = await axios.get(`${apiRoot}/shops/${id}/stats`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { s, t }
  })
  return res.data as ShopStats
}

export const getTopSellingItems = async (
  id: string,
  s: string,
  t: string,
  n?: number
): Promise<Item> => {
  const res = await axios.get(`${apiRoot}/shops/${id}/top-items`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { s, t, n }
  })
  return res.data as Item
}

export const getShopReport = async (id: string, s: string, t: string): Promise<Blob> => {
  const res = await axios.get(`${apiRoot}/shops/${id}/report`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { s, t },
    responseType: 'blob' // Important for file downloads
  })
  return res.data as Blob
}

export const getItemCategories = async (shopId: string): Promise<ItemCategory[]> => {
  const res = await axios.get(`${apiRoot}/shops/${shopId}/item-categories`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ItemCategory[]
}

export const createItemCategory = async (
  shopId: string,
  data: { name: string }
): Promise<ItemCategory> => {
  const res = await axios.post(`${apiRoot}/shops/${shopId}/item-categories`, data, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ItemCategory
}

export const getItemCategoryInfo = async (
  shopId: string,
  categoryId: string
): Promise<ItemCategory> => {
  const res = await axios.get(
    `${apiRoot}/shops/${shopId}/item-categories/${categoryId}`,
    {
      headers: { Authorization: `Bearer ${useTokenStore().token}` }
    }
  )
  return res.data as ItemCategory
}

export const updateItemCategory = async (
  shopId: string,
  categoryId: string,
  data: { name: string }
): Promise<void> => {
  await axios.patch(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}`, data, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const updateItemCategoryOrder = async (
  shopId: string,
  categoryId: string,
  data: { before: string | null }
): Promise<void> => {
  await axios.patch(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}/pos`, data, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const deleteItemCategory = async (shopId: string, categoryId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/shops/${shopId}/item-catrgories/${categoryId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
}

export const getShopCategories = async (): Promise<Array<{ id: string; name: string }>> => {
  const res = await axios.get(`${apiRoot}/shop-categories`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  });
  return res.data as Array<{ id: string; name: string }>;
};