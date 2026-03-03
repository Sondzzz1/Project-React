import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api';
import './LoginPage.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) { setError('Vui lòng nhập email'); return; }

        setLoading(true);
        setError('');
        try {
            await authApi.requestPasswordReset(email);
            setMessage('Đã gửi email hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.');
        } catch (err) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-container" style={{ maxWidth: 480 }}>
                <div className="login-right" style={{ flex: 'none', width: '100%' }}>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2>Quên mật khẩu</h2>
                        <p className="login-subtitle">Nhập email để nhận link đặt lại mật khẩu</p>

                        {error && <div className="login-error">{error}</div>}
                        {message && <div className="login-error" style={{ background: '#d1fae5', color: '#059669', borderColor: '#6ee7b7' }}>{message}</div>}

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" placeholder="Nhập email đã đăng ký" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>

                        <button type="submit" className="login-submit" disabled={loading}>
                            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>

                        <p className="login-register">
                            <Link to="/login">← Quay lại đăng nhập</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
