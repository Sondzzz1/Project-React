import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Admission {
    id: number;
    benhNhanId: number;
    tenBenhNhan: string;
    giuongId: number;
    tenGiuong?: string;
    khoaId: number;
    tenKhoa?: string;
    ngayNhapVien: string;
    ngayXuatVien?: string;
    trangThai: string;
}

export interface CreateAdmissionRequest {
    benhNhanId: number;
    giuongId: number;
    khoaId: number;
    ngayNhapVien?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getAdmissions = async (): Promise<Admission[]> => {
    const response = await axiosInstance.get<Admission[]>(`${ENDPOINTS.ADMISSION}/get-all`);
    return response.data;
};

export const getAdmissionById = async (id: number): Promise<Admission> => {
    const response = await axiosInstance.get<Admission>(`${ENDPOINTS.ADMISSION}/get-by-id/${id}`);
    return response.data;
};

export const createAdmission = async (admissionData: CreateAdmissionRequest): Promise<Admission> => {
    const response = await axiosInstance.post<Admission>(`${ENDPOINTS.ADMISSION}/create`, admissionData);
    return response.data;
};

export const transferBed = async (nhapVienId: number, newBedId: number, reason: string): Promise<void> => {
    await axiosInstance.post(`${ENDPOINTS.ADMISSION}/transfer-bed`, { nhapVienId, giuongMoiId: newBedId, lyDo: reason });
};

export const dischargePatient = async (nhapVienId: number): Promise<void> => {
    await axiosInstance.post(`${ENDPOINTS.ADMISSION}/xuat-vien/${nhapVienId}`);
};

export const getReadyForDischarge = async (): Promise<Admission[]> => {
    const response = await axiosInstance.get<Admission[]>(`${ENDPOINTS.ADMISSION}/ready-for-discharge`);
    return response.data;
};

// Legacy object export
export const admissionApi = { getAll: getAdmissions, getById: getAdmissionById, create: createAdmission, transferBed, discharge: dischargePatient, getReadyForDischarge };
export default admissionApi;
