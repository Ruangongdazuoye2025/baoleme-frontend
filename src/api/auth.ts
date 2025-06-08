import { apiRoot } from '@/config/api'
import { useTokenStore } from '@/stores/token'
import axios from 'axios'

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    id: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    [property: string]: any;
}

export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
    // 建议路径为 /auth/login，如果后端是 /api/user/login，请修改此处
    const response = await axios.post<LoginResponse>(`${apiRoot}/auth/login`, data);
    return response.data;
}

/**
 * 调用后端接口发起注册请求
 * @param data 包含邮箱和密码的对象
 */
export const registerUser = async (data: RegisterRequest) => {
    await axios.post(`${apiRoot}/auth/register`, data)
}

export const updateEmail = async (newEmail: string) => {
    await axios.post(`${apiRoot}/auth/update-email`, { newEmail }, {
        headers: { Authorization: `Bearer ${useTokenStore().token}` }
    })
}

export interface VerifyRegisterRequest {
    token: string
    [property: string]: any
}

/**
 * 调用后端接口验证注册token
 * @param token JWT令牌
 */
export const verifyRegister = async (token: string) => {
    await axios.post<void>(`${apiRoot}/auth/verify-register`, { token } as VerifyRegisterRequest)
}

export interface ForgotPasswordRequest {
    /**
     * 邮箱
     */
    email: string;
    [property: string]: any;
}

/**
 * 调用后端接口发送忘记密码邮件
 * @param data 包含用户邮箱
 */
export const forgotPassword = async (data: ForgotPasswordRequest) => {
  await axios.post(`${apiRoot}/auth/forgot-password`, data);
};

// 新增：重设密码请求 Body 类型
export interface ResetPasswordRequest {
    /**
     * 新密码，长度至少为 6
     */
    newPassword: string;
    /**
     * JWT 令牌
     */
    token: string;
    [property: string]: any;
}

/**
 * 调用后端接口重设密码
 * @param data 包含新密码和令牌
 */
export const resetPassword = async (data: ResetPasswordRequest) => {
  await axios.post(`${apiRoot}/auth/reset-password`, data);
};

export interface VerifyEmailRequest {
    /**
     * JWT 令牌
     */
    token: string;
    [property: string]: any;
}

/**
 * 调用后端接口，使用token验证新的邮箱地址
 * @param token 从邮件链接中获取的JWT令牌
 */
export const verifyEmail = async (token: string) => {
    await axios.post<void>(`${apiRoot}/auth/verify-email`, { token } as VerifyEmailRequest);
}
