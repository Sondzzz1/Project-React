import api from './axiosConfig';

const RECORD_URL = '/api/medicalrecord';

export const medicalRecordApi = {
    getAll: async () => {
        const response = await api.get(RECORD_URL);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${RECORD_URL}/${id}`);
        return response.data;
    },

    getByPatient: async (patientId) => {
        const response = await api.get(`${RECORD_URL}/patient/${patientId}`);
        return response.data;
    },

    create: async (recordData) => {
        const response = await api.post(RECORD_URL, recordData);
        return response.data;
    },

    update: async (id, recordData) => {
        const response = await api.put(`${RECORD_URL}/${id}`, recordData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${RECORD_URL}/${id}`);
        return response.data;
    }
};

export default medicalRecordApi;
