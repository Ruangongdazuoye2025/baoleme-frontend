// src/api/category.ts

import { apiRoot } from '@/config/api';
import { useTokenStore } from '@/stores/token';
import axios from 'axios';
import type { ItemCategory } from '@/types/category';

/**
 * 获取指定店铺的所有商品分类列表
 * @param shopId 店铺ID
 * @returns 商品分类列表
 */
export const getShopItemCategories = async (shopId: string): Promise<ItemCategory[]> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<ItemCategory[]>(`${apiRoot}/shops/${shopId}/item-categories`, {
        headers
    });

    return response.data;
};

/**
 * 新增商品分类
 */
export const createShopItemCategory = async (shopId: string, name: string): Promise<ItemCategory> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post<ItemCategory>(`${apiRoot}/shops/${shopId}/item-categories`, { name }, { headers });
    return response.data;
};

/**
 * 修改商品分类名称
 */
export const updateShopItemCategory = async (shopId: string, categoryId: string, name: string): Promise<ItemCategory> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch<ItemCategory>(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}`, { name }, { headers });
    return response.data;
};

/**
 * 删除商品分类
 */
export const deleteShopItemCategory = async (shopId: string, categoryId: string): Promise<void> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.delete(`${apiRoot}/shops/${shopId}/item-catrgories/${categoryId}`, { headers });
};

/**
 * 调整商品分类顺序
 * @param shopId 店铺ID
 * @param categoryId 分类ID
 * @param beforeId 要插入到哪个分类之前（null表示最后）
 */
export const reorderShopItemCategory = async (shopId: string, categoryId: string, before: string | null): Promise<void> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.patch(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}/pos`, { before }, { headers });
};