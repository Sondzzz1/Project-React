import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS, Permission, Role } from '../constant/context';

/**
 * Hook kiểm tra quyền truy cập theo role
 */
export function usePermissions() {
    const { user } = useAuth();
    const role = (user?.role || (user as { vaiTro?: string } | null)?.vaiTro) as Role | undefined;

    const permissions: Permission = (role && PERMISSIONS[role]) || {
        dashboard: false, appointments: false, patients: false, beds: false,
        surgery: false, records: false, doctors: false, nurses: false,
        admissions: false, billing: false, reports: false, audit: false,
        settings: false, canAdd: false, canEdit: false, canDelete: false, canExport: false,
    };

    const hasPermission = (feature: keyof Permission): boolean => {
        return permissions[feature] === true;
    };

    const hasAnyPermission = (features: (keyof Permission)[]): boolean => {
        return features.some((f) => permissions[f] === true);
    };

    const hasAllPermissions = (features: (keyof Permission)[]): boolean => {
        return features.every((f) => permissions[f] === true);
    };

    return {
        role,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAdd: permissions.canAdd,
        canEdit: permissions.canEdit,
        canDelete: permissions.canDelete,
        canExport: permissions.canExport,
    };
}
