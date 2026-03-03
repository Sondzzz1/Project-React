import api from './axiosConfig';

const USER_URL = '/api/usermanagement';

export const userManagementApi = {
    getAll: async (params) => {
        const response = await api.get(USER_URL, { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`${USER_URL}/${id}`);
        return response.data;
    },

    create: async (userData) => {
        const response = await api.post(USER_URL, userData);
        return response.data;
    },

    update: async (id, userData) => {
        const response = await api.put(`${USER_URL}/${id}`, userData);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`${USER_URL}/${id}`);
        return response.data;
    },

    resetPassword: async (userId) => {
        const response = await api.post(`${USER_URL}/${userId}/reset-password`);
        return response.data;
    },

    assignRole: async (userId, roleId) => {
        const response = await api.post(`${USER_URL}/${userId}/assign-role`, { roleId });
        return response.data;
    }
};

export default userManagementApi;
