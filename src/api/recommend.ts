import { apiRoot } from '@/config/api';
import { useTokenStore } from '@/stores/token';
import axios from 'axios';
import type { 
    GetRecommendedShopsRequest, 
    RecommendedShop,
    GetRecommendedItemsRequest,
    RecommendedItem 
} from '@/types/recommend';

/**
 * 获取推荐的店铺列表
 * @param params 请求查询参数
 * @returns 店铺列表
 */
export const getRecommendedShops = async (params: GetRecommendedShopsRequest): Promise<RecommendedShop[]> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<RecommendedShop[]>(`${apiRoot}/recommended/shops`, {
        params,
        headers
    });

    return response.data;
};

/**
 * 获取推荐的商品列表
 * @param params 请求查询参数
 * @returns 商品列表
 */
export const getRecommendedItems = async (params: GetRecommendedItemsRequest): Promise<RecommendedItem[]> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<RecommendedItem[]>(`${apiRoot}/recommended/items`, {
        params,
        headers
    });

    return response.data;
};