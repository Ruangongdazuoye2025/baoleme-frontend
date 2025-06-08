import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import axios from 'axios'
import type { Address, AddressCreate } from '@/types/address'


export const getAddresses = async (): Promise<Address[]> => {
    const res = await axios.get(`${apiRoot}/addresses`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as Address[]
}

export const addAddresses = async (data: AddressCreate): Promise<Address> => {
    const res = await axios.post(`${apiRoot}/addresses`, data, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as Address
}

export const getAddressDetail = async (id: string): Promise<Address> => {
    const res = await axios.get(`${apiRoot}/addresses/${id}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as Address
}

export const updateAddress = async (id: string, data: Partial<AddressCreate>): Promise<Address> => {
    const res = await axios.patch(`${apiRoot}/addresses/${id}`, data, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as Address
}

export const deleteAddress = async (id: string): Promise<void> => {
    await axios.delete(`${apiRoot}/addresses/${id}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
}

export const moveAddress = async (id: string, before: string | null): Promise<void> => {
    await axios.patch(`${apiRoot}/addresses/${id}/pos`, { before }, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
}