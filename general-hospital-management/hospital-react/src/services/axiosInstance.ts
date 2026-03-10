import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_BASE_URL } from '../constant/api';
import { APP_CONFIG } from '../constant/config';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: APP_CONFIG.DEFAULT_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - thêm JWT token vào mỗi request
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(APP_CONFIG.TOKEN_KEY);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - xử lý lỗi 401
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
            localStorage.removeItem(APP_CONFIG.USER_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
