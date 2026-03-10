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
    const response = await axiosInstance.get<AuditLog[]>(`${ENDPOINTS.AUDIT}/logs`, { params });
    return response.data;
};

export const getMedicalRecordAudit = async (recordId: number): Promise<AuditLog[]> => {
    const response = await axiosInstance.get<AuditLog[]>(`${ENDPOINTS.AUDIT}/medical-record/${recordId}`);
    return response.data;
};

// Legacy object export
export const auditApi = { getLogs: getAuditLogs, getMedicalRecordAudit };
export default auditApi;
