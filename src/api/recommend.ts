import { apiRoot } from '@/config/api';
import { useTokenStore } from '@/stores/token';
import axios from 'axios';
import type { 
    GetRecommendedShopsRequest, 
    RecommendedShop,
    GetRecommendedItemsRequest,
    RecommendedItem 
} from '@/types/recommend';

export const getRecommendedShops = async (params: GetRecommendedShopsRequest): Promise<RecommendedShop[]> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<RecommendedShop[]>(`${apiRoot}/recommended/shops`, {
        params,
        headers
    });

    return response.data;
};

export const getRecommendedItems = async (params: GetRecommendedItemsRequest): Promise<RecommendedItem[]> => {
    const token = useTokenStore().token;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get<RecommendedItem[]>(`${apiRoot}/recommended/items`, {
        params,
        headers
    });

    return response.data;
};