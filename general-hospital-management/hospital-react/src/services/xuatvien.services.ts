import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

/** Dữ liệu xem trước điều kiện xuất viện (từ kiem-tra-dieu-kien/{id})
 *  Tất cả trường đều optional vì chưa biết chính xác backend trả về gì.
 *  Dùng console.log để xem raw response rồi cập nhật lại. */
export interface XuatVienPreview {
    // Các trường có thể có từ backend
    nhapVienId?: string;
    tenBenhNhan?: string;
    ngayNhap?: string;
    ngayXuat?: string;
    soNgayNamVien?: number;
    soHoaDon?: number;
    tongChiPhiDichVu?: number;
    tongTien?: number;          // alias có thể dùng
    chiPhi?: number;            // alias có thể dùng
    sanSangXuatVien?: boolean;
    coTheXuatVien?: boolean;    // alias có thể dùng
    lyDoChuaSanSang?: string;
    ghiChu?: string;
    soTheBaoHiem?: string;
    benhNhanId?: string;
    trangThai?: string;
    // Raw fallback — tất cả trường khác từ backend
    [key: string]: any;
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
    // Log để xếm backend trả về đúng tên trường gì
    console.log('[XuatVienPreview] raw response:', response.data);
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
