import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Dữ liệu xem trước điều kiện xuất viện (từ kiem-tra-dieu-kien/{id}) */
export interface XuatVienPreview {
    nhapVienId: string;
    tenBenhNhan: string;
    ngayNhap: string;
    soNgayNamVien: number;
    soHoaDon: number;
    tongChiPhiDichVu: number;
    sanSangXuatVien: boolean;
    lyDoChuaSanSang?: string;
    soTheBaoHiem?: string;
    benhNhanId?: string;
}

/** DTO gửi lên khi xác nhận xuất viện (PUT /xac-nhan) */
export interface XuatVienDTO {
    nhapVienId: string;
    ngayXuat?: string;
    ghiChu?: string;
}

/** Thông tin bệnh nhân sẵn sàng xuất viện */
export interface BenhNhanChoXuatVien {
    id: string;
    tenBenhNhan: string;
    ngayNhap: string;
    tenKhoa?: string;
    tenGiuong?: string;
    trangThai: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

/** GET /api/XuatVien/kiem-tra-dieu-kien/{id} — Xem trước điều kiện xuất viện */
export const getXuatVienPreview = async (nhapVienId: string): Promise<XuatVienPreview> => {
    const response = await axiosInstance.get<XuatVienPreview>(
        `${ENDPOINTS.DISCHARGE}/kiem-tra-dieu-kien/${nhapVienId}`
    );
    return response.data;
};

/** GET /api/XuatVien/danh-sach-cho — Danh sách bệnh nhân sẵn sàng xuất viện */
export const getDanhSachChoXuatVien = async (): Promise<BenhNhanChoXuatVien[]> => {
    const response = await axiosInstance.get<BenhNhanChoXuatVien[]>(
        `${ENDPOINTS.DISCHARGE}/danh-sach-cho`
    );
    return Array.isArray(response.data) ? response.data : [];
};

/** GET /api/XuatVien/lich-su — Lịch sử xuất viện */
export const getLichSuXuatVien = async (): Promise<BenhNhanChoXuatVien[]> => {
    const response = await axiosInstance.get<BenhNhanChoXuatVien[]>(
        `${ENDPOINTS.DISCHARGE}/lich-su`
    );
    return Array.isArray(response.data) ? response.data : [];
};

/** PUT /api/XuatVien/xac-nhan — Xác nhận xuất viện */
export const xacNhanXuatVien = async (dto: XuatVienDTO): Promise<{ message: string }> => {
    const response = await axiosInstance.put<{ message: string }>(
        `${ENDPOINTS.DISCHARGE}/xac-nhan`,
        dto
    );
    return response.data;
};

// Legacy object export
export const xuatVienApi = {
    getPreview: getXuatVienPreview,
    getDanhSachCho: getDanhSachChoXuatVien,
    getLichSu: getLichSuXuatVien,
    xacNhan: xacNhanXuatVien,
};

export default xuatVienApi;
