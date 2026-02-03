import api from './axiosConfig';

const NURSE_URL = '/api/yta';

export const nurseApi = {
    getAll: async () => {
        const response = await api.get(`${NURSE_URL}/get-all`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${NURSE_URL}/get-by-id/${id}`);
        return response.data;
    },

    search: async (params) => {
        const response = await api.post(`${NURSE_URL}/search`, params);
        return response.data;
    },

    create: async (nurseData) => {
        const response = await api.post(`${NURSE_URL}/create`, nurseData);
        return response.data;
    },

    update: async (id, nurseData) => {
        const response = await api.put(`${NURSE_URL}/update`, { id, ...nurseData });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${NURSE_URL}/delete/${id}`);
        return response.data;
    }
};

export default nurseApi;
