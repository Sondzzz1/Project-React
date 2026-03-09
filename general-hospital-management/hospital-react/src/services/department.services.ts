import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Department {
    id: number;
    tenKhoa: string;
    moTa?: string;
    truongKhoa?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getDepartments = async (): Promise<Department[]> => {
    const response = await axiosInstance.get<Department[]>(`${ENDPOINTS.DEPARTMENT}/get-all`);
    return response.data;
};

export const getDepartmentById = async (id: number): Promise<Department> => {
    const response = await axiosInstance.get<Department>(`${ENDPOINTS.DEPARTMENT}/get-by-id/${id}`);
    return response.data;
};

export const searchDepartments = async (params: object): Promise<Department[]> => {
    const response = await axiosInstance.post<Department[]>(`${ENDPOINTS.DEPARTMENT}/search`, params);
    return response.data;
};

export const createDepartment = async (deptData: Omit<Department, 'id'>): Promise<Department> => {
    const response = await axiosInstance.post<Department>(`${ENDPOINTS.DEPARTMENT}/create`, deptData);
    return response.data;
};

export const updateDepartment = async (id: number, deptData: Partial<Department>): Promise<Department> => {
    const response = await axiosInstance.put<Department>(`${ENDPOINTS.DEPARTMENT}/update`, { id, ...deptData });
    return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.DEPARTMENT}/delete/${id}`);
};

// Legacy object export
export const departmentApi = { getAll: getDepartments, getById: getDepartmentById, search: searchDepartments, create: createDepartment, update: updateDepartment, delete: deleteDepartment };
export default departmentApi;
