import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

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

export const getMedicalRecords = async (): Promise<MedicalRecord[]> => {
    const response = await axiosInstance.get<MedicalRecord[]>(ENDPOINTS.MEDICAL_RECORD);
    return response.data;
};

export const getMedicalRecordById = async (id: number): Promise<MedicalRecord> => {
    const response = await axiosInstance.get<MedicalRecord>(`${ENDPOINTS.MEDICAL_RECORD}/${id}`);
    return response.data;
};

export const getMedicalRecordsByPatient = async (patientId: number): Promise<MedicalRecord[]> => {
    const response = await axiosInstance.get<MedicalRecord[]>(`${ENDPOINTS.MEDICAL_RECORD}/patient/${patientId}`);
    return response.data;
};

export const createMedicalRecord = async (recordData: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> => {
    const response = await axiosInstance.post<MedicalRecord>(ENDPOINTS.MEDICAL_RECORD, recordData);
    return response.data;
};

export const updateMedicalRecord = async (id: number, recordData: Partial<MedicalRecord>): Promise<MedicalRecord> => {
    const response = await axiosInstance.put<MedicalRecord>(`${ENDPOINTS.MEDICAL_RECORD}/${id}`, recordData);
    return response.data;
};

export const deleteMedicalRecord = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.MEDICAL_RECORD}/${id}`);
};

// Legacy object export
export const medicalRecordApi = { getAll: getMedicalRecords, getById: getMedicalRecordById, getByPatient: getMedicalRecordsByPatient, create: createMedicalRecord, update: updateMedicalRecord, delete: deleteMedicalRecord };
export default medicalRecordApi;
