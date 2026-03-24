import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuditLog {
    id: string;
    nguoiDungId?: string;
    tenNguoiDung?: string;
    hanhDong?: string;
    thoiGian?: string;
    moTa?: string;
}

export interface AuditLogParams {
    page?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getAuditLogs = async (params?: AuditLogParams): Promise<AuditLog[]> => {
    const bodyArgs = {
        PageNumber: params?.page ?? 1,
        PageSize: params?.pageSize ?? 50,
        TuNgay: params?.fromDate,
        DenNgay: params?.toDate
    };
    const response = await axiosInstance.post<any>(`${ENDPOINTS.AUDIT}/system-logs`, bodyArgs);
    const apiData = response.data?.data;
    return apiData?.data || apiData || [];
};

export const getMedicalRecordAudit = async (recordId: string): Promise<AuditLog[]> => {
    const response = await axiosInstance.post<any>(`${ENDPOINTS.AUDIT}/medical-record-logs`, { HoSoBenhAnId: recordId });
    const apiData = response.data?.data;
    return apiData?.data || apiData || [];
};

// Legacy object export
export const auditApi = { getLogs: getAuditLogs, getMedicalRecordAudit };
export default auditApi;
