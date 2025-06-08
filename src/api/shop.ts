import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import type { OrderStats, ShopProfile, ShopStats, TopProducts } from '@/types/shop'
import axios from 'axios'
import type { ShopInfo } from '@/types/shop'
import type { ImgURL, Item } from '@/types/order'
import type { ItemCategory } from '@/types/item'

export const getOrderStats = async (shopId: string, s: Date, t: Date) => {
    const res = await axios.get(`${apiRoot}/shops/${shopId}/stats`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` },
        params: { s, t }
    })
    return res.data as OrderStats
}

export const getTopProducts = async (shopId: string, s: Date, t: Date, n: number) => {
    const res = await axios.get(`${apiRoot}/shops/${shopId}/top-items`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` },
        params: { s, t, n }
    })
    return res.data as TopProducts
}

export const getShopInfo = async (shopId: string) => {
    const res = await axios.get(`${apiRoot}/shops/${shopId}`, {
        headers: { 
            Authorization: `Bearer ${useTokenStore().token}`
        }
    })
    return res.data as ShopInfo 
}
const getToken = () => useTokenStore().token

/**
 * GET /shops
 * 管理员获取店铺列表。
 * @param p 分页编号 (可选)
 * @param pn 每页数量 (可选)
 * @param q 搜索关键字 (可选)
 * @param min_ca 最小创建时间 (可选)
 * @param max_ca 最大创建时间 (可选)
 * @returns Promise<Shop[]>
 */
export const getGlobalShopList = async (params?: {
  p?: number
  pn?: number
  q?: string
  min_ca?: string
  max_ca?: string
}): Promise<ShopInfo[]> => {
  const res = await axios.get<ShopInfo[]>(`${apiRoot}/shops`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params
  })
  return res.data
}

/**
 * POST /shops
 * 商家增加店铺。
 * @param data 店铺资料
 * @returns Promise<ShopProfile>
 */
export const createShop = async (data: Omit<ShopProfile, 'verified'>): Promise<ShopInfo> => {
  const res = await axios.post<ShopInfo>(`${apiRoot}/shops`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.data
}

/**
 * GET /user/{id}/shops
 * 获取商家管理的店铺列表。
 * @param id 用户ID
 * @returns Promise<ShopProfile[]>
 */
export const getUserShops = async (id: string): Promise<ShopInfo[]> => {
  const res = await axios.get<ShopInfo[]>(`${apiRoot}/user/${id}/shops`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.data
}

/**
 * DELETE /shops/{id}
 * 商家或管理员删除店铺。
 * @param id 店铺 ID
 * @returns Promise<void>
 */
export const deleteShop = async (id: string) => {
  return await axios.delete(`${apiRoot}/shops/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * PATCH /shops/{id}/profile
 * 修改店铺资料。
 * @param id 店铺 ID
 * @param data 待修改的店铺资料
 * @returns Promise<ShopProfile>
 */
export const updateShopProfile = async (
  id: string,
  data: Partial<ShopProfile>
): Promise<ShopProfile> => {
  const res = await axios.patch<ShopProfile>(`${apiRoot}/shops/${id}/profile`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.data
}

/**
 * PATCH /shops/{id}/image
 * 修改店铺图像。
 * @param id 店铺 ID
 * @param data 包含封面、详情图、许可证的图像数据 (binary string)
 * @returns Promise<{ cover?: ImageLink; detailImage?: ImageLink; license?: ImageLink }>
 */
export const updateShopImages = async (
  id: string,
  data: { cover?: Blob; detailImage?: Blob; license?: Blob } // Use Blob for binary data
): Promise<{ cover?: ImgURL; detailImage?: ImgURL; license?: ImgURL }> => {
  const formData = new FormData();
  if (data.cover) formData.append('cover', data.cover);
  if (data.detailImage) formData.append('detailImage', data.detailImage);
  if (data.license) formData.append('license', data.license);

  const res = await axios.patch<{ cover?: ImgURL; detailImage?: ImgURL; license?: ImgURL }>(
    `${apiRoot}/shops/${id}/image`,
    formData,
    {
      headers: { 
        Authorization: `Bearer ${getToken()}`,
        'Content-Type': 'multipart/form-data' // Important for file uploads
      }
    }
  );
  return res.data;
};

/**
 * PATCH /shops/{id}/owner
 * 修改店铺所有者。
 * @param id 店铺 ID
 * @param newOwnerId 新所有者的用户 ID
 * @returns Promise<void>
 */
export const transferShopOwnership = async (id: string, newOwnerId: string): Promise<void> => {
  await axios.patch(`${apiRoot}/shops/${id}/owner`, { owner: newOwnerId }, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * GET /shops/{id}/stats
 * 获取历史每日销量，每日订单数的统计信息。
 * @param id 店铺 ID
 * @param s 开始日期 (date-time string)
 * @param t 结束日期 (date-time string)
 * @returns Promise<ShopStats>
 */
export const getShopStats = async (id: string, s: string, t: string): Promise<ShopStats> => {
  const res = await axios.get<ShopStats>(`${apiRoot}/shops/${id}/stats`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { s, t }
  })
  return res.data
}

/**
 * GET /shops/{id}/top-items
 * 获取历史热销商品。
 * @param id 店铺 ID
 * @param s 开始日期 (date-time string)
 * @param t 结束日期 (date-time string)
 * @param n 商品数量 (可选)
 * @returns Promise<Item>
 */
export const getTopSellingItems = async (
  id: string,
  s: string,
  t: string,
  n?: number
): Promise<Item> => {
  const res = await axios.get<Item>(`${apiRoot}/shops/${id}/top-items`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { s, t, n }
  })
  return res.data
}

/**
 * GET /shops/{id}/report
 * 获取店铺销售统计报表。
 * @param id 店铺 ID
 * @param s 开始日期 (date string)
 * @param t 结束日期 (date string)
 * @returns Promise<Blob> (assuming the report is a file, based on typical report generation)
 * Note: The API documentation does not specify the return type for 200, so assuming a file (e.g., PDF, CSV)
 * If it's a JSON summary, the type should be adjusted accordingly.
 */
export const getShopReport = async (id: string, s: string, t: string): Promise<Blob> => {
  const res = await axios.get<Blob>(`${apiRoot}/shops/${id}/report`, {
    headers: { Authorization: `Bearer ${getToken()}` },
    params: { s, t },
    responseType: 'blob' // Important for file downloads
  })
  return res.data
}

// Shop Item Categories APIs

/**
 * GET /shops/{shopId}/item-categories
 * 获取商品分类列表。
 * @param shopId 店铺 ID
 * @returns Promise<ItemCategory[]>
 */
export const getItemCategories = async (shopId: string): Promise<ItemCategory[]> => {
  const res = await axios.get<ItemCategory[]>(`${apiRoot}/shops/${shopId}/item-categories`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.data
}

/**
 * POST /shops/{shopId}/item-categories
 * 增加商品分类。
 * @param shopId 店铺 ID
 * @param data 分类名称
 * @returns Promise<ItemCategory>
 */
export const createItemCategory = async (
  shopId: string,
  data: { name: string }
): Promise<ItemCategory> => {
  const res = await axios.post<ItemCategory>(`${apiRoot}/shops/${shopId}/item-categories`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
  return res.data
}

/**
 * GET /shops/{shopId}/item-categories/{categoryId}
 * 获取商品分类信息。
 * @param shopId 店铺 ID
 * @param categoryId 商品分类 ID
 * @returns Promise<ItemCategory>
 */
export const getItemCategoryInfo = async (
  shopId: string,
  categoryId: string
): Promise<ItemCategory> => {
  const res = await axios.get<ItemCategory>(
    `${apiRoot}/shops/${shopId}/item-categories/${categoryId}`,
    {
      headers: { Authorization: `Bearer ${getToken()}` }
    }
  )
  return res.data
}

/**
 * PATCH /shops/{shopId}/item-categories/{categoryId}
 * 修改商品分类信息。
 * @param shopId 店铺 ID
 * @param categoryId 商品分类 ID
 * @param data 待修改的分类名称
 * @returns Promise<void>
 */
export const updateItemCategory = async (
  shopId: string,
  categoryId: string,
  data: { name: string }
): Promise<void> => {
  await axios.patch(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * PATCH /shops/{shopId}/item-categories/{categoryId}/pos
 * 修改商品分类次序。
 * @param shopId 店铺 ID
 * @param categoryId 商品分类 ID
 * @param data 包含 'before' 字段，用于指定将当前分类放置在哪个分类之前，或 null 表示移到最后
 * @returns Promise<void>
 */
export const updateItemCategoryOrder = async (
  shopId: string,
  categoryId: string,
  data: { before: string | null }
): Promise<void> => {
  await axios.patch(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}/pos`, data, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * DELETE /shops/{shopId}/item-catrgories/{categoryId}
 * 删除商品分类。
 * @param shopId 店铺 ID
 * @param categoryId 商品分类 ID
 * @returns Promise<void>
 */
export const deleteItemCategory = async (shopId: string, categoryId: string): Promise<void> => {
  await axios.delete(`${apiRoot}/shops/${shopId}/item-catrgories/${categoryId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  })
}

/**
 * GET /shop-categories
 * 获取店铺分类列表。
 * @returns Promise<{id: string, name: string}[]>
 */
export const getShopCategories = async (): Promise<Array<{ id: string; name: string }>> => {
  const res = await axios.get(`${apiRoot}/shop-categories`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  return res.data;
};