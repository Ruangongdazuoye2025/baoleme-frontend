import type { Address } from "./address"
import type { imgURL } from "./img"
import type { ShopAddress } from "./address"
export interface OrderStats {
  sales: number[]
  incomes: number[]
}

export interface TopProducts {
  totalSale: number
  totalIncome: number
  bySale: {
    name: string
    queriedSale: number
  }[]
  byIncome: {
    name: string
    queriedIncome: number
  }[]
}


export interface ShopInfo {
  id: string;
  owner: string;
  createdAt: Date;
  name: string;
  description: string;
  categories: string[];
  address: ShopAddress;
  verified: boolean;
  opened: boolean;
  openTimeStart: number;
  openTimeEnd: number;
  deliveryThreshold: number;
  deliveryPrice: number;
  maximumDistance: number;
  cover: imgURL;
  detailImage: imgURL;
  license: imgURL;
  rating: number;
  sale: number;
  averagePrice: number;
}

export interface ShopStatistic {
  averagePrice: number;
  rating: number;
  sale: number;
  [property: string]: any;
}

export interface ShopStats {
  sales: number[];
  incomes: number[];
}

export interface ShopImg {
  cover: imgURL;
  detailImage: imgURL;
  license: imgURL;
  [property: string]: any;
}

export interface ShopDelivery {
  address: Address;
  categories: string[];
  deliveryPrice: number;
  deliveryThreshold: number;
  description: string;
  maximumDistance: number;
  name: string;
  opened: boolean;
  openTimeEnd: number;
  openTimeStart: number;
  verified: boolean;
  [property: string]: any;
}
export interface ShopProfile {
  name: string
  description: string
  categories: string[]
  address: ShopAddress
  verified: boolean
  opened: boolean
  openTimeStart: number
  openTimeEnd: number
  deliveryThreshold: number
  deliveryPrice: number
  maximumDistance: number
}

export interface ShopDeliveryInfo {
    distance: number;
    time: number;
    [property: string]: any;
}

export interface ShopBase {
    createdAt: Date;
    id: string;
    owner: string;
    [property: string]: any;
}

export type UpdateShopProfileData = Partial<{
  address: Partial<ShopAddress>;
  categories: string[];
  deliveryPrice: number;
  deliveryThreshold: number;
  description: string;
  maximumDistance: number;
  name: string;
  opened: boolean;
  openTimeEnd: number;
  openTimeStart: number;
  verified: boolean;
}>;

export interface UpdateShopProfileResponse {
  address:ShopAddress;
  categories: string[];
  deliveryPrice: number;
  deliveryThreshold: number;
  description: string;
  maximumDistance: number;
  name: string;
  opened: boolean;
  openTimeEnd: number;
  openTimeStart: number;
  verified: boolean;
}

export interface GetShopsRequest {
  max_ca?: string
  min_ca?: string
  p?: number
  pn?: number
  q?: string
}

