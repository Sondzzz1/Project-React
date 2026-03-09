import axiosInstance from './axiosInstance';

// ─── Types ─────────────────────────────────────────────────────────────────────

const USER_URL = '/api/usermanagement';

export interface ManagedUser {
    id: number;
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
    const response = await axiosInstance.get<ManagedUser[]>(USER_URL, { params });
    return response.data;
};

export const getUserById = async (id: number): Promise<ManagedUser> => {
    const response = await axiosInstance.get<ManagedUser>(`${USER_URL}/${id}`);
    return response.data;
};

export const createUser = async (userData: CreateUserRequest): Promise<ManagedUser> => {
    const response = await axiosInstance.post<ManagedUser>(USER_URL, userData);
    return response.data;
};

export const updateUser = async (id: number, userData: Partial<CreateUserRequest>): Promise<ManagedUser> => {
    const response = await axiosInstance.put<ManagedUser>(`${USER_URL}/${id}`, userData);
    return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${USER_URL}/${id}`);
};

export const resetPassword = async (userId: number): Promise<void> => {
    await axiosInstance.post(`${USER_URL}/${userId}/reset-password`);
};

export const assignRole = async (userId: number, roleId: string): Promise<void> => {
    await axiosInstance.post(`${USER_URL}/${userId}/assign-role`, { roleId });
};

// Legacy object export
export const userManagementApi = { getAll: getUsers, getById: getUserById, create: createUser, update: updateUser, delete: deleteUser, resetPassword, assignRole };
export default userManagementApi;
