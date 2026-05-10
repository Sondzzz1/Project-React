import axiosInstance from './axiosInstance';
import { ENDPOINTS } from '../constant/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Invoice {
    id: string;
    benhNhanId: string;
    nhapVienId?: string;
    tenBenhNhan: string;
    tongTien: number;
    baoHiemChiTra: number;
    benhNhanThanhToan: number;
    ngay: string;
    ngayNhapVien?: string;
    ngayXuatVien?: string;
    trangThai: string;
}

export interface PaymentRequest {
    phuongThucThanhToan?: string;
}

export interface InvoiceCreateRequest {
    benhNhanId: string;
    nhapVienId: string;
    tongTien: number;
    baoHiemChiTra?: number;
    ghiChu?: string;
}

// ─── Service Functions ──────────────────────────────────────────────────────────

export const getInvoices = async (): Promise<Invoice[]> => {
    const response = await axiosInstance.get<Invoice[]>(`${ENDPOINTS.BILLING}/lay-tat-ca`);
    return response.data;
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
    const response = await axiosInstance.get<Invoice>(`${ENDPOINTS.BILLING}/chi-tiet/${id}`);
    return response.data;
};

export const exportInvoicePdf = async (id: string): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>(`${ENDPOINTS.BILLING}/export-pdf/${id}`, { responseType: 'blob' });
    return response.data;
};

export const exportInvoiceExcel = async (id: string): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>(`${ENDPOINTS.BILLING}/export-excel/${id}`, { responseType: 'blob' });
    return response.data;
};

export const payInvoice = async (id: string, paymentData: PaymentRequest): Promise<Invoice> => {
    const response = await axiosInstance.put<Invoice>(`${ENDPOINTS.BILLING}/thanh-toan`, { id, ...paymentData });
    return response.data;
};


export const getPreviewByPatientId = async (benhNhanId: string): Promise<any> => {
    const response = await axiosInstance.get<{ success: boolean; data: any }>(`${ENDPOINTS.BILLING}/xem-truoc-benh-nhan/${benhNhanId}`);
    return response.data.data;
};

export const createInvoice = async (invoiceData: InvoiceCreateRequest): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ success: boolean; message: string }>(`${ENDPOINTS.BILLING}/tao-moi`, invoiceData);
    return response.data;
};

export const deleteInvoice = async (id: string): Promise<{ message: string }> => {
    const response = await axiosInstance.delete<{ success: boolean; message: string }>(`${ENDPOINTS.BILLING}/xoa/${id}`);
    return response.data;
};

// Legacy object export
export const billingApi = { 
    getAll: getInvoices, 
    getById: getInvoiceById, 
    exportPdf: exportInvoicePdf, 
    exportExcel: exportInvoiceExcel, 
    pay: payInvoice,
    getPreviewByPatient: getPreviewByPatientId,
    create: createInvoice,
    delete: deleteInvoice
};
export default billingApi;
