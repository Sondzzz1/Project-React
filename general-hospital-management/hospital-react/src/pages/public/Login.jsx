import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

export function Login() {
    const [tenDangNhap, setTenDangNhap] = useState('');
    const [matKhau, setMatKhau] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!tenDangNhap || !matKhau) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        setLoading(true);
        const result = await login(tenDangNhap, matKhau);
        setLoading(false);

        if (result.success) {
            navigate('/admin');
        } else {
            setError(result.error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <h1><i className="ti-pulse" /> Bệnh viện Đa khoa</h1>
                    <p>Hệ thống quản lý bệnh viện</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <h2>Đăng nhập</h2>

                    {error && (
                        <div className="error-message">
                            <i className="ti-alert" /> {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="username">
                            <i className="ti-user" /> Tên đăng nhập
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={tenDangNhap}
                            onChange={(e) => setTenDangNhap(e.target.value)}
                            placeholder="Nhập tên đăng nhập"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">
                            <i className="ti-lock" /> Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={matKhau}
                            onChange={(e) => setMatKhau(e.target.value)}
                            placeholder="Nhập mật khẩu"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-login"
                        disabled={loading}
                    >
                        {loading ? (
                            <><i className="ti-reload spin" /> Đang xử lý...</>
                        ) : (
                            <><i className="ti-check" /> Đăng nhập</>
                        )}
                    </button>

                    <div className="login-links">
                        <Link to="/forgot-password">Quên mật khẩu?</Link>
                        <Link to="/register">Đăng ký tài khoản</Link>
                    </div>
                </form>

                <div className="login-footer">
                    <Link to="/">← Về trang chủ</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
