import type { imgURL } from "./img";
import type { ShopAddress } from "./address";


export interface InnerRecommendedItem {
    available: boolean;
    categories: string[];
    cover: imgURL;
    createdAt: Date;
    description: string;
    id: string;
    name: string;
    price: number;
    priceWithoutPromotion: number;
    rating: number;
    sale: number;
    shopId: string;
    stockout: boolean;
}


export interface RecommendedShop {
    address: ShopAddress;
    averagePrice: number;
    categories: string[];
    cover: imgURL;
    createdAt: Date;
    deliveryPrice: number;
    deliveryThreshold: number;
    description: string;
    detailImage: imgURL;
    distance: number;
    id: string;
    license: imgURL;
    maximumDistance: number;
    name: string;
    opened: boolean;
    openTimeEnd: number;
    openTimeStart: number;
    owner: string;
    rating: number;
    recommends: InnerRecommendedItem[];
    sale: number;
    time: number;
    verified: boolean;
}

export enum RecommendedShopsSortBy {
    Comprehensive = "c", // 综合
    Rating = "r",        // 评分
    Time = "t",          // 时间
}

export interface GetRecommendedShopsRequest {
    a?: string;
    c?: string[];
    d?: number;
    p?: number;
    pn?: number;
    q?: string;
    r?: number;
    rc?: number;
    s?: RecommendedShopsSortBy;
    t?: number;
}

export interface RecommendedItem {
    available: boolean;
    categories: string[];
    cover:imgURL;
    createdAt: Date;
    description: string;
    id: string;
    name: string;
    price: number;
    priceWithoutPromotion: number;
    rating: number;
    sale: number;
    shopId: string;
    stockout: boolean;
}

export enum RecommendedItemsSortBy {
    Comprehensive = "c", // 综合
    Rating = "r",        // 评分
    Sale = "s",          // 销量
    Time = "t",          // 时间
}

export interface GetRecommendedItemsRequest {
    a?: string;
    c?: string[];
    max_p?: number;
    min_p?: number;
    p?: number;
    pn?: number;
    q?: string;
    r?: number;
    s?: RecommendedItemsSortBy;
}