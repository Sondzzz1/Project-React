import api from './axiosConfig';

const DEPARTMENT_URL = '/api/khoaphong';

export const departmentApi = {
    /**
     * Lấy danh sách tất cả khoa phòng
     */
    getAll: async () => {
        const response = await api.get(`${DEPARTMENT_URL}/get-all`);
        return response.data;
    },

    /**
     * Lấy khoa theo ID
     */
    getById: async (id) => {
        const response = await api.get(`${DEPARTMENT_URL}/get-by-id/${id}`);
        return response.data;
    },

    /**
     * Tìm kiếm khoa phòng
     */
    search: async (params) => {
        const response = await api.post(`${DEPARTMENT_URL}/search`, params);
        return response.data;
    },

    /**
     * Tạo khoa mới
     */
    create: async (deptData) => {
        const response = await api.post(`${DEPARTMENT_URL}/create`, deptData);
        return response.data;
    },

    /**
     * Cập nhật khoa
     */
    update: async (id, deptData) => {
        const response = await api.put(`${DEPARTMENT_URL}/update`, { id, ...deptData });
        return response.data;
    },

    /**
     * Xóa khoa
     */
    delete: async (id) => {
        const response = await api.delete(`${DEPARTMENT_URL}/delete/${id}`);
        return response.data;
    }
};

export default departmentApi;
