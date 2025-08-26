export interface ItemCategory {
  id: string
  name: string
}

export type UpdateItemProfileData = Partial<{
  available: boolean
  categories: string[]
  description: string
  name: string
  price: number
  priceWithoutPromotion: number
  stockout: boolean
}>

export interface UpdateItemProfileResponse {
  available: boolean;
  categories: string[];
  description: string;
  name: string;
  price: number;
  priceWithoutPromotion: number;
  stockout: boolean;
}
