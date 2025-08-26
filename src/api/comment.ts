import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import type { Comment } from '@/types/comment'
import axios from 'axios'

export const getShopComments = async (
  shopId: string,
  p: number,
  pn: number
): Promise<Comment[]> => {
  const res = await axios.get<Comment[]>(`${apiRoot}/shop/${shopId}/comments`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` },
    params: { p, pn }
  })
  return res.data
}

export const getCommentByOrder = async (
  orderId: string
): Promise<Comment> => {
  const res = await axios.get<Comment>(
    `${apiRoot}/comments/by-order/${orderId}`,
    {
      headers: { Authorization: `Bearer ${useTokenStore().token}` }
    }
  )
  return res.data
}

export const createComment = async (data: {
  order: string
  rating: number
  content: string
}): Promise<Comment> => {
  const res = await axios.post<Comment>(`${apiRoot}/comments`, data, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })
  return res.data
}

export const deleteComment = async (commentId: string) => {
  return await axios.delete(`${apiRoot}/comments/${commentId}`, {
    headers: { Authorization: `Bearer ${useTokenStore().token}` }
  })// 返回状态
}

export const updateComment = async (
  commentId: string,
  data: { rating?: number; content?: string }
): Promise<Comment> => {
  const res = await axios.patch<Comment>(
    `${apiRoot}/comments/${commentId}`,
    data,
    {
      headers: { Authorization: `Bearer ${useTokenStore().token}` }
    }
  )
  return res.data
}