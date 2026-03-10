import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ReportParams {
    fromDate?: string;
    toDate?: string;
}

export interface BedCapacityReport {
    totalBeds: number;
    occupiedBeds: number;
    capacityRate: number;
    [key: string]: unknown;
}

export interface TreatmentCostReport {
    totalRevenue: number;
    averageCostPerPatient: number;
    [key: string]: unknown;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getBedCapacityReport = async (params: ReportParams): Promise<BedCapacityReport> => {
    const response = await axiosInstance.post<BedCapacityReport>(`${ENDPOINTS.REPORT}/bed-capacity`, params);
    return response.data;
};

export const getTreatmentCostReport = async (params: ReportParams): Promise<TreatmentCostReport> => {
    const response = await axiosInstance.post<TreatmentCostReport>(`${ENDPOINTS.REPORT}/treatment-cost`, params);
    return response.data;
};

export const exportReportExcel = async (reportType: string, params: ReportParams): Promise<Blob> => {
    const response = await axiosInstance.post<Blob>(`${ENDPOINTS.REPORT}/export/excel/${reportType}`, params, { responseType: 'blob' });
    return response.data;
};

export const exportReportPdf = async (reportType: string, params: ReportParams): Promise<Blob> => {
    const response = await axiosInstance.post<Blob>(`${ENDPOINTS.REPORT}/export/pdf/${reportType}`, params, { responseType: 'blob' });
    return response.data;
};

// Legacy object export
export const reportApi = { getBedCapacityReport, getTreatmentCostReport, exportExcel: exportReportExcel, exportPdf: exportReportPdf };
export default reportApi;
