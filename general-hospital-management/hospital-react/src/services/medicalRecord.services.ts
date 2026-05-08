import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Khớp BacSiService MedicalRecordDto (JSON camelCase). Thêm chanDoan/ngayTao/bacSiId sau khi normalize cho UI. */
export interface MedicalRecord {
    id: string;
    nhapVienId?: string;
    tenBenhNhan?: string;
    tienSuBenh?: string;
    chanDoanBanDau?: string;
    /** Backend: ChuanDoan (cột DB / DTO) */
    chuanDoan?: string;
    chanDoanRaVien?: string;
    phuongAnDieuTri?: string;
    ketQuaDieuTri?: string;
    /** Ngày lập hồ sơ — tương đương "ngày tạo" trên UI */
    ngayLap?: string;
    bacSiPhuTrachId?: string;
    tenBacSi?: string;
    benhNhanId?: string;
    /** Gộp chẩn đoán hiển thị (derive từ chuanDoan / ban đầu / ra viện) */
    chanDoan?: string;
    /** Alias UI = ngayLap */
    ngayTao?: string;
    /** Alias UI = bacSiPhuTrachId */
    bacSiId?: string;
    ghiChu?: string;
}

/** Map tên trường backend → field UI đang dùng (tránh cột trống do sai tên). */
export function normalizeMedicalRecord(raw: MedicalRecord): MedicalRecord {
    const diagnosis =
        (raw.chuanDoan && String(raw.chuanDoan).trim()) ||
        (raw.chanDoanBanDau && String(raw.chanDoanBanDau).trim()) ||
        (raw.chanDoanRaVien && String(raw.chanDoanRaVien).trim()) ||
        (raw.chanDoan && String(raw.chanDoan).trim()) ||
        '';

    return {
        ...raw,
        chanDoan: diagnosis || raw.chanDoan,
        ngayTao: raw.ngayLap ?? raw.ngayTao,
        bacSiId: raw.bacSiPhuTrachId ?? raw.bacSiId,
    };
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getMedicalRecords = async (): Promise<ApiResponse<MedicalRecord[]>> => {
    const response = await axiosInstance.get(`${ENDPOINTS.MEDICAL_RECORD}/get-all-medical`);
    console.log('🔍 MedicalRecord API Response:', response.data);
    console.log('🔍 Response type:', typeof response.data);
    console.log('🔍 Is Array?', Array.isArray(response.data));
    
    // Xử lý response dựa trên format thực tế từ backend
    if (Array.isArray(response.data)) {
        const data = (response.data as MedicalRecord[]).map(normalizeMedicalRecord);
        return { data, success: true };
    }
    if (response.data?.data && Array.isArray(response.data.data)) {
        const data = (response.data.data as MedicalRecord[]).map(normalizeMedicalRecord);
        return { ...response.data, data };
    }
    return { data: [], success: false };
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
