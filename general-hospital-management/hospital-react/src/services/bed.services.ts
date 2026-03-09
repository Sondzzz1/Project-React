import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Bed {
    id: number;
    maGiuong: string;
    tenGiuong: string;
    khoaId?: number | string;
    tenKhoa?: string;
    loaiGiuong: 'Thường' | 'VIP' | 'ICU';
    giaGiuong: number;
    trangThai: 'Trống' | 'Đang sử dụng' | 'Bảo trì';
}

export interface CreateBedRequest {
    maGiuong: string;
    tenGiuong: string;
    khoaId?: number | string;
    loaiGiuong: string;
    giaGiuong: number;
    trangThai: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getBeds = async (): Promise<Bed[]> => {
    const response = await axiosInstance.get<Bed[]>(`${ENDPOINTS.BED}/get-all`);
    return response.data;
};

export const getBedById = async (id: number): Promise<Bed> => {
    const response = await axiosInstance.get<Bed>(`${ENDPOINTS.BED}/get-by-id/${id}`);
    return response.data;
};

export const getBedsByDepartment = async (khoaId: number): Promise<Bed[]> => {
    const response = await axiosInstance.get<Bed[]>(`${ENDPOINTS.BED}/by-department/${khoaId}`);
    return response.data;
};

export const getAvailableBeds = async (): Promise<Bed[]> => {
    const response = await axiosInstance.get<Bed[]>(`${ENDPOINTS.BED}/available`);
    return response.data;
};

export const createBed = async (bedData: CreateBedRequest): Promise<Bed> => {
    const response = await axiosInstance.post<Bed>(`${ENDPOINTS.BED}/create`, bedData);
    return response.data;
};

export const updateBed = async (id: number, bedData: Partial<CreateBedRequest>): Promise<Bed> => {
    const response = await axiosInstance.put<Bed>(`${ENDPOINTS.BED}/update`, { id, ...bedData });
    return response.data;
};

export const deleteBed = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.BED}/delete/${id}`);
};

// Legacy object export
export const bedApi = { getAll: getBeds, getById: getBedById, getByDepartment: getBedsByDepartment, getAvailable: getAvailableBeds, create: createBed, update: updateBed, delete: deleteBed };
export default bedApi;
