import { useState, FormEvent, ChangeEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { changePassword } from '../../services/auth.services';
import { ROLE_LABELS, Role } from '../../constant/context';
import './ProfilePage.css';

export default function ProfilePage() {
    const { user } = useAuth();

    const userRole = (user?.role || (user as { vaiTro?: string } | null)?.vaiTro) as Role | undefined;
    const roleName = (userRole && ROLE_LABELS[userRole]) || 'Nhân viên';

    // --- Đổi mật khẩu ---
    const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [pwError, setPwError] = useState('');
    const [pwSuccess, setPwSuccess] = useState('');
    const [pwLoading, setPwLoading] = useState(false);

    const handlePwChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChangePassword = async (e: FormEvent) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess('');
        if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
            setPwError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('Mật khẩu mới không khớp');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            setPwError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return;
        }
        setPwLoading(true);
        try {
            await changePassword(pwForm.oldPassword, pwForm.newPassword);
            setPwSuccess('Đổi mật khẩu thành công!');
            setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setPwError(axiosErr.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setPwLoading(false);
        }
    };

    const avatarLetter = (user?.hoTen || user?.tenDangNhap || 'U').charAt(0).toUpperCase();

    return (
        <div className="profile-page admin-page">
            <div className="page-header">
                <h1>Thông tin cá nhân</h1>
                <p>Xem và quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="profile-grid">
                {/* LEFT: Profile Card */}
                <div className="profile-card">
                    <div className="profile-avatar-wrap">
                        <div className="profile-avatar">{avatarLetter}</div>
                        <div className="profile-avatar-badge">{roleName}</div>
                    </div>
                    <h2 className="profile-name">{user?.hoTen || '—'}</h2>
                    <p className="profile-username">@{user?.tenDangNhap || '—'}</p>

                    <div className="profile-info-list">
                        <div className="profile-info-item">
                            <span className="profile-info-icon">✉️</span>
                            <div>
                                <div className="profile-info-label">Email</div>
                                <div className="profile-info-value">{user?.email || 'Chưa cập nhật'}</div>
                            </div>
                        </div>
                        <div className="profile-info-item">
                            <span className="profile-info-icon">🏷️</span>
                            <div>
                                <div className="profile-info-label">Vai trò</div>
                                <div className="profile-info-value">
                                    <span className="profile-role-badge">{roleName}</span>
                                </div>
                            </div>
                        </div>
                        <div className="profile-info-item">
                            <span className="profile-info-icon">🔑</span>
                            <div>
                                <div className="profile-info-label">Tên đăng nhập</div>
                                <div className="profile-info-value">{user?.tenDangNhap || '—'}</div>
                            </div>
                        </div>
                        <div className="profile-info-item">
                            <span className="profile-info-icon">🆔</span>
                            <div>
                                <div className="profile-info-label">Mã người dùng</div>
                                <div className="profile-info-value">#{user?.id || '—'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Change Password */}
                <div className="profile-right">
                    <div className="profile-section-card">
                        <div className="profile-section-header">
                            <span className="profile-section-icon">🔒</span>
                            <div>
                                <h3>Đổi mật khẩu</h3>
                                <p>Cập nhật mật khẩu để bảo vệ tài khoản của bạn</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="profile-form">
                            {pwError && <div className="profile-alert profile-alert-error">⚠️ {pwError}</div>}
                            {pwSuccess && <div className="profile-alert profile-alert-success">✅ {pwSuccess}</div>}

                            <div className="profile-form-group">
                                <label>Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={pwForm.oldPassword}
                                    onChange={handlePwChange}
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </div>
                            <div className="profile-form-row">
                                <div className="profile-form-group">
                                    <label>Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={pwForm.newPassword}
                                        onChange={handlePwChange}
                                        placeholder="Ít nhất 6 ký tự"
                                    />
                                </div>
                                <div className="profile-form-group">
                                    <label>Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={pwForm.confirmPassword}
                                        onChange={handlePwChange}
                                        placeholder="Nhập lại mật khẩu mới"
                                    />
                                </div>
                            </div>
                            <div className="profile-form-actions">
                                <button type="submit" className="btn-save" disabled={pwLoading}>
                                    {pwLoading ? '⏳ Đang xử lý...' : '🔒 Đổi mật khẩu'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security Tips */}
                    <div className="profile-section-card profile-tips">
                        <div className="profile-section-header">
                            <span className="profile-section-icon">💡</span>
                            <div>
                                <h3>Lưu ý bảo mật</h3>
                                <p>Giữ tài khoản của bạn an toàn</p>
                            </div>
                        </div>
                        <ul className="profile-tips-list">
                            <li>Sử dụng mật khẩu dài ít nhất 8 ký tự</li>
                            <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                            <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                            <li>Đổi mật khẩu định kỳ ít nhất 3 tháng/lần</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
