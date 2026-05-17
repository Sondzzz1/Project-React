import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BenhNhanViewDTO {
    id: string;              // Guid
    hoTen: string;
    ngaySinh: string;        // DateOnly từ backend
    gioiTinh: string;
    diaChi: string;
    soTheBaoHiem?: string;
    mucHuong?: number;
    hanTheBHYT?: string;     // DateOnly
    trangThai: string;
}

export type Patient = BenhNhanViewDTO;

export interface BenhNhanCreateDTO {
    id?: string;             // Guid (optional, backend sẽ tạo nếu không có)
    hoTen: string;
    ngaySinh: string;        // Format: "YYYY-MM-DD" hoặc DateOnly
    gioiTinh: string;
    diaChi: string;
    soTheBaoHiem?: string;
    mucHuong?: number;
    hanTheBHYT?: string;
    trangThai?: string;
}

export interface BenhNhanUpdateDTO {
    id: string;              // Guid (required)
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    diaChi: string;
    soTheBaoHiem?: string;
    mucHuong?: number;
    hanTheBHYT?: string;
    trangThai?: string;
}

export interface BenhNhanSearchModel {
    hoTen?: string;
    keyword?: string;
    diaChi?: string;
    soTheBaoHiem?: string;
    pageIndex?: number;
    pageSize?: number;
}

export interface PagedResult<T> {
    pageIndex: number;
    pageSize: number;
    totalRecords: number;
    items: T[];
}

// ─── Service Functions ──────────────────────────────────────────────────────────

/**
 * Tạo bệnh nhân mới
 * POST /api/BenhNhan/create
 */
export const create = async (data: BenhNhanCreateDTO) => {
    const response = await axiosInstance.post(`${ENDPOINTS.PATIENT}/create`, data);
    return response.data;
};

/**
 * Cập nhật thông tin bệnh nhân
 * PUT /api/BenhNhan/update
 */
export const update = async (data: BenhNhanUpdateDTO) => {
    const response = await axiosInstance.put(`${ENDPOINTS.PATIENT}/update`, data);
    return response.data;
};

/**
 * Xóa bệnh nhân
 * DELETE /api/BenhNhan/delete/{id}
 */
export const deleteBenhNhan = async (id: string) => {
    const response = await axiosInstance.delete(`${ENDPOINTS.PATIENT}/delete/${id}`);
    return response.data;
};

/**
 * Lấy thông tin bệnh nhân theo ID
 * GET /api/BenhNhan/get-by-id/{id}
 */
export const getById = async (id: string) => {
    const response = await axiosInstance.get(`${ENDPOINTS.PATIENT}/get-by-id/${id}`);
    return response.data;
};

/**
 * Lấy tất cả bệnh nhân
 * GET /api/BenhNhan/get-all
 * Response: BenhNhanViewDTO[]
 */
export const getAll = async () => {
    const response = await axiosInstance.get(`${ENDPOINTS.PATIENT}/get-all`);
    return response.data;
};

/**
 * Tìm kiếm bệnh nhân (có phân trang)
 * POST /api/BenhNhan/search
 */
export const search = async (searchModel: BenhNhanSearchModel) => {
    const response = await axiosInstance.post(`${ENDPOINTS.PATIENT}/search`, searchModel);
    return response.data;
};

/**
 * Tạo hoặc cập nhật hồ sơ bệnh nhân (dùng cho đặt lịch khám)
 * Kiểm tra xem bệnh nhân đã có hồ sơ chưa, nếu chưa thì tạo mới
 */
export const createOrUpdate = async (userId: string, data: Partial<BenhNhanCreateDTO>) => {
    try {
        // Thử lấy thông tin bệnh nhân
        const existing = await getById(userId);
        
        // Nếu đã tồn tại, trả về thông tin hiện tại
        if (existing) {
            return { success: true, data: existing, message: 'Hồ sơ đã tồn tại' };
        }
    } catch (error: any) {
        // Nếu không tìm thấy (404), tạo mới
        if (error.response?.status === 404) {
            const createData: BenhNhanCreateDTO = {
                id: userId,
                hoTen: data.hoTen || 'Người dùng mới',
                ngaySinh: data.ngaySinh || '2000-01-01',
                gioiTinh: data.gioiTinh || 'Nam',
                diaChi: data.diaChi || 'Chưa cập nhật',
                soTheBaoHiem: data.soTheBaoHiem || '',
                mucHuong: data.mucHuong,
                hanTheBHYT: data.hanTheBHYT,
                trangThai: data.trangThai || 'Đang hoạt động',
            };
            
            const result = await create(createData);
            return { success: true, data: result.Data, message: 'Tạo hồ sơ thành công' };
        }
        
        throw error;
    }
};

// Legacy object export for backward compatibility
export const patientApi = {
    create,
    update,
    delete: deleteBenhNhan,
    getById,
    getAll,
    search,
    createOrUpdate,
    
    // Alias cho tương thích với code cũ
    createPatient: create,
    updatePatient: update,
    deletePatient: deleteBenhNhan,
    getPatientById: getById,
    getPatients: getAll,
    searchPatients: search,
};

export default patientApi;
