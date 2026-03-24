import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LabTest {
    id: string;
    nhapVienId?: string;
    bacSiId?: string;
    loaiXetNghiem: string;
    ketQua?: string;
    ngay?: string;
    donGia?: number;
    tenBenhNhan?: string;
    ngaySinhBenhNhan?: string;
    benhNhanId?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getLabTests = async (): Promise<LabTest[]> => {
    const response = await axiosInstance.get<LabTest[]>(`${ENDPOINTS.LABTEST}/get-all-labtest`);
    return response.data;
};

export const createLabTest = async (testData: any): Promise<ApiResponse<LabTest>> => {
    const response = await axiosInstance.post<ApiResponse<LabTest>>(ENDPOINTS.LABTEST, testData);
    return response.data;
};

export const updateLabTest = async (id: string, testData: any): Promise<ApiResponse<LabTest>> => {
    const response = await axiosInstance.put<ApiResponse<LabTest>>(`${ENDPOINTS.LABTEST}/${id}`, testData);
    return response.data;
};

export const deleteLabTest = async (id: string): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`${ENDPOINTS.LABTEST}/${id}`);
    return response.data;
};

export const searchLabTests = async (searchData: any): Promise<ApiResponse<LabTest[]>> => {
    const response = await axiosInstance.post<ApiResponse<LabTest[]>>(`${ENDPOINTS.LABTEST}/search`, searchData);
    return response.data;
};

export const labTestApi = { getAll: getLabTests, create: createLabTest, update: updateLabTest, delete: deleteLabTest, search: searchLabTests };
export default labTestApi;
