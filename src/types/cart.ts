import type { ProductData } from './product'; 


export interface CartInfo {
  settlable: boolean;
  total: number;
  totalWithoutPromotion: number;
}

export interface CartItem {
  item: ProductData;
  quantity: number;
}

export interface UpdateCartQuantityResponse {
    cart: CartInfo;
    quantity: number;
}