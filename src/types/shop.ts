import type { Address } from "./address"
import type { imgURL } from "./img"

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
  createdAt: string;
  name: string;
  description: string;
  categories: string[];
  address: {
    coordinate: number[];
    province: string;
    city: string;
    district: string;
    address: string;
    name: string;
    tel: string;
  };
  verified: boolean;
  opened: boolean;
  openTimeStart: number;
  openTimeEnd: number;
  deliveryThreshold: number;
  deliveryPrice: number;
  maximumDistance: number;
  cover: {
    origin: string;
    thumbnail: string;
  };
  detailImage: {
    origin: string;
    thumbnail: string;
  };
  license: {
    origin: string;
    thumbnail: string;
  };
  rating: number;
  sale: number;
  averagePrice: number;
}

/**
 * 店铺统计数据
 */
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

/**
 * 店铺图像
 */
export interface ShopImg {
  cover: imgURL;
  detailImage: imgURL;
  license: imgURL;
  [property: string]: any;
}

/**
 * 店铺资料
 */
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
  address: {
    coordinate: number[];
    province: string;
    city: string;
    district: string;
    address: string;
    name: string;
    tel: string;
  }
  verified: boolean
  opened: boolean
  openTimeStart: number
  openTimeEnd: number
  deliveryThreshold: number
  deliveryPrice: number
  maximumDistance: number
}

/**
 * 店铺配送信息
 */
export interface ShopDeliveryInfo {
    distance: number;
    time: number;
    [property: string]: any;
}

/**
 * 店铺基本信息
 */
export interface ShopBase {
    createdAt: Date;
    id: string;
    owner: string;
    [property: string]: any;
}