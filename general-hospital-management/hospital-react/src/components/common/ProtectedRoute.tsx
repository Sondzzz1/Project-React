import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../common';

interface ProtectedRouteProps {
    children: ReactNode;
    /** Danh sách role được phép vào. Mặc định: tất cả trừ 'patient' */
    allowedRoles?: string[];
}

// Các role nhân viên được phép vào /admin
const STAFF_ROLES = ['admin', 'doctor', 'nurse', 'caregiver', 'accountant', 'nhanvien'];

export default function ProtectedRoute({ children, allowedRoles = STAFF_ROLES }: ProtectedRouteProps) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <Loading text="Đang kiểm tra đăng nhập..." />;
    }

    // Chưa đăng nhập → về trang login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Đã đăng nhập nhưng không đủ quyền (ví dụ: patient vào /admin)
    if (user && !allowedRoles.includes(user.role || '')) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
