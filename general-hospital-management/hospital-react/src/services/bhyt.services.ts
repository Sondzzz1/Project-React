import axiosInstance from './axiosInstance';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface KetQuaKiemTraBHYT {
    hopLe: boolean;
    thongBao: string;
    maDoiTuong: string;
    mucHuong: number;
    hanThe?: string;
    daHetHan: boolean;
    maNoiDK: string;
    goiYTuyen: string;
}

export interface YeuCauTinhPhiBHYT {
    idBenhNhan: string;
    tongTien: number;
    dungTuyen: boolean;
    laCapCuu: boolean;
    coGiayChuyenVien: boolean;
    ngayHoaDon: string;
}

export interface KetQuaTinhPhiBHYT {
    tongTien: number;
    baoHiemChiTra: number;
    benhNhanPhaiTra: number;
    tyLeHuong: number;
    dienGiai: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const kiemTraTheBHYT = async (soThe: string): Promise<KetQuaKiemTraBHYT> => {
    const response = await axiosInstance.get(`/bhyt/kiem-tra-the-bhyt/${soThe}`);
    return response.data;
};

export const tinhToanChiPhiBHYT = async (request: YeuCauTinhPhiBHYT): Promise<KetQuaTinhPhiBHYT> => {
    const response = await axiosInstance.post('/bhyt/tinh-toan-chi-phi-bhyt', request);
    return response.data;
};

export const bhytApi = {
    kiemTraThe: kiemTraTheBHYT,
    tinhToanChiPhi: tinhToanChiPhiBHYT
};

export default bhytApi;
