import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Appointment {
    id: string;
    benhNhanId: string;
    tenBenhNhan: string;
    soDienThoai?: string;
    bacSiId: string;
    tenBacSi: string;
    khoaKham?: string;
    ngayKham: string;
    gioKham: string;
    lyDoKham?: string;
    trangThai: 'ChoXacNhan' | 'DaXacNhan' | 'HoanThanh' | 'DaHuy';
    ghiChu?: string;
    createdAt?: string;
}

export interface DatLichDTO {
    benhNhanId?: string;
    bacSiId: string;
    ngayKham: string; // ISO DateTime: "2024-01-15T00:00:00"
    gioKham: string;  // TimeSpan: "08:00:00"
    lyDoKham?: string;
    ghiChu?: string;
}

export interface SearchLichKhamDTO {
    benhNhanId?: string;
    bacSiId?: string;
    ngayKham?: string;
    trangThai?: string;
    pageNumber?: number;
    pageSize?: number;
}

export interface UpdateStatusDTO {
    id: string;
    trangThai: string; // "DaXacNhan", "HoanThanh", "TuChoi"
    ghiChu?: string;
}

export interface HuyLichDTO {
    id: string;
    lyDoHuy: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

/**
 * Đặt lịch khám mới
 */
export const datLich = async (data: DatLichDTO) => {
    const response = await axiosInstance.post(`${ENDPOINTS.APPOINTMENT}/dat-lich`, data);
    return response.data;
};

/**
 * Lấy danh sách lịch khám (có filter và phân trang)
 */
export const getDanhSach = async (search: SearchLichKhamDTO) => {
    const response = await axiosInstance.post(`${ENDPOINTS.APPOINTMENT}/danh-sach`, search);
    return response.data;
};

/**
 * Lấy chi tiết lịch khám
 */
export const getChiTiet = async (id: string) => {
    const response = await axiosInstance.get(`${ENDPOINTS.APPOINTMENT}/chi-tiet/${id}`);
    return response.data;
};

/**
 * Cập nhật trạng thái lịch khám
 */
export const capNhatTrangThai = async (data: UpdateStatusDTO) => {
    const response = await axiosInstance.put(`${ENDPOINTS.APPOINTMENT}/cap-nhat-trang-thai`, data);
    return response.data;
};

/**
 * Hủy lịch khám
 */
export const huyLich = async (data: HuyLichDTO) => {
    const response = await axiosInstance.put(`${ENDPOINTS.APPOINTMENT}/huy-lich`, data);
    return response.data;
};

/**
 * Lấy các khung giờ trống của bác sĩ
 */
export const getLichTrong = async (bacSiId: string, ngayKham: string) => {
    const response = await axiosInstance.get(`${ENDPOINTS.APPOINTMENT}/lich-trong`, {
        params: { bacSiId, ngayKham }
    });
    return response.data;
};

/**
 * Lấy lịch khám của bác sĩ
 */
export const getByDoctor = async (bacSiId: string, filters?: { ngayKham?: string; trangThai?: string }) => {
    return getDanhSach({
        bacSiId,
        ngayKham: filters?.ngayKham,
        trangThai: filters?.trangThai,
        pageNumber: 1,
        pageSize: 100,
    });
};

/**
 * Lấy lịch khám của bệnh nhân
 */
export const getByPatient = async (benhNhanId: string) => {
    return getDanhSach({
        benhNhanId,
        pageNumber: 1,
        pageSize: 100,
    });
};

/**
 * Lấy lịch khám hôm nay của bác sĩ
 */
export const getTodayByDoctor = async (bacSiId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return getByDoctor(bacSiId, { ngayKham: `${today}T00:00:00` });
};

/**
 * Xác nhận lịch khám
 */
export const confirm = async (id: string) => {
    return capNhatTrangThai({
        id,
        trangThai: 'DaXacNhan',
    });
};

/**
 * Hoàn thành lịch khám
 */
export const complete = async (id: string) => {
    return capNhatTrangThai({
        id,
        trangThai: 'HoanThanh',
    });
};

/**
 * Từ chối lịch khám
 */
export const reject = async (id: string, ghiChu?: string) => {
    return capNhatTrangThai({
        id,
        trangThai: 'TuChoi',
        ghiChu,
    });
};

/**
 * Hủy lịch khám (wrapper)
 */
export const cancel = async (id: string, lyDoHuy: string) => {
    return huyLich({ id, lyDoHuy });
};

// Legacy object export
export const appointmentApi = {
    datLich,
    getDanhSach,
    getChiTiet,
    capNhatTrangThai,
    huyLich,
    getLichTrong,
    getByDoctor,
    getByPatient,
    getTodayByDoctor,
    confirm,
    complete,
    reject,
    cancel,
    
    // Alias cho tương thích
    getAll: getDanhSach,
    getById: getChiTiet,
    create: datLich,
    update: capNhatTrangThai,
    delete: huyLich,
};

export default appointmentApi;
