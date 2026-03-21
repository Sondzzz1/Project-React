import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MedicalRecord {
    id: number;
    tenBenhNhan: string;
    chanDoan: string;
    tenBacSi: string;
    ngayTao: string;
    benhNhanId?: number;
    bacSiId?: number;
    ghiChu?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getMedicalRecords = async (): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await axiosInstance.get<ApiResponse<MedicalRecord[]>>(`${ENDPOINTS.MEDICAL_RECORD}/get-all-medical`);
    return response.data;
};

export const createMedicalRecord = async (recordData: any): Promise<ApiResponse<MedicalRecord>> => {
    const response = await axiosInstance.post<ApiResponse<MedicalRecord>>(ENDPOINTS.MEDICAL_RECORD, recordData);
    return response.data;
};

export const updateMedicalRecord = async (id: number, recordData: any): Promise<ApiResponse<MedicalRecord>> => {
    const response = await axiosInstance.put<ApiResponse<MedicalRecord>>(`${ENDPOINTS.MEDICAL_RECORD}/${id}`, recordData);
    return response.data;
};

export const deleteMedicalRecord = async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`${ENDPOINTS.MEDICAL_RECORD}/${id}`);
    return response.data;
};

export const searchMedicalRecords = async (searchData: any): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await axiosInstance.post<ApiResponse<MedicalRecord[]>>(`${ENDPOINTS.MEDICAL_RECORD}/search`, searchData);
    return response.data;
};

// Legacy object export
export const medicalRecordApi = { getAll: getMedicalRecords, create: createMedicalRecord, update: updateMedicalRecord, delete: deleteMedicalRecord, search: searchMedicalRecords };
export default medicalRecordApi;
