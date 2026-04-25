import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface MedicalRecord {
    id: string;                  // Guid từ backend (HoSoBenhAn.Id)
    nhapVienId?: string;         // HoSoBenhAn.NhapVienId
    tenBenhNhan?: string;        // join từ BenhNhan.HoTen qua NhapVien
    tienSuBenh?: string;         // HoSoBenhAn.TienSuBenh
    chanDoanBanDau?: string;     // HoSoBenhAn.ChanDoanBanDau
    chuanDoan?: string;          // HoSoBenhAn.ChuanDoan
    chanDoanRaVien?: string;     // HoSoBenhAn.ChanDoanRaVien
    phuongAnDieuTri?: string;    // HoSoBenhAn.PhuongAnDieuTri
    ketQuaDieuTri?: string;      // HoSoBenhAn.KetQuaDieuTri
    ngayLap?: string;            // HoSoBenhAn.NgayLap
    bacSiPhuTrachId?: string;    // HoSoBenhAn.BacSiPhuTrachId
    tenBacSi?: string;           // join từ BacSi.HoTen
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

export const createMedicalRecord = async (recordData: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> => {
    const response = await axiosInstance.post<ApiResponse<MedicalRecord>>(ENDPOINTS.MEDICAL_RECORD, recordData);
    return response.data;
};

export const updateMedicalRecord = async (id: string, recordData: Partial<MedicalRecord>): Promise<ApiResponse<MedicalRecord>> => {
    const response = await axiosInstance.put<ApiResponse<MedicalRecord>>(`${ENDPOINTS.MEDICAL_RECORD}/${id}`, recordData);
    return response.data;
};

export const deleteMedicalRecord = async (id: string): Promise<ApiResponse<void>> => {
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
