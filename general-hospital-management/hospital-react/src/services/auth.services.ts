import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthUser {
    id: any;
    username?: string;
    fullName?: string;
    tenDangNhap?: string;
    hoTen?: string;
    email?: string;
    role: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface LoginData {
    token: string;
    user?: AuthUser;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const login = async (username: string, password: string): Promise<ApiResponse<LoginData>> => {
    // Backend expect tiếng Việt: tenDangNhap và matKhau
    const response = await axiosInstance.post<ApiResponse<LoginData>>(`${ENDPOINTS.AUTH}/login`, {
        tenDangNhap: username,
        matKhau: password
    });
    return response.data;
};

export const register = async (userData: any): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`${ENDPOINTS.AUTH}/register`, userData);
    return response.data;
};

export const getMe = async (): Promise<ApiResponse<AuthUser>> => {
    const response = await axiosInstance.get<ApiResponse<AuthUser>>(`${ENDPOINTS.AUTH}/me`);
    return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(`${ENDPOINTS.AUTH}/change-password`, { oldPassword, newPassword });
    return response.data;
};

export const requestPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(`${ENDPOINTS.AUTH}/forgot-password`, { email });
    return response.data;
};

export const resetPassword = async (token: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.post<ApiResponse<void>>(`${ENDPOINTS.AUTH}/reset-password`, { token, newPassword });
    return response.data;
};

// Legacy object export for backward compatibility
export const authApi = { login, register, getMe, changePassword, requestPasswordReset, resetPassword };
export default authApi;
