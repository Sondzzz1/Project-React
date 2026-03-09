import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Doctor {
    id: number;
    hoTen: string;
    chuyenKhoa: string;
    soDienThoai?: string;
    email?: string;
    khoaId?: number;
    tenKhoa?: string;
}

export interface DoctorSearchParams {
    keyword?: string;
    chuyenKhoa?: string;
    khoaId?: number;
    pageIndex?: number;
    pageSize?: number;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getDoctors = async (): Promise<Doctor[]> => {
    const response = await axiosInstance.get<Doctor[]>(`${ENDPOINTS.DOCTOR}/get-all`);
    return response.data;
};

export const getDoctorById = async (id: number): Promise<Doctor> => {
    const response = await axiosInstance.get<Doctor>(`${ENDPOINTS.DOCTOR}/get-by-id/${id}`);
    return response.data;
};

export const getDoctorsByDepartment = async (departmentId: number): Promise<Doctor[]> => {
    const response = await axiosInstance.get<Doctor[]>(`${ENDPOINTS.DOCTOR}/by-department/${departmentId}`);
    return response.data;
};

export const searchDoctors = async (params: DoctorSearchParams): Promise<Doctor[]> => {
    const response = await axiosInstance.post<Doctor[]>(`${ENDPOINTS.DOCTOR}/search`, params);
    return response.data;
};

export const createDoctor = async (doctorData: Omit<Doctor, 'id'>): Promise<Doctor> => {
    const response = await axiosInstance.post<Doctor>(`${ENDPOINTS.DOCTOR}/create`, doctorData);
    return response.data;
};

export const updateDoctor = async (id: number, doctorData: Partial<Doctor>): Promise<Doctor> => {
    const response = await axiosInstance.put<Doctor>(`${ENDPOINTS.DOCTOR}/update`, { id, ...doctorData });
    return response.data;
};

export const deleteDoctor = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.DOCTOR}/delete/${id}`);
};

// Legacy object export
export const doctorApi = { getAll: getDoctors, getById: getDoctorById, getByDepartment: getDoctorsByDepartment, search: searchDoctors, create: createDoctor, update: updateDoctor, delete: deleteDoctor };
export default doctorApi;
