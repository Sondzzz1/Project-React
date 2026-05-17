import axiosInstance from './axiosInstance';

// ─── Types ─────────────────────────────────────────────────────────────────────

import { ENDPOINTS } from '../constant/api';

const USER_URL = ENDPOINTS.USER_MANAGEMENT;

export interface ManagedUser {
    id: string;
    tenDangNhap?: string;
    hoTen?: string;
    email?: string;
    soDienThoai?: string;
    role?: string;
    vaiTro?: string;
    isActive?: boolean;
}

export interface CreateUserRequest {
    tenDangNhap: string;
    matKhau: string;
    hoTen: string;
    email: string;
    soDienThoai: string;
    role: string;
    vaiTro?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

const unwrap = (responseData: any) => {
    if (!responseData) return [];
    // Hỗ trợ cả .data (camelCase) và .Data (PascalCase) từ Backend
    return responseData.data || responseData.Data || responseData.items || responseData.Items || responseData;
};

const normalizeUser = (user: any): ManagedUser => {
    if (!user) return {} as ManagedUser;
    
    // Hỗ trợ bóc tách nếu user bị bọc trong một object khác (vd: { account: {...} })
    const raw = user.account || user.Account || user.profile || user.Profile || user;

    return {
        id: raw.id || raw.Id || raw._id || '',
        tenDangNhap: raw.tenDangNhap || raw.TenDangNhap || raw.userName || raw.UserName || raw.username || '',
        hoTen: raw.hoTen || raw.HoTen || raw.fullName || raw.FullName || raw.name || raw.Name || raw.hoVaTen || '',
        email: raw.email || raw.Email || raw.emailAddress || raw.EmailAddress || '',
        soDienThoai: raw.soDienThoai || raw.SoDienThoai || raw.phoneNumber || raw.PhoneNumber || raw.phone || raw.Phone || raw.sdt || '',
        role: raw.role || raw.Role || raw.vaiTro || raw.VaiTro || 'BenhNhan',
        vaiTro: raw.vaiTro || raw.VaiTro || raw.role || raw.Role || 'BenhNhan',
        isActive: raw.isActive ?? raw.IsActive ?? true,
    };
};

export const getUsers = async (params?: object): Promise<ManagedUser[]> => {
    const response = await axiosInstance.get<any>(USER_URL, { params });
    const data = unwrap(response.data);
    return Array.isArray(data) ? data.map(normalizeUser) : [];
};

export const getUserById = async (id: string): Promise<ManagedUser> => {
    const response = await axiosInstance.get<any>(`${USER_URL}/${id}`);
    return normalizeUser(unwrap(response.data));
};

export const createUser = async (userData: CreateUserRequest): Promise<ManagedUser> => {
    const response = await axiosInstance.post<any>(USER_URL, userData);
    return normalizeUser(unwrap(response.data));
};

export const updateUser = async (id: string, userData: Partial<CreateUserRequest>): Promise<ManagedUser> => {
    const response = await axiosInstance.put<any>(`${USER_URL}/${id}`, userData);
    return normalizeUser(unwrap(response.data));
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
