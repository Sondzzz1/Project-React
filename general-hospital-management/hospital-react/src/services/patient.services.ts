import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Patient {
    id: number;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    diaChi: string;
    soTheBaoHiem?: string;
    mucHuong?: number;
    hanTheBHYT?: string;
    trangThai: string;
}

export interface PatientSearchParams {
    hoTen?: string;
    keyword?: string;
    diaChi?: string;
    soTheBaoHiem?: string;
    pageIndex?: number;
    pageSize?: number;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getPatients = async (): Promise<ApiResponse<Patient[]>> => {
    const response = await axiosInstance.get<ApiResponse<Patient[]>>(`${ENDPOINTS.PATIENT}/get-all`);
    return response.data;
};

export const getPatientById = async (id: number): Promise<ApiResponse<Patient>> => {
    const response = await axiosInstance.get<ApiResponse<Patient>>(`${ENDPOINTS.PATIENT}/get-by-id/${id}`);
    return response.data;
};

export const createPatient = async (patientData: any): Promise<ApiResponse<Patient>> => {
    const response = await axiosInstance.post<ApiResponse<Patient>>(`${ENDPOINTS.PATIENT}/create`, patientData);
    return response.data;
};

export const updatePatient = async (id: number, patientData: any): Promise<ApiResponse<Patient>> => {
    const response = await axiosInstance.put<ApiResponse<Patient>>(`${ENDPOINTS.PATIENT}/update`, { ...patientData, id });
    return response.data;
};

export const deletePatient = async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`${ENDPOINTS.PATIENT}/delete/${id}`);
    return response.data;
};

export const searchPatients = async (searchData: any): Promise<ApiResponse<Patient[]>> => {
    const response = await axiosInstance.post<ApiResponse<Patient[]>>(`${ENDPOINTS.PATIENT}/search`, searchData);
    return response.data;
};

// Legacy object export
export const patientApi = { getAll: getPatients, getById: getPatientById, create: createPatient, update: updatePatient, delete: deletePatient, search: searchPatients };
export default patientApi;
