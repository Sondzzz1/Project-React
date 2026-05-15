import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../common';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Danh sách role được phép vào. Mặc định: tất cả (kể cả patient) */
    allowedRoles?: string[];
}

// Danh sách các role được phép truy cập khu vực quản trị/dashboard (Khớp với Backend IdentityService)
const ALL_ROLES = ['Admin', 'BacSi', 'YTa', 'KeToan', 'BenhNhan'];

export default function ProtectedRoute({ children, allowedRoles = ALL_ROLES }: ProtectedRouteProps) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <Loading text="Đang kiểm tra đăng nhập..." />;
    }

    // Chưa đăng nhập → về trang login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Đã đăng nhập nhưng không đủ quyền (đối chiếu role của user với allowedRoles)
    if (user && !allowedRoles.includes(user.role || '')) {
        // Nếu không có quyền, về trang chủ
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
