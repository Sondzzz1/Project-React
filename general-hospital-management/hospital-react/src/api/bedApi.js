import api from './axiosConfig';

const BED_URL = '/api/giuongbenh';

export const bedApi = {
    /**
     * Lấy danh sách tất cả giường bệnh
     */
    getAll: async () => {
        const response = await api.get(`${BED_URL}/get-all`);
        return response.data;
    },

    /**
     * Lấy giường theo ID
     */
    getById: async (id) => {
        const response = await api.get(`${BED_URL}/get-by-id/${id}`);
        return response.data;
    },

    /**
     * Lấy giường theo khoa
     */
    getByDepartment: async (khoaId) => {
        const response = await api.get(`${BED_URL}/by-department/${khoaId}`);
        return response.data;
    },

    /**
     * Lấy giường trống
     */
    getAvailable: async () => {
        const response = await api.get(`${BED_URL}/available`);
        return response.data;
    },

    /**
     * Tạo giường mới
     */
    create: async (bedData) => {
        const response = await api.post(`${BED_URL}/create`, bedData);
        return response.data;
    },

    /**
     * Cập nhật giường
     */
    update: async (id, bedData) => {
        const response = await api.put(`${BED_URL}/update`, { id, ...bedData });
        return response.data;
    },

    /**
     * Xóa giường
     */
    delete: async (id) => {
        const response = await api.delete(`${BED_URL}/delete/${id}`);
        return response.data;
    }
};

export default bedApi;
