/**
 * API Endpoints - Centralized API URL Management
 */

export const API_BASE_URL: string =
    (import.meta as ImportMeta & { env: { VITE_API_URL?: string } }).env.VITE_API_URL ||
    'http://localhost:5076/gateway/api';

export const ENDPOINTS = {
    // Auth
    AUTH: '/auth',

    // Core entities
    PATIENT: '/benhnhan',
    BHYT: '/bhyt',
    DOCTOR: '/bacsi',
    NURSE: '/yta',
    BED: '/giuongbenh',
    DEPARTMENT: '/khoaphong',

    // Operations
    ADMISSION: '/nhapvien',
    DISCHARGE: '/xuatvien',
    SURGERY: '/surgery',
    MEDICAL_RECORD: '/medicalrecord',
    LABTEST: '/labtest',
    BILLING: '/hoadon',
    APPOINTMENT: '/appointment',

    // Admin
    USER_MANAGEMENT: '/usermanagement',
    REPORT: '/report',
    AUDIT: '/audit',
} as const;

export type EndpointKey = keyof typeof ENDPOINTS;
