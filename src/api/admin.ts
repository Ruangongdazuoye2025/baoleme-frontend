import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import type { ProductData } from '@/types/product' 
import axios from 'axios'
import type { ShopInfo , UpdateShopProfileData, UpdateShopProfileResponse, GetShopsRequest} from '@/types/shop'
import type { UpdateItemProfileData , UpdateItemProfileResponse} from '@/types/item'
import type { Comment , UpdateCommentData, UpdateCommentResponse} from '@/types/comment'
import type { Status ,Order, GetOrdersRequest} from '@/types/order'

export const getShopsForAdmin = async (params?: GetShopsRequest) : Promise<ShopInfo[]> => {
  const res = await axios.get(`${apiRoot}/shops`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: params
  })
  return res.data as ShopInfo[]
}

export const getShopItemsForAdmin = async (shopId: string, params?: { p?: number; pn?: number }) : Promise<ProductData[]> => {
  const res = await axios.get(`${apiRoot}/shops/${shopId}/items`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: params
  })
  return res.data as ProductData[]
}

export const getItemDetailForAdmin = async (itemId: string) : Promise<ProductData> => {
  const res = await axios.get(`${apiRoot}/items/${itemId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as ProductData
}

export const updateItemProfile = async (itemId: string, data: UpdateItemProfileData) : Promise<UpdateItemProfileResponse> => {
  const res = await axios.patch(`${apiRoot}/items/${itemId}/profile`, data, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data as UpdateItemProfileResponse
}

export const updateShopProfile = async (shopId: string, data: UpdateShopProfileData) : Promise<UpdateShopProfileResponse> => {
    const res = await axios.patch(`${apiRoot}/shops/${shopId}/profile`, data, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
    return res.data as UpdateShopProfileResponse;
}

export const getShopComments = async (shopId: string, params: { p: number; pn: number }) : Promise<Comment[]> => {
    const res = await axios.get(`${apiRoot}/shop/${shopId}/comments`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` },
        params
    });
    return res.data as Comment[];
}

export const deleteComment = async (commentId: string) : Promise<void> => {
    await axios.delete(`${apiRoot}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
}

export const updateComment = async (commentId: string, data: UpdateCommentData) : Promise<UpdateCommentResponse> => {
    const res = await axios.patch(`${apiRoot}/comments/${commentId}`, data, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
    return res.data as UpdateCommentResponse;
}

export const getOrdersForAdmin = async (params?: GetOrdersRequest) : Promise<Order[]> => {
    const res = await axios.get(`${apiRoot}/orders`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` },
        params
    });
    return res.data as Order[];
}

export const getOrderDetailForAdmin = async (orderId: string) : Promise<Order> => {
    const res = await axios.get(`${apiRoot}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
    return res.data as Order;
}

export const updateOrderStatusForAdmin = async (orderId: string, status: Status) : Promise<Order> => {
    const res = await axios.patch(`${apiRoot}/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
    return res.data as  Order;
}

export const deleteCanceledOrderForAdmin = async (orderId: string) : Promise<void> => {
    await axios.delete(`${apiRoot}/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    });
}