import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Surgery {
    id: string;              // Guid từ backend (PhauThuat.Id)
    nhapVienId?: string;     // PhauThuat.NhapVienId
    loaiPhauThuat?: string;  // PhauThuat.LoaiPhauThuat
    bacSiChinhId?: string;   // PhauThuat.BacSiChinhId
    tenBacSi?: string;       // join từ BacSi.HoTen
    tenBenhNhan?: string;    // join từ BenhNhan.HoTen qua NhapVien
    ekip?: string;           // PhauThuat.Ekip
    ngay?: string;           // PhauThuat.Ngay
    phongMo?: string;        // PhauThuat.PhongMo
    trangThai?: string;      // PhauThuat.TrangThai
    chiPhi?: number;         // PhauThuat.ChiPhi
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getSurgeries = async (): Promise<Surgery[]> => {
    const response = await axiosInstance.get<Surgery[]>(`${ENDPOINTS.SURGERY}/get-all-surgery`);
    return response.data;
};

export const getSurgeryById = async (id: string): Promise<Surgery> => {
    const response = await axiosInstance.get<Surgery>(`${ENDPOINTS.SURGERY}/${id}`);
    return response.data;
};

export const getTodaySurgeries = async (): Promise<Surgery[]> => {
    const response = await axiosInstance.get<Surgery[]>(`${ENDPOINTS.SURGERY}/today`);
    return response.data;
};

export const getSurgeriesByDoctor = async (doctorId: string): Promise<Surgery[]> => {
    const response = await axiosInstance.get<Surgery[]>(`${ENDPOINTS.SURGERY}/by-doctor/${doctorId}`);
    return response.data;
};

export const createSurgery = async (surgeryData: Partial<Surgery>): Promise<Surgery> => {
    const response = await axiosInstance.post<Surgery>(ENDPOINTS.SURGERY, surgeryData);
    return response.data;
};

export const updateSurgery = async (id: string, surgeryData: Partial<Surgery>): Promise<Surgery> => {
    const response = await axiosInstance.put<Surgery>(`${ENDPOINTS.SURGERY}/${id}`, surgeryData);
    return response.data;
};

export const deleteSurgery = async (id: string): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.SURGERY}/${id}`);
};

// Legacy object export
export const surgeryApi = { getAll: getSurgeries, getById: getSurgeryById, getToday: getTodaySurgeries, getByDoctor: getSurgeriesByDoctor, create: createSurgery, update: updateSurgery, delete: deleteSurgery };
export default surgeryApi;
