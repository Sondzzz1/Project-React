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
        `${ENDPOINTS.APPOINTMENT}/dat-lich`,
        appointmentData
    );
    return response.data;
};

export const getAppointments = async (searchParams: any = {}): Promise<Appointment[]> => {
    // Note: The backend uses POST for danh-sach with a SearchLichKhamDTO
    const response = await axiosInstance.post<{ success: boolean; data: Appointment[] }>(`${ENDPOINTS.APPOINTMENT}/danh-sach`, searchParams);
    return response.data.data;
};

export const getAppointmentById = async (id: string): Promise<Appointment> => {
    const response = await axiosInstance.get<{ success: boolean; data: Appointment }>(`${ENDPOINTS.APPOINTMENT}/chi-tiet/${id}`);
    return response.data.data;
};

export const updateAppointment = async (id: string, appointmentData: Partial<Appointment>): Promise<Appointment> => {
    const response = await axiosInstance.put<{ success: boolean; message: string; data: Appointment }>(`${ENDPOINTS.APPOINTMENT}/cap-nhat-trang-thai`, { id, ...appointmentData });
    return response.data.data || appointmentData; // Return data if backend provides it, else return what was sent
};

export const cancelAppointment = async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.put<{ success: boolean; message: string }>(`${ENDPOINTS.APPOINTMENT}/huy-lich`, { id });
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
