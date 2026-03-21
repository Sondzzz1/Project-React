import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface BHYTInfo {
    soThe: string;
    hoTen: string;
    ngaySinh: string;
    gioiTinh: string;
    diaChi: string;
    maDKBD: string;
    hanTu: string;
    hanDen: string;
    ngayDu5Nam: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const checkBHYT = async (soThe: string): Promise<ApiResponse<BHYTInfo>> => {
    const response = await axiosInstance.get<ApiResponse<BHYTInfo>>(`${ENDPOINTS.BHYT}/kiem-tra-the-bhyt/${soThe}`);
    return response.data;
};

export const calculateBHYTCost = async (data: any): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`${ENDPOINTS.BHYT}/tinh-toan-chi-phi-bhyt`, data);
    return response.data;
};

export const bhytApi = { check: checkBHYT, calculateCost: calculateBHYTCost };
export default bhytApi;
