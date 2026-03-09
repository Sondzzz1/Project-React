import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

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

export const getNurses = async (): Promise<Nurse[]> => {
    const response = await axiosInstance.get<Nurse[]>(`${ENDPOINTS.NURSE}/get-all`);
    return response.data;
};

export const getNurseById = async (id: number): Promise<Nurse> => {
    const response = await axiosInstance.get<Nurse>(`${ENDPOINTS.NURSE}/get-by-id/${id}`);
    return response.data;
};

export const searchNurses = async (params: object): Promise<Nurse[]> => {
    const response = await axiosInstance.post<Nurse[]>(`${ENDPOINTS.NURSE}/search`, params);
    return response.data;
};

export const createNurse = async (nurseData: Omit<Nurse, 'id'>): Promise<Nurse> => {
    const response = await axiosInstance.post<Nurse>(`${ENDPOINTS.NURSE}/create`, nurseData);
    return response.data;
};

export const updateNurse = async (id: number, nurseData: Partial<Nurse>): Promise<Nurse> => {
    const response = await axiosInstance.put<Nurse>(`${ENDPOINTS.NURSE}/update`, { id, ...nurseData });
    return response.data;
};

export const deleteNurse = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.NURSE}/delete/${id}`);
};

// Legacy object export
export const nurseApi = { getAll: getNurses, getById: getNurseById, search: searchNurses, create: createNurse, update: updateNurse, delete: deleteNurse };
export default nurseApi;
