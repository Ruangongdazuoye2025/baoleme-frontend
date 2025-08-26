import { apiRoot } from '@/config/api';
import { useTokenStore } from '@/stores/token';
import axios from 'axios';
import type { ItemCategory } from '@/types/category';

export const getShopItemCategories = async (shopId: string): Promise<ItemCategory[]> => {
    const res = await axios.get(`${apiRoot}/shops/${shopId}/item-categories`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as ItemCategory[];
};

export const createShopItemCategory = async (shopId: string, name: string): Promise<ItemCategory> => {
    const res = await axios.post(`${apiRoot}/shops/${shopId}/item-categories`, 
        {name},
        {headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as ItemCategory;
};

export const updateShopItemCategory = async (shopId: string, categoryId: string, name: string): Promise<ItemCategory> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.patch<ItemCategory>(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}`, { name }, { headers });
    return response.data;
};

export const deleteShopItemCategory = async (shopId: string, categoryId: string): Promise<void> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.delete(`${apiRoot}/shops/${shopId}/item-catrgories/${categoryId}`, { headers });
};

export const reorderShopItemCategory = async (shopId: string, categoryId: string, before: string | null): Promise<void> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    await axios.patch(`${apiRoot}/shops/${shopId}/item-categories/${categoryId}/pos`, { before }, { headers });
};