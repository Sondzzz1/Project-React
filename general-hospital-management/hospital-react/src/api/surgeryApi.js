import api from './axiosConfig';

const SURGERY_URL = '/api/surgery';

export const surgeryApi = {
    getAll: async () => {
        const response = await api.get(SURGERY_URL);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${SURGERY_URL}/${id}`);
        return response.data;
    },

    getToday: async () => {
        const response = await api.get(`${SURGERY_URL}/today`);
        return response.data;
    },

    getByDoctor: async (doctorId) => {
        const response = await api.get(`${SURGERY_URL}/by-doctor/${doctorId}`);
        return response.data;
    },

    create: async (surgeryData) => {
        const response = await api.post(SURGERY_URL, surgeryData);
        return response.data;
    },

    update: async (id, surgeryData) => {
        const response = await api.put(`${SURGERY_URL}/${id}`, surgeryData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${SURGERY_URL}/${id}`);
        return response.data;
    }
};

export default surgeryApi;
