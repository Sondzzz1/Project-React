import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../services/auth.services';
import './UserAccountPage.css';

type TabKey = 'info' | 'password' | 'quicklinks';

const TABS: { key: TabKey; icon: string; label: string }[] = [
    { key: 'info',       icon: '👤', label: 'Thông tin tài khoản' },
    { key: 'password',   icon: '🔒', label: 'Đổi mật khẩu' },
    { key: 'quicklinks', icon: '⚡', label: 'Truy cập nhanh' },
];

export default function UserAccountPage() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabKey>('info');

    // ── Đổi mật khẩu ────────────────────────────────────────────────────────
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwError, setPwError]     = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    const handlePwChange = (e: ChangeEvent<HTMLInputElement>) =>
        setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleChangePassword = async (e: FormEvent) => {
        e.preventDefault();
        setPwError(''); setPwSuccess('');
        if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
            setPwError('Vui lòng điền đầy đủ thông tin'); return;
        }
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('Mật khẩu mới không khớp'); return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwError('Mật khẩu mới phải có ít nhất 6 ký tự'); return;
        }
        setPwLoading(true);
        try {
            await changePassword(pwForm.oldPassword, pwForm.newPassword);
            setPwSuccess('✅ Đổi mật khẩu thành công!');
            setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setPwError(axiosErr.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setPwLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // ── Chưa đăng nhập ───────────────────────────────────────────────────────
    if (!isAuthenticated || !user) {
        return (
            <div className="user-account-page">
                <div className="uac-not-logged-in">
                    <div style={{ fontSize: '4rem' }}>🔐</div>
                    <h2>Bạn chưa đăng nhập</h2>
                    <p>Vui lòng đăng nhập hoặc tạo tài khoản để xem thông tin cá nhân.</p>
                    <div className="uac-not-logged-in-actions">
                        <Link to="/login" className="uac-btn-login">Đăng nhập</Link>
                        <Link to="/register" className="uac-btn-register">Tạo tài khoản</Link>
                    </div>
                </div>
            </div>
        );
    }

    const avatarLetter = (user.hoTen || user.tenDangNhap || 'U').charAt(0).toUpperCase();

    return (
        <div className="user-account-page">
            {/* ── Hero ── */}
            <div className="uac-hero">
                <div className="uac-hero-avatar">{avatarLetter}</div>
                <div className="uac-hero-info">
                    <h1>{user.hoTen || user.tenDangNhap || 'Người dùng'}</h1>
                    <p>@{user.tenDangNhap} · {user.email || 'Chưa có email'}</p>
                    <span className="uac-hero-badge">🧑 Bệnh nhân</span>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="uac-grid">
                {/* Sidebar Tabs */}
                <div className="uac-sidebar">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`uac-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <span className="uac-tab-icon">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                    <button className="uac-tab-btn uac-logout-btn" onClick={handleLogout}>
                        <span className="uac-tab-icon">🚪</span>
                        Đăng xuất
                    </button>
                </div>

                {/* Content */}
                <div className="uac-content">

                    {/* ════ Tab: Thông tin tài khoản ════ */}
                    {activeTab === 'info' && (
                        <>
                            <h2 className="uac-section-title">👤 Thông tin tài khoản</h2>
                            <div className="uac-info-grid">
                                <div className="uac-info-item">
                                    <div className="uac-info-label">Họ và tên</div>
                                    <div className="uac-info-value">{user.hoTen || <span className="empty">Chưa cập nhật</span>}</div>
                                </div>
                                <div className="uac-info-item">
                                    <div className="uac-info-label">Tên đăng nhập</div>
                                    <div className="uac-info-value">@{user.tenDangNhap || '—'}</div>
                                </div>
                                <div className="uac-info-item">
                                    <div className="uac-info-label">Email</div>
                                    <div className={`uac-info-value ${!user.email ? 'empty' : ''}`}>
                                        {user.email || 'Chưa cập nhật'}
                                    </div>
                                </div>
                                <div className="uac-info-item">
                                    <div className="uac-info-label">Mã người dùng</div>
                                    <div className="uac-info-value">#{user.id || '—'}</div>
                                </div>
                                <div className="uac-info-item">
                                    <div className="uac-info-label">Vai trò</div>
                                    <div className="uac-info-value">🧑 Bệnh nhân</div>
                                </div>
                                <div className="uac-info-item">
                                    <div className="uac-info-label">Trạng thái</div>
                                    <div className="uac-info-value" style={{ color: '#16a34a' }}>✅ Đang hoạt động</div>
                                </div>
                            </div>

                            <div style={{ marginTop: '1.5rem', padding: '1rem 1.25rem', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a', fontSize: '0.875rem', color: '#92400e' }}>
                                💡 Để cập nhật thông tin cá nhân, vui lòng liên hệ bộ phận tiếp nhận của bệnh viện.
                            </div>
                        </>
                    )}

                    {/* ════ Tab: Đổi mật khẩu ════ */}
                    {activeTab === 'password' && (
                        <>
                            <h2 className="uac-section-title">🔒 Đổi mật khẩu</h2>
                            <form onSubmit={handleChangePassword} className="uac-form">
                                {pwError   && <div className="uac-alert uac-alert-error">⚠️ {pwError}</div>}
                                {pwSuccess && <div className="uac-alert uac-alert-success">{pwSuccess}</div>}

                                <div className="uac-field">
                                    <label>Mật khẩu hiện tại *</label>
                                    <input
                                        type="password"
                                        name="oldPassword"
                                        value={pwForm.oldPassword}
                                        onChange={handlePwChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        autoComplete="current-password"
                                    />
                                </div>

                                <div className="uac-form-row">
                                    <div className="uac-field">
                                        <label>Mật khẩu mới *</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={pwForm.newPassword}
                                            onChange={handlePwChange}
                                            placeholder="Ít nhất 6 ký tự"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                    <div className="uac-field">
                                        <label>Xác nhận mật khẩu mới *</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={pwForm.confirmPassword}
                                            onChange={handlePwChange}
                                            placeholder="Nhập lại mật khẩu mới"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                </div>

                                <button type="submit" className="uac-btn-primary" disabled={pwLoading}>
                                    {pwLoading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
                                </button>
                            </form>

                            <div style={{ marginTop: '2rem' }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                                    💡 Lưu ý bảo mật
                                </h3>
                                <ul className="uac-tips-list">
                                    <li>Sử dụng mật khẩu dài ít nhất 8 ký tự</li>
                                    <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                                    <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                                    <li>Đổi mật khẩu định kỳ ít nhất 3 tháng/lần</li>
                                </ul>
                            </div>
                        </>
                    )}

                    {/* ════ Tab: Truy cập nhanh ════ */}
                    {activeTab === 'quicklinks' && (
                        <>
                            <h2 className="uac-section-title">⚡ Truy cập nhanh</h2>
                            <div className="uac-quicklinks">
                                <Link to="/appointment" className="uac-ql-card">
                                    <span className="uac-ql-icon">📅</span>
                                    Đặt lịch khám
                                </Link>
                                <Link to="/doctors" className="uac-ql-card">
                                    <span className="uac-ql-icon">👨‍⚕️</span>
                                    Xem bác sĩ
                                </Link>
                                <Link to="/departments" className="uac-ql-card">
                                    <span className="uac-ql-icon">🏥</span>
                                    Khoa phòng
                                </Link>
                                <Link to="/services" className="uac-ql-card">
                                    <span className="uac-ql-icon">💊</span>
                                    Dịch vụ y tế
                                </Link>
                                <Link to="/news" className="uac-ql-card">
                                    <span className="uac-ql-icon">📰</span>
                                    Tin tức y tế
                                </Link>
                                <Link to="/contact" className="uac-ql-card">
                                    <span className="uac-ql-icon">📞</span>
                                    Liên hệ hỗ trợ
                                </Link>
                            </div>

                            <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'linear-gradient(135deg,#f0f4ff,#e8f0fe)', borderRadius: '12px', border: '1px solid #c7d7f8' }}>
                                <h3 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: '#1a73a7' }}>🏥 Giờ làm việc</h3>
                                <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#374151' }}>Thứ 2 – Thứ 6: <strong>07:00 – 17:00</strong></p>
                                <p style={{ margin: '0 0 4px', fontSize: '0.875rem', color: '#374151' }}>Thứ 7: <strong>07:00 – 12:00</strong></p>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#dc2626' }}>Cấp cứu: <strong>24/7</strong> · Hotline: <strong>1900 1234</strong></p>
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}
