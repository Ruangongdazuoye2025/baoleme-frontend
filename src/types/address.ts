export interface Address {
  id: string;
  name: string;
  tel: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
  coordinate: number[];
}

export interface AddressCreate {
  name: string;
  tel: string;
  province: string;
  city: string;
  district: string;
  address: string;
  isDefault: boolean;
  coordinate: number[];
}

export interface ShopAddress{
  address: string
  city: string
  coordinate: number[]
  district: string
  name: string
  province: string
  tel: string
}