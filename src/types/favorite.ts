import type { ShopInfo } from './shop'
import type { Product } from './product'

export interface ShopFavoriteRecord {
  createdAt: Date
  shop: ShopInfo
}

export interface ItemFavoriteRecord {
  createdAt: Date
  item: Product
}