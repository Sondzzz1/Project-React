import axiosInstance from './axiosInstance';

// ─── Types ─────────────────────────────────────────────────────────────────────

import { ENDPOINTS } from '../constant/api';

const USER_URL = ENDPOINTS.USER_MANAGEMENT;

export interface ManagedUser {
    id: string;
    tenDangNhap: string;
    hoTen: string;
    email: string;
    role: string;
}

export interface CreateUserRequest {
    tenDangNhap: string;
    matKhau: string;
    hoTen: string;
    email: string;
    role: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getUsers = async (params?: object): Promise<ManagedUser[]> => {
    const response = await axiosInstance.get<any>(USER_URL, { params });
    return response.data?.data || response.data || [];
};

export const getUserById = async (id: string): Promise<ManagedUser> => {
    const response = await axiosInstance.get<any>(`${USER_URL}/${id}`);
    return response.data?.data || response.data;
};

export const createUser = async (userData: CreateUserRequest): Promise<ManagedUser> => {
    const response = await axiosInstance.post<any>(USER_URL, userData);
    return response.data?.data || response.data;
};

export const updateUser = async (id: string, userData: Partial<CreateUserRequest>): Promise<ManagedUser> => {
    const response = await axiosInstance.put<any>(`${USER_URL}/${id}`, userData);
    return response.data?.data || response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await axiosInstance.delete(`${USER_URL}/${id}`);
};

export const resetUserPassword = async (userId: string): Promise<void> => {
    await axiosInstance.post(`${USER_URL}/reset-password`, { id: userId });
};

export const assignRole = async (userId: string, roleId: string): Promise<void> => {
    await axiosInstance.post(`${USER_URL}/${userId}/assign-role`, { roleId });
};

// Legacy object export
export const userManagementApi = { getAll: getUsers, getById: getUserById, create: createUser, update: updateUser, delete: deleteUser, resetPassword: resetUserPassword, assignRole };
export default userManagementApi;
