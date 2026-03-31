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
    const response = await axiosInstance.get(`${ENDPOINTS.MEDICAL_RECORD}/get-all-medical`);
    console.log('🔍 MedicalRecord API Response:', response.data);
    console.log('🔍 Response type:', typeof response.data);
    console.log('🔍 Is Array?', Array.isArray(response.data));
    
    // Xử lý response dựa trên format thực tế từ backend
    if (Array.isArray(response.data)) {
        // Nếu API trả về array trực tiếp: [...]
        return { data: response.data, success: true };
    } else if (response.data?.data) {
        // Nếu API trả về wrapped: { success: true, data: [...] }
        return response.data;
    } else {
        // Fallback
        return { data: [], success: false };
    }
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
