import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Nurse {
    id: number;
    hoTen: string;
    khoaId?: number;
    tenKhoa?: string;
    soDienThoai?: string;
    email?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getNurses = async (): Promise<ApiResponse<Nurse[]>> => {
    const response = await axiosInstance.get<ApiResponse<Nurse[]>>(`${ENDPOINTS.NURSE}/get-all`);
    return response.data;
};

export const getNurseById = async (id: number): Promise<ApiResponse<Nurse>> => {
    const response = await axiosInstance.get<ApiResponse<Nurse>>(`${ENDPOINTS.NURSE}/get-by-id/${id}`);
    return response.data;
};

export const createNurse = async (nurseData: any): Promise<ApiResponse<Nurse>> => {
    const response = await axiosInstance.post<ApiResponse<Nurse>>(`${ENDPOINTS.NURSE}/create`, nurseData);
    return response.data;
};

export const updateNurse = async (id: number, nurseData: any): Promise<ApiResponse<Nurse>> => {
    const response = await axiosInstance.put<ApiResponse<Nurse>>(`${ENDPOINTS.NURSE}/update`, { ...nurseData, id });
    return response.data;
};

export const deleteNurse = async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`${ENDPOINTS.NURSE}/delete/${id}`);
    return response.data;
};

export const searchNurses = async (searchData: any): Promise<ApiResponse<Nurse[]>> => {
    const response = await axiosInstance.post<ApiResponse<Nurse[]>>(`${ENDPOINTS.NURSE}/search`, searchData);
    return response.data;
};

// Legacy object export
export const nurseApi = { getAll: getNurses, getById: getNurseById, create: createNurse, update: updateNurse, delete: deleteNurse, search: searchNurses };
export default nurseApi;
