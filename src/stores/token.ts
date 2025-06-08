import { getUser } from "@/api/user"
import type { UserRole } from "@/types/user"
import { defineStore } from "pinia"
import { ref } from "vue"

export const useTokenStore = defineStore('token', () => {
    const token = ref<string | null>(null)
    const userId = ref<string | null>(null)
    const admin = ref<boolean>(false)
    const role = ref<UserRole | null>(null)
    
    async function setToken(newToken: string, newUserId: string) {
        token.value = newToken
        userId.value = newUserId
        try {
            role.value = (await getUser(newUserId)).role
            admin.value = role.value === 'admin'
        } catch (e) {
            console.error('Failed to get user info', e)
            admin.value = false
            role.value = null
        }
    }

    async function setRole(newRole: UserRole) {
        role.value = newRole
        admin.value = newRole === 'admin'
    }
    
    function clearToken() {
        token.value = null
        userId.value = null
        admin.value = false
        role.value = null
    }
    
    return { token, userId, admin, role, setToken, clearToken, setRole }
}, {
    persist: {
        storage: localStorage,
        pick: ['token', 'userId', 'admin', 'role'],
    },
})