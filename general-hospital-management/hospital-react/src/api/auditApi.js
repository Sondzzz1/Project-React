import api from './axiosConfig';

const AUDIT_URL = '/api/audit';

export const auditApi = {
    getLogs: async (params) => {
        const response = await api.get(`${AUDIT_URL}/logs`, { params });
        return response.data;
    },

    getMedicalRecordAudit: async (recordId) => {
        const response = await api.get(`${AUDIT_URL}/medical-record/${recordId}`);
        return response.data;
    }
};

export default auditApi;
