import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROLE_LABELS } from '../../utils/constants';
import './Header.css';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleName = ROLE_LABELS[user?.role || user?.vaiTro] || 'Nhân viên';

    return (
        <header className="admin-header">
            <div className="admin-header-left">
                <h2 className="admin-header-title">Hệ thống Quản lý Bệnh viện</h2>
            </div>
            <div className="admin-header-right">
                <div className="admin-user-info">
                    <div className="admin-user-avatar">
                        {(user?.hoTen || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="admin-user-details">
                        <span className="admin-user-name">{user?.hoTen || user?.name || 'Người dùng'}</span>
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
