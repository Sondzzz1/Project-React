import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Appointment {
    id?: string;
    hoTen: string;
    soDienThoai: string;
    email?: string;
    ngaySinh?: string;
    gioiTinh?: string;
    khoaKham: string;
    bacSi?: string;
    ngayKham: string;
    gioKham: string;
    trieuChung?: string;
    bhyt?: string;
    trangThai?: string;
}

export interface CreateAppointmentRequest {
    hoTen: string;
    soDienThoai: string;
    email?: string;
    ngaySinh?: string;
    gioiTinh?: string;
    khoaKham: string;
    bacSiId?: string;
    ngayKham: string;
    gioKham: string;
    trieuChung?: string;
    soTheBaoHiem?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const createAppointment = async (appointmentData: CreateAppointmentRequest): Promise<{ success: boolean; message: string; data?: Appointment }> => {
    const response = await axiosInstance.post<{ success: boolean; message: string; data?: Appointment }>(
        `${ENDPOINTS.APPOINTMENT}/create`,
        appointmentData
    );
    return response.data;
};

export const getAppointments = async (): Promise<Appointment[]> => {
    const response = await axiosInstance.get<Appointment[]>(`${ENDPOINTS.APPOINTMENT}/get-all`);
    return response.data;
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
    const response = await axiosInstance.get<Appointment>(`${ENDPOINTS.APPOINTMENT}/${id}`);
    return response.data;
};

export const updateAppointment = async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await axiosInstance.put<Appointment>(`${ENDPOINTS.APPOINTMENT}/update`, { id, ...appointmentData });
    return response.data;
};

export const cancelAppointment = async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.put<{ message: string }>(`${ENDPOINTS.APPOINTMENT}/cancel/${id}`);
    return response.data;
};

// Legacy object export
export const appointmentApi = {
    create: createAppointment,
    getAll: getAppointments,
    getById: getAppointmentById,
    update: updateAppointment,
    cancel: cancelAppointment,
};

export default appointmentApi;
