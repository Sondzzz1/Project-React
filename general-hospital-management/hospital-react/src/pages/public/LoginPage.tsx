import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
    const [tenDangNhap, setTenDangNhap] = useState<string>('');
    const [matKhau, setMatKhau] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!tenDangNhap || !matKhau) { setError('Vui lòng nhập đầy đủ thông tin'); return; }
        setLoading(true);
        setError('');
        const result = await login(tenDangNhap, matKhau);
        if (result.success) { navigate('/admin'); } else { setError(result.error || 'Đăng nhập thất bại'); }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="login-branding">
                        <span className="login-logo-icon">🏥</span>
                        <h1>Bệnh viện Đa khoa Hoàn Mỹ</h1>
                        <p>Hệ thống Quản lý Bệnh viện Thông minh</p>
                        <div className="login-features">
                            <div className="login-feature">✅ Quản lý bệnh nhân toàn diện</div>
                            <div className="login-feature">✅ Theo dõi giường bệnh real-time</div>
                            <div className="login-feature">✅ Hồ sơ bệnh án điện tử</div>
                            <div className="login-feature">✅ Báo cáo thống kê chi tiết</div>
                        </div>
                    </div>
                </div>
                <div className="login-right">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Đăng nhập</h2>
                        <p className="login-subtitle">Vui lòng đăng nhập để tiếp tục</p>
                        {error && <div className="login-error">{error}</div>}
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập</label>
                            <input id="username" type="text" placeholder="Nhập tên đăng nhập" value={tenDangNhap} onChange={(e) => setTenDangNhap(e.target.value)} autoFocus />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input id="password" type="password" placeholder="Nhập mật khẩu" value={matKhau} onChange={(e) => setMatKhau(e.target.value)} />
                        </div>
                        <div className="form-actions">
                            <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
                        </div>
                        <button type="submit" className="login-submit" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
                        <p className="login-register">Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}
