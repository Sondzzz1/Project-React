import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Doctor {
    id: string;           // Guid từ backend (BacSi.Id)
    hoTen: string;        // BacSi.HoTen
    chuyenKhoa: string;   // BacSi.ChuyenKhoa
    thongTinLienHe?: string; // BacSi.ThongTinLienHe
    soDienThoai?: string; // BacSi.SoDienThoai
    email?: string;       // BacSi.Email
    khoaId?: string;      // BacSi.KhoaId (Guid)
    tenKhoa?: string;     // join từ KhoaPhong.TenKhoa
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getDoctors = async (): Promise<ApiResponse<Doctor[]>> => {
    const response = await axiosInstance.get<ApiResponse<Doctor[]>>(`${ENDPOINTS.DOCTOR}/doctors`);
    return response.data;
};

export const getDoctorById = async (id: string): Promise<ApiResponse<Doctor>> => {
    const response = await axiosInstance.get<ApiResponse<Doctor>>(`${ENDPOINTS.DOCTOR}/${id}`);
    return response.data;
};

export const createDoctor = async (doctorData: Partial<Doctor>): Promise<ApiResponse<Doctor>> => {
    const response = await axiosInstance.post<ApiResponse<Doctor>>(`${ENDPOINTS.DOCTOR}`, doctorData);
    return response.data;
};

export const updateDoctor = async (id: string, doctorData: Partial<Doctor>): Promise<ApiResponse<Doctor>> => {
    const response = await axiosInstance.put<ApiResponse<Doctor>>(`${ENDPOINTS.DOCTOR}/${id}`, doctorData);
    return response.data;
};

export const deleteDoctor = async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`${ENDPOINTS.DOCTOR}/${id}`);
    return response.data;
};

export const searchDoctors = async (searchData: any): Promise<ApiResponse<Doctor[]>> => {
    const response = await axiosInstance.post<ApiResponse<Doctor[]>>(`${ENDPOINTS.DOCTOR}/search`, searchData);
    return response.data;
};

// Legacy object export
export const doctorApi = { getAll: getDoctors, getById: getDoctorById, create: createDoctor, update: updateDoctor, delete: deleteDoctor, search: searchDoctors };
export default doctorApi;
