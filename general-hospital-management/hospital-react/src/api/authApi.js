import api from './axiosConfig';

const AUTH_URL = '/api/auth';

export const authApi = {
    /**
     * Đăng nhập
     * @param {string} tenDangNhap - Tên đăng nhập
     * @param {string} matKhau - Mật khẩu
     */
    login: async (tenDangNhap, matKhau) => {
        const response = await api.post(`${AUTH_URL}/login`, {
            tenDangNhap,
            matKhau
        });
        return response.data;
    },

    /**
     * Đăng ký tài khoản mới
     * @param {Object} userData - Thông tin đăng ký
     */
    register: async (userData) => {
        const response = await api.post(`${AUTH_URL}/register`, userData);
        return response.data;
    },

    /**
     * Đổi mật khẩu
     * @param {string} oldPassword
     * @param {string} newPassword
     */
    changePassword: async (oldPassword, newPassword) => {
        const response = await api.post(`${AUTH_URL}/change-password`, {
            oldPassword,
            newPassword
        });
        return response.data;
    },

    /**
     * Yêu cầu reset mật khẩu
     * @param {string} email
     */
    requestPasswordReset: async (email) => {
        const response = await api.post(`${AUTH_URL}/forgot-password`, { email });
        return response.data;
    }
};

export default authApi;
