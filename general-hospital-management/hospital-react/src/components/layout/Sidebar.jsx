import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const menuItems = [
    { path: '/admin', icon: 'ti-dashboard', label: 'Tổng quan', exact: true },
    { path: '/admin/patients', icon: 'ti-wheelchair', label: 'Quản lý Bệnh nhân' },
    { path: '/admin/beds', icon: 'ti-layout-grid2', label: 'Quản lý Giường bệnh' },
    { path: '/admin/departments', icon: 'ti-home', label: 'Quản lý Khoa phòng' },
    { path: '/admin/surgery', icon: 'ti-cut', label: 'Lịch Phẫu thuật' },
    { path: '/admin/records', icon: 'ti-file', label: 'Hồ sơ Bệnh án (EHR)' },
    { path: '/admin/personnel', icon: 'ti-user', label: 'Nhân sự Y tế' },
    { path: '/admin/billing', icon: 'ti-money', label: 'Viện phí & BHYT' },
    { path: '/admin/reports', icon: 'ti-bar-chart', label: 'Báo cáo thống kê' },
    { path: '/admin/labtests', icon: 'ti-flask', label: 'Quản lý Xét nghiệm' },
    { path: '/admin/settings', icon: 'ti-settings', label: 'Cấu hình' },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <h2><i className="ti-pulse" /> BV Đa Khoa</h2>
                <span className="role-label">{user?.name || 'Admin Dashboard'}</span>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {menuItems.map((item) => (
                        <li key={item.path}>
                            <NavLink
                                to={item.path}
                                end={item.exact}
                                className={({ isActive }) => isActive ? 'active' : ''}
                            >
                                <i className={item.icon} />
                                {item.label}
                            </NavLink>
                        </li>
                    ))}

                    <li className="sidebar-divider" />

                    <li className="sidebar-link-ext">
                        <a href="/" target="_blank" rel="noopener noreferrer">
                            <i className="ti-world" />
                            Xem Trang Chủ
                        </a>
                    </li>

                    <li className="logout-link">
                        <button onClick={handleLogout}>
                            <i className="ti-power-off" />
                            Đăng xuất
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
}

export default Sidebar;
