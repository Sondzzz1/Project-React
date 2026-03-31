import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Admission {
    id: string;         // Guid từ backend
    benhNhanId: string;
    tenBenhNhan: string;
    giuongId: string;
    tenGiuong?: string;
    khoaId: string;
    tenKhoa?: string;
    lyDoNhap?: string;
    ngayNhap: string;   // Đổi từ ngayNhapVien → ngayNhap (khớp NhapVienViewDTO)
    ngayXuat?: string;  // Đổi từ ngayXuatVien → ngayXuat
    trangThai: string;
    isDungTuyen?: boolean;
}

export interface CreateAdmissionRequest {
    benhNhanId: string; // Guid
    giuongId: string;   // Guid
    khoaId: string;     // Guid
    lyDoNhap: string;
    isDungTuyen?: boolean;
}

export interface UpdateAdmissionRequest {
    id: string;
    lyDoNhap?: string;
    trangThai?: string;
    ngayXuat?: string;
}

export interface TransferBedRequest {
    nhapVienId: string;
    giuongMoiId: string;
    lyDoChuyenGiuong: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

// GET /api/nhapvien/danh-sach
export const getAdmissions = async (): Promise<Admission[]> => {
    const response = await axiosInstance.get<{ success: boolean; data: Admission[] }>(`${ENDPOINTS.ADMISSION}/danh-sach`);
    // API trả về { success: true, data: [] }
    return response.data.data || [];
};

// GET /api/nhapvien/chi-tiet/{id}
export const getAdmissionById = async (id: string): Promise<Admission> => {
    const response = await axiosInstance.get<Admission>(`${ENDPOINTS.ADMISSION}/chi-tiet/${id}`);
    return response.data;
};

// POST /api/nhapvien/nhap-vien-moi
export const createAdmission = async (admissionData: CreateAdmissionRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(`${ENDPOINTS.ADMISSION}/nhap-vien-moi`, admissionData);
    return response.data;
};

// PUT /api/nhapvien/cap-nhat
export const updateAdmission = async (data: UpdateAdmissionRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.put<{ message: string }>(`${ENDPOINTS.ADMISSION}/cap-nhat`, data);
    return response.data;
};

// PUT /api/nhapvien/chuyen-giuong
export const transferBed = async (nhapVienId: string, giuongMoiId: string, lyDoChuyenGiuong: string): Promise<{ message: string }> => {
    const response = await axiosInstance.put<{ success: boolean; message: string }>(`${ENDPOINTS.ADMISSION}/chuyen-giuong`, {
        nhapVienId,
        giuongMoiId,
        lyDoChuyenGiuong,
    });
    return { message: response.data.message };
};

// DELETE /api/nhapvien/xoa/{id}
export const deleteAdmission = async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ message: string }>(`${ENDPOINTS.ADMISSION}/xoa/${id}`);
    return response.data;
};

// POST /api/nhapvien/tim-kiem
export const searchAdmissions = async (params: {
    tenBenhNhan?: string;
    khoaId?: string;
    trangThai?: string;
    tuNgay?: string;
    denNgay?: string;
    isDungTuyen?: boolean;
}): Promise<Admission[]> => {
    const response = await axiosInstance.post<Admission[]>(`${ENDPOINTS.ADMISSION}/tim-kiem`, params);
    return response.data;
};

// Legacy object export
export const admissionApi = {
    getAll: getAdmissions,
    getById: getAdmissionById,
    create: createAdmission,
    update: updateAdmission,
    transferBed,
    delete: deleteAdmission,
    search: searchAdmissions,
};
export default admissionApi;
