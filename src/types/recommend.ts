/**
 * 图像链接
 */
export interface ImageUrl {
    /**
     * 原始图像的 URL
     */
    origin: string;
    /**
     * 缩略图的 URL
     */
    thumbnail: string;
}

/**
 * 地址信息
 */
export interface AddressInfo {
    /**
     * 详细地址
     */
    address: string;
    /**
     * 地级行政区名
     */
    city: string;
    /**
     * 经纬度坐标
     */
    coordinate: number[];
    /**
     * 县级行政区名
     */
    district: string;
    /**
     * 联系人姓名
     */
    name: string;
    /**
     * 省级行政区名
     */
    province: string;
    /**
     * 联系人电话
     */
    tel: string;
}

/**
 * 店铺内嵌的推荐商品信息
 */
export interface InnerRecommendedItem {
    available: boolean;
    categories: string[];
    cover: ImageUrl;
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

/**
 * GET /recommended/shops 的响应体中的店铺信息
 */
export interface RecommendedShop {
    address: AddressInfo;
    averagePrice: number;
    categories: string[];
    cover: ImageUrl;
    createdAt: Date;
    deliveryPrice: number;
    deliveryThreshold: number;
    description: string;
    detailImage: ImageUrl;
    distance: number;
    id: string;
    license: ImageUrl;
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

/**
 * GET /recommended/shops 的排序字段
 */
export enum RecommendedShopsSortBy {
    Comprehensive = "c", // 综合
    Rating = "r",        // 评分
    Time = "t",          // 时间
}

/**
 * GET /recommended/shops 的 Query 参数
 */
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

/**
 * GET /recommended/items 的响应体
 */
export interface RecommendedItem {
    available: boolean;
    categories: string[];
    cover: ImageUrl;
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

/**
 * GET /recommended/items 的排序字段
 */
export enum RecommendedItemsSortBy {
    Comprehensive = "c", // 综合
    Rating = "r",        // 评分
    Sale = "s",          // 销量
    Time = "t",          // 时间
}


/**
 * GET /recommended/items 的 Query 参数
 */
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