import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loading } from '../common';

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loading text="Đang kiểm tra đăng nhập..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
