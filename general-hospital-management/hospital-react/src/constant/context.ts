/**
 * Global State Constants — Roles, Permissions, Sidebar Menu
 * Replaces src/utils/constants.js
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = 'admin' | 'doctor' | 'nurse' | 'caregiver' | 'accountant' | 'patient';

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
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    CAREGIVER: 'caregiver',
    ACCOUNTANT: 'accountant',
    PATIENT: 'patient',
};

export const PERMISSIONS: Record<Role, Permission> = {
    admin: {
        dashboard: true, appointments: true, patients: true, beds: true,
        surgery: true, records: true, doctors: true, nurses: true,
        admissions: true, billing: true, reports: true, audit: true,
        settings: true, canAdd: true, canEdit: true, canDelete: true, canExport: true,
    },
    doctor: {
        dashboard: true, appointments: true, patients: true, beds: false,
        surgery: true, records: true, doctors: false, nurses: false,
        admissions: false, billing: false, reports: false, audit: false,
        settings: false, canAdd: true, canEdit: true, canDelete: false, canExport: false,
    },
    nurse: {
        dashboard: true, appointments: true, patients: true, beds: true,
        surgery: false, records: true, doctors: false, nurses: false,
        admissions: true, billing: false, reports: false, audit: false,
        settings: false, canAdd: true, canEdit: true, canDelete: false, canExport: false,
    },
    caregiver: {
        dashboard: true, appointments: true, patients: true, beds: true,
        surgery: false, records: true, doctors: false, nurses: false,
        admissions: true, billing: false, reports: false, audit: false,
        settings: false, canAdd: true, canEdit: true, canDelete: false, canExport: false,
    },
    accountant: {
        dashboard: true, appointments: false, patients: false, beds: false,
        surgery: false, records: false, doctors: false, nurses: false,
        admissions: false, billing: true, reports: true, audit: false,
        settings: false, canAdd: true, canEdit: true, canDelete: false, canExport: true,
    },
    patient: {
        dashboard: true, appointments: true, patients: false, beds: false,
        surgery: false, records: true, doctors: false, nurses: false,
        admissions: false, billing: true, reports: false, audit: false,
        settings: false, canAdd: false, canEdit: false, canDelete: false, canExport: false,
    },
};

export const ROLE_LABELS: Record<Role, string> = {
    admin: 'Quản trị viên',
    doctor: 'Bác sĩ',
    nurse: 'Y tá',
    caregiver: 'Điều dưỡng',
    accountant: 'Kế toán',
    patient: 'Bệnh nhân',
};

export const SIDEBAR_MENU: SidebarItem[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: '📊', path: '/admin', permission: 'dashboard' },
    { id: 'patients', label: 'Bệnh nhân', icon: '🏥', path: '/admin/patients', permission: 'patients' },
    { id: 'beds', label: 'Giường bệnh', icon: '🛏️', path: '/admin/beds', permission: 'beds' },
    { id: 'doctors', label: 'Bác sĩ', icon: '👨‍⚕️', path: '/admin/doctors', permission: 'doctors' },
    { id: 'nurses', label: 'Y tá', icon: '👩‍⚕️', path: '/admin/nurses', permission: 'nurses' },
    { id: 'admissions', label: 'Nhập viện', icon: '📋', path: '/admin/admissions', permission: 'admissions' },
    { id: 'surgery', label: 'Phẫu thuật', icon: '💉', path: '/admin/surgery', permission: 'surgery' },
    { id: 'records', label: 'Hồ sơ bệnh án', icon: '📁', path: '/admin/records', permission: 'records' },
    { id: 'billing', label: 'Hóa đơn', icon: '💰', path: '/admin/billing', permission: 'billing' },
    { id: 'reports', label: 'Báo cáo', icon: '📈', path: '/admin/reports', permission: 'reports' },
    { id: 'audit', label: 'Nhật ký', icon: '🔍', path: '/admin/audit', permission: 'audit' },
];
