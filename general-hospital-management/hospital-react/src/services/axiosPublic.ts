/**
 * axiosPublic — Axios instance dành cho các API công khai
 * Tuyệt đối KHÔNG gắn JWT token. 
 * 
 * Tại sao? Một số backend gặp lỗi phân quyền (403 Forbidden) khi nhận được 
 * token của 'Bệnh nhân' cho các endpoint lẽ ra là công khai.
 * Việc không gửi token giúp backend xử lý request dưới quyền khách (Guest), 
 * vốn luôn được phép xem danh mục khoa/bác sĩ.
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

// KHÔNG gắn bất kỳ interceptor nào liên quan đến Auth ở đây.
// Đảm bảo tính "Công khai" tuyệt đối cho instance này.

export default axiosPublic;
