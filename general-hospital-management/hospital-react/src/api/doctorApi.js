import api from './axiosConfig';

const DOCTOR_URL = '/api/bacsi';

export const doctorApi = {
    getAll: async () => {
        const response = await api.get(`${DOCTOR_URL}/get-all`);
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${DOCTOR_URL}/get-by-id/${id}`);
        return response.data;
    },

    getByDepartment: async (departmentId) => {
        const response = await api.get(`${DOCTOR_URL}/by-department/${departmentId}`);
        return response.data;
    },

    search: async (params) => {
        const response = await api.post(`${DOCTOR_URL}/search`, params);
        return response.data;
    },

    create: async (doctorData) => {
        const response = await api.post(`${DOCTOR_URL}/create`, doctorData);
        return response.data;
    },

    update: async (id, doctorData) => {
        const response = await api.put(`${DOCTOR_URL}/update`, { id, ...doctorData });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${DOCTOR_URL}/delete/${id}`);
        return response.data;
    }
};

export default doctorApi;
