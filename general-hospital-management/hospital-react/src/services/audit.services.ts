import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface AuditLog {
    id?: number;
    timestamp: string;
    userName: string;
    action: string;
    entity: string;
    details: string;
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
    const response = await axiosInstance.post<AuditLog[]>(`${ENDPOINTS.AUDIT}/system-logs`, bodyArgs);
    return response.data;
};

export const getMedicalRecordAudit = async (recordId: string): Promise<AuditLog[]> => {
    const response = await axiosInstance.post<AuditLog[]>(`${ENDPOINTS.AUDIT}/medical-record-logs`, { HoSoBenhAnId: recordId });
    return response.data;
};

// Legacy object export
export const auditApi = { getLogs: getAuditLogs, getMedicalRecordAudit };
export default auditApi;
