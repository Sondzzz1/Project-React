import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Invoice {
    id: number;
    benhNhanId: number;
    tenBenhNhan: string;
    tongTien: number;
    bhytChiTra: number;
    conPhaiTra: number;
    ngayTao: string;
    trangThai: 'Đã thanh toán' | 'Chưa thanh toán';
}

export interface PaymentRequest {
    phuongThucThanhToan?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getInvoices = async (): Promise<Invoice[]> => {
    const response = await axiosInstance.get<Invoice[]>(`${ENDPOINTS.BILLING}/get-all`);
    return response.data;
};

export const getInvoiceById = async (id: number): Promise<Invoice> => {
    const response = await axiosInstance.get<Invoice>(`${ENDPOINTS.BILLING}/get-by-id/${id}`);
    return response.data;
};

export const exportInvoicePdf = async (id: number): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>(`${ENDPOINTS.BILLING}/export-pdf/${id}`, { responseType: 'blob' });
    return response.data;
};

export const exportInvoiceExcel = async (id: number): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>(`${ENDPOINTS.BILLING}/export-excel/${id}`, { responseType: 'blob' });
    return response.data;
};

export const payInvoice = async (id: number, paymentData: PaymentRequest): Promise<Invoice> => {
    const response = await axiosInstance.post<Invoice>(`${ENDPOINTS.BILLING}/thanh-toan/${id}`, paymentData);
    return response.data;
};

// Legacy object export
export const billingApi = { getAll: getInvoices, getById: getInvoiceById, exportPdf: exportInvoicePdf, exportExcel: exportInvoiceExcel, pay: payInvoice };
export default billingApi;
