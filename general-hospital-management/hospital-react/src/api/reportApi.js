import api from './axiosConfig';

const REPORT_URL = '/api/report';

export const reportApi = {
    getBedCapacityReport: async (params) => {
        const response = await api.post(`${REPORT_URL}/bed-capacity`, params);
        return response.data;
    },

    getTreatmentCostReport: async (params) => {
        const response = await api.post(`${REPORT_URL}/treatment-cost`, params);
        return response.data;
    },

    exportExcel: async (reportType, params) => {
        const response = await api.post(`${REPORT_URL}/export/excel/${reportType}`, params, {
            responseType: 'blob'
        });
        return response.data;
    },

    exportPdf: async (reportType, params) => {
        const response = await api.post(`${REPORT_URL}/export/pdf/${reportType}`, params, {
            responseType: 'blob'
        });
        return response.data;
    }
};

export default reportApi;
