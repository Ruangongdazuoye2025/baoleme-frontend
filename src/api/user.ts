import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import type { UserData, UserProfile } from '@/types/user'
import axios from 'axios'

export const getUser = async (userId: string): Promise<UserData> => {
    const res = await axios.get(`${apiRoot}/user/${userId}`, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as UserData
}

export const patchUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<UserProfile> => {
    const res = await axios.patch(`${apiRoot}/user/${userId}/profile`, data, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
    return res.data as UserProfile
}