/**
 * API Endpoints - Centralized API URL Management
 */

export const API_BASE_URL: string =
    (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL ||
    'http://localhost:5076/gateway';

export const ENDPOINTS = {
    // Auth
    AUTH: '/api/auth',

    // Core entities
    PATIENT: '/api/benhnhan',
    DOCTOR: '/api/bacsi',
    NURSE: '/api/yta',
    BED: '/api/giuongbenh',
    DEPARTMENT: '/api/khoaphong',

    // Operations
    ADMISSION: '/api/nhapvien',
    SURGERY: '/api/phauthuat',
    MEDICAL_RECORD: '/api/benhan',
    BILLING: '/api/hoadon',

    // Admin
    REPORT: '/api/report',
    AUDIT: '/api/audit',
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;
