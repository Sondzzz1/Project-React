import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS, Role } from '../../constant/context';
import './Header.css';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const userRole = (user?.role || (user as { vaiTro?: string } | null)?.vaiTro) as Role | undefined;
    const roleName = (userRole && ROLE_LABELS[userRole]) || 'Nhân viên';
    const userName = user?.fullName || (user as { hoTen?: string } | null)?.hoTen || 'Người dùng';

    return (
        <header className="admin-header">
            <div className="admin-header-left">
                <h2 className="admin-header-title">Hệ thống Quản lý Bệnh viện</h2>
            </div>
            <div className="admin-header-right">
                <button className="admin-home-btn" onClick={handleGoHome} title="Về trang chủ">
                    🏠 Trang chủ
                </button>
                <div className="admin-user-info">
                    <div className="admin-user-avatar">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-user-details">
                        <span className="admin-user-name">{userName}</span>
                        <span className="admin-user-role">{roleName}</span>
                    </div>
                </div>
                <button className="admin-logout-btn" onClick={handleLogout} title="Đăng xuất">
                    🚪 Đăng xuất
                </button>
            </div>
        </header>
    );
}
