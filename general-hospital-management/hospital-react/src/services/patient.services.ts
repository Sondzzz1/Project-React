import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

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

export interface CreatePatientRequest {
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    diaChi: string;
    soTheBaoHiem?: string;
    mucHuong?: number;
    hanTheBHYT?: string | null;
    trangThai: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getPatients = async (): Promise<Patient[]> => {
    const response = await axiosInstance.get<Patient[]>(`${ENDPOINTS.PATIENT}/get-all`);
    return response.data;
};

export const getPatientById = async (id: number): Promise<Patient> => {
    const response = await axiosInstance.get<Patient>(`${ENDPOINTS.PATIENT}/get-by-id/${id}`);
    return response.data;
};

export const searchPatients = async (params: PatientSearchParams): Promise<{ data: Patient[] } | Patient[]> => {
    const response = await axiosInstance.post(`${ENDPOINTS.PATIENT}/search`, {
        HoTen: params.hoTen || params.keyword || null,
        DiaChi: params.diaChi || null,
        SoTheBaoHiem: params.soTheBaoHiem || null,
        pageIndex: params.pageIndex || 1,
        pageSize: params.pageSize || 10,
    });
    return response.data;
};

const formatPatientDate = (dateStr?: string): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toISOString().split('T')[0];
};

export const createPatient = async (patient: CreatePatientRequest): Promise<Patient> => {
    const requestData = {
        hoTen: patient.hoTen || '',
        ngaySinh: formatPatientDate(patient.ngaySinh),
        gioiTinh: patient.gioiTinh || '',
        diaChi: patient.diaChi || '',
        soTheBaoHiem: patient.soTheBaoHiem || '',
        mucHuong: patient.mucHuong,
        hanTheBHYT: patient.hanTheBHYT ? new Date(patient.hanTheBHYT).toISOString() : null,
        trangThai: patient.trangThai || 'Đang điều trị',
    };
    const response = await axiosInstance.post<Patient>(`${ENDPOINTS.PATIENT}/create`, requestData);
    return response.data;
};

export const updatePatient = async (id: number, patient: Partial<CreatePatientRequest>): Promise<Patient> => {
    const requestData = {
        id,
        hoTen: patient.hoTen || '',
        ngaySinh: formatPatientDate(patient.ngaySinh),
        gioiTinh: patient.gioiTinh || '',
        diaChi: patient.diaChi || '',
        soTheBaoHiem: patient.soTheBaoHiem || '',
        mucHuong: patient.mucHuong,
        hanTheBHYT: patient.hanTheBHYT ? new Date(patient.hanTheBHYT).toISOString() : null,
        trangThai: patient.trangThai || 'Đang điều trị',
    };
    const response = await axiosInstance.put<Patient>(`${ENDPOINTS.PATIENT}/update`, requestData);
    return response.data;
};

export const deletePatient = async (id: number): Promise<void> => {
    await axiosInstance.delete(`${ENDPOINTS.PATIENT}/delete/${id}`);
};

// Legacy object export
export const patientApi = { getAll: getPatients, getById: getPatientById, search: searchPatients, create: createPatient, update: updatePatient, delete: deletePatient };
export default patientApi;
