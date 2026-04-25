import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Nurse {
    id: string;              // Guid từ backend (Ytum.Id)
    hoTen: string;           // Ytum.HoTen
    ngaySinh?: string;       // Ytum.NgaySinh
    gioiTinh?: string;       // Ytum.GioiTinh
    khoaId?: string;         // Ytum.KhoaId (Guid)
    tenKhoa?: string;        // join từ KhoaPhong.TenKhoa
    soDienThoai?: string;    // Ytum.SoDienThoai
    chungChiHanhNghe?: string; // Ytum.ChungChiHanhNghe
    email?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getNurses = async (): Promise<ApiResponse<Nurse[]>> => {
    const response = await axiosInstance.get<Nurse[]>(`${ENDPOINTS.NURSE}/get-all`);
    // API trả về array trực tiếp, không có wrapper
    return { data: response.data, success: true };
};

export const getNurseById = async (id: string): Promise<ApiResponse<Nurse>> => {
    const response = await axiosInstance.get<ApiResponse<Nurse>>(`${ENDPOINTS.NURSE}/get-by-id/${id}`);
    return response.data;
};

export const createNurse = async (nurseData: Partial<Nurse>): Promise<ApiResponse<Nurse>> => {
    const response = await axiosInstance.post<ApiResponse<Nurse>>(`${ENDPOINTS.NURSE}/create`, nurseData);
    return response.data;
};

export const updateNurse = async (id: string, nurseData: Partial<Nurse>): Promise<ApiResponse<Nurse>> => {
    const response = await axiosInstance.put<ApiResponse<Nurse>>(`${ENDPOINTS.NURSE}/update`, { ...nurseData, id });
    return response.data;
};

export const deleteNurse = async (id: string): Promise<ApiResponse<void>> => {
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
