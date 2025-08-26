import * as uuid from 'uuid'
import type { imgURL } from './img'
export interface UserInfo {
    id: string
    email?: string
    createdAt?: string
}

export type UserRole = 'admin' | 'customer' | 'merchant' | 'rider'

export interface UserProfile {
    name: string
    description: string
    role: UserRole
    emailVisible: boolean
    createdAtVisible: boolean
}

export interface UserData extends UserInfo, UserProfile {
    avatar: {
        origin: string
        thumbnail: string
    }
}

export interface UserComment {
    id: string
    name: string
    avatar: imgURL
}

export const getDisplayUserRole = (role?: string) => {
    switch (role) {
        case 'admin':
            return '管理员'
        case 'customer':
            return '顾客'
        case 'merchant':
            return '商家'
        case 'rider':
            return '骑手'
        default:
            return '未知'
    }
}

export const getDisplayUserName = (name: string | undefined, id: string | undefined) => {
    if (!id) {
        return ''
    }
    try {
        if (!name) {
            return '用户 ' + btoa(String.fromCharCode(...uuid.parse(id))).slice(0, 8)
        }
        return name
    } catch (e) {
        return id
    }
}