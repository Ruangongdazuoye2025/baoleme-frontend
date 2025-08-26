import type { ShopInfo } from './shop'
import type { Product } from './product'

export interface ShopHistoryRecord {
  createdAt: Date
  shop: ShopInfo
}

export interface ItemHistoryRecord {
  createdAt: Date
  item: Product
}