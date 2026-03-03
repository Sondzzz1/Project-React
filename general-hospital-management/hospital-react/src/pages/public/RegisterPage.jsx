import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginPage.css'; /* Reuse login styles */

export default function RegisterPage() {
    const [form, setForm] = useState({
        hoTen: '', tenDangNhap: '', email: '', matKhau: '', xacNhanMatKhau: '', soDienThoai: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.hoTen || !form.tenDangNhap || !form.matKhau) {
            setError('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }
        if (form.matKhau !== form.xacNhanMatKhau) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoading(true);
        setError('');

        const result = await register(form);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error || 'Đăng ký thất bại');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <div className="login-left">
                    <div className="login-branding">
                        <span className="login-logo-icon">🏥</span>
                        <h1>Bệnh viện Đa khoa Hoàn Mỹ</h1>
                        <p>Tạo tài khoản để sử dụng hệ thống</p>
                    </div>
                </div>
                <div className="login-right">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Đăng ký tài khoản</h2>
                        <p className="login-subtitle">Điền thông tin để tạo tài khoản mới</p>

                        {error && <div className="login-error">{error}</div>}

                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input name="hoTen" placeholder="Nguyễn Văn A" value={form.hoTen} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Tên đăng nhập *</label>
                            <input name="tenDangNhap" placeholder="nguyenvana" value={form.tenDangNhap} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input name="soDienThoai" placeholder="0912345678" value={form.soDienThoai} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Mật khẩu *</label>
                            <input name="matKhau" type="password" placeholder="Nhập mật khẩu" value={form.matKhau} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Xác nhận mật khẩu *</label>
                            <input name="xacNhanMatKhau" type="password" placeholder="Nhập lại mật khẩu" value={form.xacNhanMatKhau} onChange={handleChange} />
                        </div>

                        <button type="submit" className="login-submit" disabled={loading}>
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>

                        <p className="login-register">
                            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
