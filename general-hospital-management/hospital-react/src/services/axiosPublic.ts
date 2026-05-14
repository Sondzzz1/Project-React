/**
 * axiosPublic — Axios instance dành cho các API công khai
 * KHÔNG gắn JWT token, KHÔNG redirect khi 401
 * Dùng cho: /khoaphong/get-all, /bacsi/doctors, /LichKham/dat-lich (đặt lịch công khai)
 */
import axios, { AxiosInstance } from 'axios';
import { API_BASE_URL } from '../constant/api';
import { APP_CONFIG } from '../constant/config';

const axiosPublic: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: APP_CONFIG.DEFAULT_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Nếu user đang đăng nhập thì vẫn gắn token (để backend biết context)
// nhưng KHÔNG redirect về /login nếu 401 — chỉ throw error bình thường
axiosPublic.interceptors.request.use((config) => {
    const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Không có interceptor 401-redirect — để component tự xử lý lỗi
export default axiosPublic;
