import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './PublicLayout.css';

interface NavItem {
    path: string;
    label: string;
}

const navItems: NavItem[] = [
    { path: '/', label: 'Trang chủ' },
    { path: '/about', label: 'Giới thiệu' },
    { path: '/departments', label: 'Khoa phòng' },
    { path: '/services', label: 'Dịch vụ' },
    { path: '/doctors', label: 'Bác sĩ' },
    { path: '/news', label: 'Tin tức' },
    { path: '/contact', label: 'Liên hệ' },
];

export default function PublicLayout() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    return (
        <div className="public-layout">
            <header className="pub-header">
                <div className="pub-header-top">
                    <Link to="/" className="pub-logo">
                        <span className="pub-logo-icon">🏥</span>
                        <div className="pub-logo-text">
                            <h1>Bệnh viện Đa khoa Hoàn Mỹ</h1>
                            <span>Hệ thống Quản lý Bệnh viện</span>
                        </div>
                    </Link>
                </div>
                <nav className="pub-navbar">
                    <ul className="pub-nav-list">
                        {navItems.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className={`pub-nav-item ${location.pathname === item.path ? 'active' : ''}`}>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="pub-header-btn">
                        <Link to="/appointment" className="pub-btn pub-btn-appointment">📅 Đặt lịch khám</Link>
                        {isAuthenticated ? (
                            <Link to="/admin" className="pub-btn pub-btn-primary">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/register" className="pub-btn pub-btn-outline">Đăng ký</Link>
                                <Link to="/login" className="pub-btn pub-btn-primary">Đăng nhập</Link>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <main className="pub-main"><Outlet /></main>

            <footer className="pub-footer">
                <div className="pub-footer-content">
                    <div className="pub-footer-col">
                        <h3>Bệnh viện Đa khoa Hoàn Mỹ</h3>
                        <p>Với hơn 25 năm kinh nghiệm, chúng tôi cam kết mang đến dịch vụ y tế chất lượng cao.</p>
                        <p><strong>Giấy phép:</strong> Số 123/GP-BYT</p>
                    </div>
                    <div className="pub-footer-col">
                        <h3>Liên hệ</h3>
                        <p>📍 123 Nguyễn Văn Linh, Quận 7, TP. HCM</p>
                        <p>📞 Hotline: 1900 1234 (24/7)</p>
                        <p>✉️ contact@hoanmy.vn</p>
                    </div>
                    <div className="pub-footer-col">
                        <h3>Liên kết nhanh</h3>
                        <ul>
                            {navItems.map((item) => (<li key={item.path}><Link to={item.path}>{item.label}</Link></li>))}
                            <li><Link to="/login">Đăng nhập</Link></li>
                        </ul>
                    </div>
                    <div className="pub-footer-col">
                        <h3>Giờ làm việc</h3>
                        <p><strong>Khám bệnh:</strong></p>
                        <p>T2 - T6: 7:00 - 17:00</p>
                        <p>T7: 7:00 - 12:00</p>
                        <p><strong>Cấp cứu:</strong> 24/7</p>
                    </div>
                </div>
                <div className="pub-footer-bottom">
                    <p>&copy; 2025 Bệnh viện Đa khoa Hoàn Mỹ. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
