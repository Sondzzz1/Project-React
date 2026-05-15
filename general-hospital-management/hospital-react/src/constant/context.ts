/**
 * Global State Constants — Roles, Permissions, Sidebar Menu
 * Replaces src/utils/constants.js
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = 'Admin' | 'BacSi' | 'YTa' | 'KeToan' | 'BenhNhan';

export interface Permission {
    dashboard: boolean;
    appointments: boolean;
    patients: boolean;
    beds: boolean;
    surgery: boolean;
    records: boolean;
    doctors: boolean;
    nurses: boolean;
    admissions: boolean;
    billing: boolean;
    reports: boolean;
    audit: boolean;
    settings: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canExport: boolean;
    profile: boolean;
}

export interface SidebarItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    permission: keyof Permission;
}

// ─── Constants ─────────────────────────────────────────────────────────────────

export const ROLES: Record<string, Role> = {
    ADMIN: 'Admin',
    DOCTOR: 'BacSi',
    NURSE: 'YTa',
    ACCOUNTANT: 'KeToan',
    PATIENT: 'BenhNhan',
};

export const PERMISSIONS: Record<Role, Permission> = {
    Admin: {
        dashboard: true, appointments: true, patients: true, beds: true,
        surgery: true, records: true, doctors: true, nurses: true,
        admissions: true, billing: true, reports: true, audit: true,
        settings: true, canAdd: true, canEdit: true, canDelete: true, canExport: true, profile: true,
    },
    BacSi: {
        dashboard: true, appointments: true, patients: true, beds: false,
        surgery: true, records: true, doctors: false, nurses: false,
        admissions: false, billing: false, reports: false, audit: false,
        settings: false, canAdd: true, canEdit: true, canDelete: false, canExport: false, profile: true,
    },
    YTa: {
        dashboard: true, appointments: true, patients: true, beds: true,
        surgery: false, records: true, doctors: false, nurses: true,
        admissions: true, billing: false, reports: false, audit: false,
        settings: false, canAdd: true, canEdit: true, canDelete: false, canExport: false, profile: true,
    },
    KeToan: {
        dashboard: true, appointments: false, patients: true, beds: false,
        surgery: false, records: false, doctors: false, nurses: false,
        admissions: true, billing: true, reports: true, audit: false,
        settings: false, canAdd: false, canEdit: false, canDelete: false, canExport: true, profile: true,
    },
    BenhNhan: {
        dashboard: true, appointments: true, patients: false, beds: false,
        surgery: false, records: true, doctors: false, nurses: false,
        admissions: false, billing: true, reports: false, audit: false,
        settings: false, canAdd: false, canEdit: false, canDelete: false, canExport: false, profile: true,
    },
};

export const ROLE_LABELS: Record<Role, string> = {
    Admin: 'Quản trị viên',
    BacSi: 'Bác sĩ',
    YTa: 'Y tá',
    KeToan: 'Kế toán',
    BenhNhan: 'Bệnh nhân',
};

export const SIDEBAR_MENU: SidebarItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊', path: '/admin', permission: 'dashboard' },
    { id: 'appointments', label: 'Lịch khám', icon: '📅', path: '/admin/appointments', permission: 'appointments' },
    { id: 'patients', label: 'Bệnh nhân', icon: '🏥', path: '/admin/patients', permission: 'patients' },
    { id: 'beds', label: 'Giường bệnh', icon: '🛏️', path: '/admin/beds', permission: 'beds' },
    { id: 'doctors', label: 'Bác sĩ', icon: '👨‍⚕️', path: '/admin/doctors', permission: 'doctors' },
    { id: 'nurses', label: 'Y tá', icon: '👩‍⚕️', path: '/admin/nurses', permission: 'nurses' },
    { id: 'admissions', label: 'Nhập viện', icon: '📋', path: '/admin/admissions', permission: 'admissions' },
    { id: 'surgery', label: 'Phẫu thuật', icon: '💉', path: '/admin/surgery', permission: 'surgery' },
    { id: 'records', label: 'Hồ sơ bệnh án', icon: '📁', path: '/admin/records', permission: 'records' },
    { id: 'labtests', label: 'Xét nghiệm', icon: '🔬', path: '/admin/labtests', permission: 'records' },
    { id: 'billing', label: 'Hóa đơn', icon: '💰', path: '/admin/billing', permission: 'billing' },
    { id: 'reports', label: 'Báo cáo', icon: '📈', path: '/admin/reports', permission: 'reports' },
    { id: 'audit', label: 'Nhật ký', icon: '🔍', path: '/admin/audit', permission: 'audit' },
    { id: 'users', label: 'Người dùng', icon: '👥', path: '/admin/users', permission: 'settings' },
    { id: 'profile', label: 'Tài khoản', icon: '👤', path: '/admin/profile', permission: 'profile' },
];
