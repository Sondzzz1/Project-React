import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loading } from '../common/Loading';
import './AdminLayout.css';

export function AdminLayout() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <Loading fullPage text="Đang kiểm tra đăng nhập..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="admin-wrapper">
            <Sidebar />
            <main className="content">
                <Header />
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default AdminLayout;
