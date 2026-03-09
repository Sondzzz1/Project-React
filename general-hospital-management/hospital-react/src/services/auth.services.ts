import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
    tenDangNhap: string;
    matKhau: string;
}

export interface AuthUser {
    id: number;
    tenDangNhap: string;
    hoTen: string;
    email: string;
    role: string;
    vaiTro?: string;
}

export interface LoginResponse extends AuthUser {
    token: string;
}

export interface RegisterRequest {
    tenDangNhap: string;
    matKhau: string;
    hoTen: string;
    email: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const login = async (tenDangNhap: string, matKhau: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(`${ENDPOINTS.AUTH}/login`, { tenDangNhap, matKhau });
    return response.data;
};

export const register = async (userData: RegisterRequest): Promise<AuthUser> => {
    const response = await axiosInstance.post<AuthUser>(`${ENDPOINTS.AUTH}/register`, userData);
    return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    await axiosInstance.post(`${ENDPOINTS.AUTH}/change-password`, { oldPassword, newPassword });
};

export const requestPasswordReset = async (email: string): Promise<void> => {
    await axiosInstance.post(`${ENDPOINTS.AUTH}/forgot-password`, { email });
};

// Legacy object export for backward compatibility
export const authApi = { login, register, changePassword, requestPasswordReset };
export default authApi;
