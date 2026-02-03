import axios from 'axios';

// API Base URL - sử dụng gateway
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5076/gateway';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - thêm JWT token vào mỗi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - xử lý lỗi 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
