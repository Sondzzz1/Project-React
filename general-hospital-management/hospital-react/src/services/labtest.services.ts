import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';
import { ApiResponse } from './auth.services';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface LabTest {
    id: number;
    tenXetNghiem: string;
    ketQua: string;
    donVi: string;
    khoangThamChieu: string;
    ngayXetNghiem: string;
    benhNhanId: number;
    bacSiChiDinhId: number;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getLabTests = async (): Promise<ApiResponse<LabTest[]>> => {
    const response = await axiosInstance.get<ApiResponse<LabTest[]>>(`${ENDPOINTS.LABTEST}/get-all-labtest`);
    return response.data;
};

export const createLabTest = async (testData: any): Promise<ApiResponse<LabTest>> => {
    const response = await axiosInstance.post<ApiResponse<LabTest>>(ENDPOINTS.LABTEST, testData);
    return response.data;
};

export const updateLabTest = async (id: number, testData: any): Promise<ApiResponse<LabTest>> => {
    const response = await axiosInstance.put<ApiResponse<LabTest>>(`${ENDPOINTS.LABTEST}/${id}`, testData);
    return response.data;
};

export const deleteLabTest = async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`${ENDPOINTS.LABTEST}/${id}`);
    return response.data;
};

export const searchLabTests = async (searchData: any): Promise<ApiResponse<LabTest[]>> => {
    const response = await axiosInstance.post<ApiResponse<LabTest[]>>(`${ENDPOINTS.LABTEST}/search`, searchData);
    return response.data;
};

export const labTestApi = { getAll: getLabTests, create: createLabTest, update: updateLabTest, delete: deleteLabTest, search: searchLabTests };
export default labTestApi;
