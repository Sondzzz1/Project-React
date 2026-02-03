import api from './axiosConfig';

const BILLING_URL = '/api/hoadon';

export const billingApi = {
    getAll: async () => {
        const response = await api.get(`${BILLING_URL}/get-all`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${BILLING_URL}/get-by-id/${id}`);
        return response.data;
    },

    /**
     * Xuất hóa đơn PDF
     */
    exportPdf: async (id) => {
        const response = await api.get(`${BILLING_URL}/export-pdf/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Xuất hóa đơn Excel
     */
    exportExcel: async (id) => {
        const response = await api.get(`${BILLING_URL}/export-excel/${id}`, {
            responseType: 'blob'
        });
        return response.data;
    },

    /**
     * Thanh toán hóa đơn
     */
    pay: async (id, paymentData) => {
        const response = await api.post(`${BILLING_URL}/thanh-toan/${id}`, paymentData);
        return response.data;
    }
};

export default billingApi;
