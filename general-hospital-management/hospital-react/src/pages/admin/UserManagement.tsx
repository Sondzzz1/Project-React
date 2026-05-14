import { useState, useEffect, useCallback } from 'react';
import { userManagementApi, ManagedUser, CreateUserRequest } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_LABELS } from '../../constant/context';
import './AdminPages.css';

export default function UserManagementPage() {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
    const [formData, setFormData] = useState<Partial<CreateUserRequest>>({});
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const result = await userManagementApi.getAll();
            setUsers(result);
        } catch (err) {
            console.error('Load users error:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const openModal = (user: ManagedUser | null = null) => {
        setEditingUser(user);
        setFormData(user ? { 
            tenDangNhap: user.tenDangNhap,
            hoTen: user.hoTen,
            email: user.email,
            role: user.role
        } : { 
            tenDangNhap: '', 
            matKhau: '', 
            hoTen: '', 
            email: '', 
            soDienThoai: '',
            role: 'doctor' 
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.tenDangNhap || !formData.hoTen || !formData.email) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (!editingUser && !formData.matKhau) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }
        setSaving(true);
        try {
            if (editingUser) {
                await userManagementApi.update(editingUser.id, formData);
            } else {
                await userManagementApi.create(formData as CreateUserRequest);
            }
            setShowModal(false);
            loadUsers();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user: ManagedUser) => {
        if (!window.confirm(`Xóa người dùng "${user.hoTen}"?`)) return;
        try {
            await userManagementApi.delete(user.id);
            loadUsers();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleResetPassword = async (user: ManagedUser) => {
        if (!window.confirm(`Reset mật khẩu cho "${user.hoTen}"?`)) return;
        try {
            await userManagementApi.resetPassword(user.id);
            alert('Reset mật khẩu thành công! Mật khẩu mới đã được gửi qua email.');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Reset mật khẩu thất bại');
        }
    };

    const filteredUsers = users.filter(u =>
        !search ||
        u.hoTen.toLowerCase().includes(search.toLowerCase()) ||
        u.tenDangNhap.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Người dùng</h1>
                <p>Quản lý tài khoản và phân quyền người dùng hệ thống</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input 
                        className="search-input" 
                        placeholder="🔍 Tìm kiếm người dùng..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                {canAdd && <button className="btn-add" onClick={() => openModal()}>+ Thêm người dùng</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <p>Chưa có dữ liệu người dùng</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên đăng nhập</th>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td><strong>{u.tenDangNhap}</strong></td>
                                    <td>{u.hoTen}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className="status-badge badge-primary">
                                            {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            {canEdit && <button className="btn-action btn-edit" onClick={() => openModal(u)}>Sửa</button>}
                                            {canEdit && <button className="btn-action btn-view" onClick={() => handleResetPassword(u)}>Reset PW</button>}
                                            {canDelete && <button className="btn-action btn-delete" onClick={() => handleDelete(u)}>Xóa</button>}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Tên đăng nhập *</label>
                            <input 
                                value={formData.tenDangNhap || ''} 
                                onChange={e => setFormData({ ...formData, tenDangNhap: e.target.value })}
                                disabled={!!editingUser}
                            />
                        </div>

                        {!editingUser && (
                            <div className="form-group">
                                <label>Mật khẩu *</label>
                                <input 
                                    type="password"
                                    value={formData.matKhau || ''} 
                                    onChange={e => setFormData({ ...formData, matKhau: e.target.value })}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>Họ tên *</label>
                            <input 
                                value={formData.hoTen || ''} 
                                onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Email *</label>
                            <input 
                                type="email"
                                value={formData.email || ''} 
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Số điện thoại</label>
                            <input
                                placeholder="0912345678"
                                value={(formData as any).soDienThoai || ''}
                                onChange={e => setFormData({ ...formData, soDienThoai: e.target.value } as any)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Vai trò *</label>
                            <select 
                                value={formData.role || 'doctor'} 
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="admin">👑 Quản trị viên (Admin)</option>
                                <option value="doctor">👨‍⚕️ Bác sĩ</option>
                                <option value="nurse">👩‍⚕️ Y tá</option>
                                <option value="caregiver">🩺 Điều dưỡng</option>
                                <option value="accountant">💰 Kế toán</option>
                                <option value="patient">🧑 Bệnh nhân</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
