import type { imgURL } from "./img";

export type GetShopProductsByCategoryResponse = ProductData[];
export type GetProductDetailResponse = ProductData;
export type GetShopAllProductsResponse = ProductData[];
export type CreateProductBody = ProductProfileData;
export type CreateProductResponse = ProductData;
export type UpdateProductProfileBody = Partial<ProductProfileData>;
export type UpdateProductProfileResponse = ProductProfileData;
export type UpdateProductCoverResponse = ProductImageData;
export type DeleteProductResponse = void;

export interface ProductProfileData {
  available: boolean;
  categories: string[];
  description: string;
  name: string;
  price: number;
  priceWithoutPromotion: number;
  stockout: boolean;
  [property: string]: any;
}

export interface ProductData extends ProductProfileData {
  createdAt: Date;
  id: string;
  shopId: string;
  cover: imgURL;
  rating: number;
  sale: number;
  [property: string]: any;
}

export interface ProductImageData {
  cover: imgURL;
  [property: string]: any;
}

export interface GetShopProductsByCategoryPathParams {
  categoryId: string;
  shopId: string;
}

export interface GetShopProductsByCategoryQueryParams {
  p?: number; 
  pn?: number; 
}

export interface GetProductDetailPathParams {
  id: string;
}

export interface GetShopAllProductsPathParams {
  shopId: string;
}

export interface CreateProductPathParams {
  shopId: string;
}

export interface UpdateProductProfilePathParams {
  id: string; 
}

export interface UpdateProductCoverPathParams {
  id: string;
}

export interface DeleteProductPathParams {
  id: string;
}

export interface Product {
  image: string
  id: string
  shopId: string
  createdAt: string
  name: string
  description: string
  available: boolean
  stockout: boolean
  priceWithoutPromotion: number
  categories: string[]
  cover:imgURL
  rating: number
  price: number
  discount?: string
  sale: number
}

export interface RecommendedProductsParams {
  p?: number 
  pn?: number
  q?: string 
  c?: string[] 
  r?: number 
  s?: string 
  a?: string 
  min_p?: number 
  max_p?: number 
}