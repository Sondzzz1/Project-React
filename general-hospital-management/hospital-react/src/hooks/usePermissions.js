import { useAuth } from '../contexts/AuthContext';
import { PERMISSIONS } from '../utils/constants';

/**
 * Hook kiểm tra quyền truy cập theo role
 */
export function usePermissions() {
    const { user } = useAuth();
    const role = user?.role || user?.vaiTro;

    const permissions = PERMISSIONS[role] || {};

    const hasPermission = (feature) => {
        return permissions[feature] === true;
    };

    const hasAnyPermission = (features) => {
        return features.some(f => permissions[f] === true);
    };

    const hasAllPermissions = (features) => {
        return features.every(f => permissions[f] === true);
    };

    return {
        role,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        canAdd: permissions.canAdd || false,
        canEdit: permissions.canEdit || false,
        canDelete: permissions.canDelete || false,
        canExport: permissions.canExport || false
    };
}
