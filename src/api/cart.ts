import { apiRoot } from '@/config/api';
import { useTokenStore } from '@/stores/token';
import axios from 'axios';
import type { CartInfo, CartItem, UpdateCartQuantityResponse } from '@/types/cart';

export const getCart = async (shopId: string) : Promise<CartInfo> => {
    const res = await axios.get(`${apiRoot}/cart/${shopId}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}`}
    })
    return res.data as CartInfo 
}

export const getCartInfo = async (shopId: string): Promise<CartInfo> => {
    const res = await axios.get(`${apiRoot}/cart/${shopId}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
    return res.data as CartInfo;
};

export const getCartItems = async (shopId: string): Promise<CartItem[]> => {
    const res = await axios.get(`${apiRoot}/cart/${shopId}/items`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
    return res.data as CartItem[];
};
export const updateCartItemQuantity = async (shopId: string, itemId: string, quantity: number): Promise<UpdateCartQuantityResponse> => {
    const res = await axios.patch(
        `${apiRoot}/cart/${shopId}/item/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${useTokenStore().token}` } }
    );
    return res.data as UpdateCartQuantityResponse;
};

export const clearCart = async (shopId: string): Promise<void> => {
    await axios.delete(`${apiRoot}/cart/${shopId}/items`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
};