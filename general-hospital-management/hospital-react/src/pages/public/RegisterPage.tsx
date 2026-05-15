import { useState, ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { validateForm, commonRules, ValidationRule } from '../../utils/validation';
import './LoginPage.css';

interface RegisterForm {
    hoTen: string;
    tenDangNhap: string;
    email: string;
    matKhau: string;
    xacNhanMatKhau: string;
    soDienThoai: string;
}

const validationRules: Record<keyof RegisterForm, ValidationRule> = {
    hoTen:          { ...commonRules.required(), ...commonRules.minLength(3) },
    tenDangNhap:    { ...commonRules.required(), ...commonRules.minLength(4), ...commonRules.maxLength(20) },
    email:          { ...commonRules.email() },
    matKhau:        { ...commonRules.required(), ...commonRules.minLength(6) },
    xacNhanMatKhau: { required: true, message: 'Vui lòng xác nhận mật khẩu' },
    soDienThoai:    { ...commonRules.phone() },
};

export default function RegisterPage() {
    const [form, setForm] = useState<RegisterForm>({
        hoTen: '', tenDangNhap: '', email: '', matKhau: '', xacNhanMatKhau: '', soDienThoai: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [error, setError]   = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate
        const validation = validateForm(form, validationRules);
        if (form.matKhau !== form.xacNhanMatKhau) {
            validation.errors.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp';
            validation.isValid = false;
        }
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setLoading(true);

        // Gửi payload với role='patient' rõ ràng
        // Backend endpoint: POST /auth/register
        const payload = {
            hoTen:       form.hoTen.trim(),
            tenDangNhap: form.tenDangNhap.trim(),
            email:       form.email.trim()       || undefined,
            soDienThoai: form.soDienThoai.trim() || undefined,
            matKhau:     form.matKhau,
            // Luôn đăng ký với vai trò bệnh nhân (khớp với Backend Roles.BenhNhan)
            role:    'BenhNhan',
            vaiTro:  'BenhNhan', 
        };

        const result = await register(payload);

        setLoading(false);

        if (result.success) {
            alert('✅ Đăng ký thành công! Vui lòng đăng nhập.');
            navigate('/login');
        } else {
            setError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* Left branding */}
                <div className="login-left">
                    <div className="login-branding">
                        <span className="login-logo-icon">🏥</span>
                        <h1>Bệnh viện Đa khoa Hoàn Mỹ</h1>
                        <p>Tạo tài khoản bệnh nhân để đặt lịch khám</p>
                    </div>

                    {/* Notice box cho nhân viên */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem 1.25rem',
                        background: 'rgba(255,255,255,0.12)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.25)',
                        color: 'rgba(255,255,255,0.9)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                    }}>
                        <strong>👨‍⚕️ Dành cho nhân viên y tế</strong>
                        <p style={{ margin: '0.5rem 0 0' }}>
                            Tài khoản <strong>bác sĩ, y tá, điều dưỡng, kế toán</strong> phải được
                            quản trị viên (Admin) cấp phát.<br />
                            Vui lòng liên hệ phòng IT để được hỗ trợ.
                        </p>
                    </div>
                </div>

                {/* Right form */}
                <div className="login-right">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Đăng ký tài khoản</h2>
                        <p className="login-subtitle">Dành cho bệnh nhân — điền thông tin để tạo tài khoản mới</p>

                        {error && <div className="login-error">⚠️ {error}</div>}

                        {/* Họ tên */}
                        <div className="form-group">
                            <label>Họ và tên *</label>
                            <input
                                name="hoTen"
                                placeholder="Nguyễn Văn A"
                                value={form.hoTen}
                                onChange={handleChange}
                                className={errors.hoTen ? 'error' : ''}
                            />
                            {errors.hoTen && <span className="field-error">{errors.hoTen}</span>}
                        </div>

                        {/* Tên đăng nhập */}
                        <div className="form-group">
                            <label>Tên đăng nhập *</label>
                            <input
                                name="tenDangNhap"
                                placeholder="nguyenvana (4–20 ký tự)"
                                value={form.tenDangNhap}
                                onChange={handleChange}
                                className={errors.tenDangNhap ? 'error' : ''}
                                autoComplete="username"
                            />
                            {errors.tenDangNhap && <span className="field-error">{errors.tenDangNhap}</span>}
                        </div>

                        {/* Email */}
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="email@example.com"
                                value={form.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>

                        {/* Số điện thoại */}
                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                name="soDienThoai"
                                placeholder="0912345678"
                                value={form.soDienThoai}
                                onChange={handleChange}
                                className={errors.soDienThoai ? 'error' : ''}
                            />
                            {errors.soDienThoai && <span className="field-error">{errors.soDienThoai}</span>}
                        </div>

                        {/* Mật khẩu */}
                        <div className="form-group">
                            <label>Mật khẩu *</label>
                            <input
                                name="matKhau"
                                type="password"
                                placeholder="Tối thiểu 6 ký tự"
                                value={form.matKhau}
                                onChange={handleChange}
                                className={errors.matKhau ? 'error' : ''}
                                autoComplete="new-password"
                            />
                            {errors.matKhau && <span className="field-error">{errors.matKhau}</span>}
                        </div>

                        {/* Xác nhận mật khẩu */}
                        <div className="form-group">
                            <label>Xác nhận mật khẩu *</label>
                            <input
                                name="xacNhanMatKhau"
                                type="password"
                                placeholder="Nhập lại mật khẩu"
                                value={form.xacNhanMatKhau}
                                onChange={handleChange}
                                className={errors.xacNhanMatKhau ? 'error' : ''}
                                autoComplete="new-password"
                            />
                            {errors.xacNhanMatKhau && <span className="field-error">{errors.xacNhanMatKhau}</span>}
                        </div>

                        <button type="submit" className="login-submit" disabled={loading}>
                            {loading ? '⏳ Đang đăng ký...' : 'Đăng ký'}
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
