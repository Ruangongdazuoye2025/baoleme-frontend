import type { UserComment } from '@/types/user'

export interface Comment  {
  id: string
  order: string
  rating: number 
  content: string
  user: UserComment
  createdAt: Date
}

export type UpdateCommentData = Partial<{
    content: string;
    rating: number;
}>

export interface UpdateCommentResponse {
    content: string;
    rating: number;
}