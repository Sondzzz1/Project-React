import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Surgery {
    id: number;
    tenBenhNhan: string;
    tenBacSi: string;
    loaiPhauThuat: string;
    ngayPhauThuat: string;
    trangThai: string;
    benhNhanId?: number;
    bacSiId?: number;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getSurgeries = async (): Promise<Surgery[]> => {
    const response = await axiosInstance.get<Surgery[]>(ENDPOINTS.SURGERY);
    return response.data;
};

export const getSurgeryById = async (id: number): Promise<Surgery> => {
    const response = await axiosInstance.get<Surgery>(`${ENDPOINTS.SURGERY}/${id}`);
    return response.data;
};

export const getTodaySurgeries = async (): Promise<Surgery[]> => {
    const response = await axiosInstance.get<Surgery[]>(`${ENDPOINTS.SURGERY}/today`);
    return response.data;
};

export const getSurgeriesByDoctor = async (doctorId: number): Promise<Surgery[]> => {
    const response = await axiosInstance.get<Surgery[]>(`${ENDPOINTS.SURGERY}/by-doctor/${doctorId}`);
    return response.data;
};

export const createSurgery = async (surgeryData: Omit<Surgery, 'id'>): Promise<Surgery> => {
    const response = await axiosInstance.post<Surgery>(ENDPOINTS.SURGERY, surgeryData);
    return response.data;
};

export const updateSurgery = async (id: number, surgeryData: Partial<Surgery>): Promise<Surgery> => {
    const response = await axiosInstance.put<Surgery>(`${ENDPOINTS.SURGERY}/${id}`, surgeryData);
    return response.data;
};

export const deleteSurgery = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.SURGERY}/${id}`);
};

// Legacy object export
export const surgeryApi = { getAll: getSurgeries, getById: getSurgeryById, getToday: getTodaySurgeries, getByDoctor: getSurgeriesByDoctor, create: createSurgery, update: updateSurgery, delete: deleteSurgery };
export default surgeryApi;
