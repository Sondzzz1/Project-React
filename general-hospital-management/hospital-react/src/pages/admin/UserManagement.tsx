import { useState, useEffect, useCallback } from 'react';
import { userManagementApi, ManagedUser, CreateUserRequest, doctorApi, nurseApi, departmentApi, Department } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_LABELS } from '../../constant/context';
import './AdminPages.css';

export default function UserManagementPage() {
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
    const [formData, setFormData] = useState<Partial<CreateUserRequest & { 
        vaiTro?: string, 
        soDienThoai?: string,
        khoaId?: string | number,
        chuyenKhoa?: string,
        chungChiHanhNghe?: string
    }>>({});
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    const { role, canAdd, canEdit, canDelete } = usePermissions();
    const isActuallyAdmin = role === 'Admin';

    const loadUsers = useCallback(async () => {
        if (!isActuallyAdmin) return;
        try {
            setLoading(true);
            const result = await userManagementApi.getAll();
            // Xử lý dữ liệu trả về linh hoạt (mảng hoặc object lồng)
            const data = (result as any)?.data || result || [];
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Load users error:', err);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [isActuallyAdmin]);

    const loadDepartments = useCallback(async () => {
        try {
            const data = await departmentApi.getAll();
            setDepartments(data || []);
        } catch (err) {
            console.error('Load departments error:', err);
        }
    }, []);

    useEffect(() => { 
        loadUsers(); 
        loadDepartments();
    }, [loadUsers, loadDepartments]);

    const openModal = (user: ManagedUser | null = null) => {
        setEditingUser(user);
        if (user) {
            // Lấy các giá trị an toàn hỗ trợ nhiều chuẩn đặt tên
            const hoTen = user.hoTen || (user as any).HoTen || (user as any).fullName || '';
            const tenDangNhap = user.tenDangNhap || (user as any).TenDangNhap || (user as any).userName || '';
            const email = user.email || (user as any).Email || '';
            const currentRole = user.role || (user as any).Role || (user as any).vaiTro || (user as any).VaiTro || 'BenhNhan';
            const soDienThoai = (user as any).soDienThoai || (user as any).SoDienThoai || (user as any).phoneNumber || (user as any).sdt || (user as any).PhoneNumber || '';
            
            setFormData({ 
                tenDangNhap,
                hoTen,
                email,
                soDienThoai,
                role: currentRole,
                vaiTro: currentRole,
                khoaId: (user as any).khoaId || '',
                chuyenKhoa: (user as any).chuyenKhoa || '',
                chungChiHanhNghe: (user as any).chungChiHanhNghe || ''
            });
        } else {
            setFormData({ 
                tenDangNhap: '', 
                matKhau: '', 
                hoTen: '', 
                email: '', 
                soDienThoai: '',
                role: 'BacSi',
                vaiTro: 'BacSi',
                khoaId: '',
                chuyenKhoa: '',
                chungChiHanhNghe: ''
            });
        }
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.tenDangNhap || !formData.hoTen || !formData.email || !formData.soDienThoai) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (!editingUser && !formData.matKhau) {
            setError('Vui lòng nhập mật khẩu');
            return;
        }
        setSaving(true);
        setError('');
        
        try {
            // Đảm bảo role và vaiTro luôn đồng nhất theo chuẩn Backend
            const selectedRole = formData.role || formData.vaiTro || 'BacSi';
            const payload = {
                ...formData,
                tenDangNhap: formData.tenDangNhap?.trim(),
                matKhau: formData.matKhau,
                hoTen: formData.hoTen?.trim(),
                HoTen: formData.hoTen?.trim(),
                email: formData.email?.trim(),
                Email: formData.email?.trim(),
                soDienThoai: formData.soDienThoai?.trim(),
                SoDienThoai: formData.soDienThoai?.trim(),
                role: selectedRole,
                vaiTro: selectedRole, // Gửi cả hai để đảm bảo tương thích
                phoneNumber: formData.soDienThoai?.trim(), // Gửi thêm chuẩn English
                PhoneNumber: formData.soDienThoai?.trim()  // Gửi thêm chuẩn PascalCase
            };

            if (editingUser) {
                await userManagementApi.update(editingUser.id, payload as any);
            } else {
                const newUser = await userManagementApi.create(payload as CreateUserRequest);
                
                // TỰ ĐỘNG TẠO HỒ SƠ CHUYÊN MÔN (LINKING LOGIC)
                // Nếu là Bác sĩ, tự động tạo bản ghi bên bảng Bác sĩ
                if (selectedRole === 'BacSi' && newUser?.id) {
                    try {
                        await doctorApi.create({
                            id: newUser.id,
                            hoTen: formData.hoTen?.trim() || newUser.hoTen || 'Chưa cập nhật',
                            email: formData.email?.trim() || newUser.email,
                            soDienThoai: formData.soDienThoai?.trim() || newUser.soDienThoai,
                            chuyenKhoa: formData.chuyenKhoa || 'Đang cập nhật',
                            khoaId: formData.khoaId ? String(formData.khoaId) : undefined
                        });
                        console.log('✅ Đã tự động tạo hồ sơ Bác sĩ');
                    } catch (e) {
                        console.warn('⚠️ Lỗi tự động tạo hồ sơ Bác sĩ:', e);
                    }
                }
                
                // Nếu là Y tá, tự động tạo bản ghi bên bảng Y tá
                if (selectedRole === 'YTa' && newUser?.id) {
                    try {
                        await nurseApi.create({
                            id: newUser.id,
                            hoTen: formData.hoTen?.trim() || newUser.hoTen || 'Chưa cập nhật',
                            email: formData.email?.trim() || newUser.email,
                            soDienThoai: formData.soDienThoai?.trim() || newUser.soDienThoai,
                            chungChiHanhNghe: formData.chungChiHanhNghe || 'Đang cập nhật',
                            khoaId: formData.khoaId ? String(formData.khoaId) : undefined
                        });
                        console.log('✅ Đã tự động tạo hồ sơ Y tá');
                    } catch (e) {
                        console.warn('⚠️ Lỗi tự động tạo hồ sơ Y tá:', e);
                    }
                }
            }
            setShowModal(false);
            loadUsers();
            alert('Lưu tài khoản thành công! ' + (editingUser ? '' : 'Hồ sơ chuyên môn đã được khởi tạo tự động.'));
        } catch (err: unknown) {
            console.error('Save user error:', err);
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Lưu thất bại. Vui lòng kiểm tra lại dữ liệu.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user: ManagedUser) => {
        if (!window.confirm(`Xóa người dùng?`)) return;
        try {
            await userManagementApi.delete(user.id);
            loadUsers();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
        }
    };

    const handleResetPassword = async (user: ManagedUser) => {
        if (!window.confirm(`Reset mật khẩu?`)) return;
        try {
            await userManagementApi.resetPassword(user.id);
            alert('Reset mật khẩu thành công!');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Reset mật khẩu thất bại');
        }
    };

    const filteredUsers = users.filter(u => {
        if (!search) return true;
        const s = search.toLowerCase();
        const hoTen = (u.hoTen || (u as any).HoTen || (u as any).fullName || '').toLowerCase();
        const ten = (u.tenDangNhap || (u as any).TenDangNhap || (u as any).userName || '').toLowerCase();
        const email = (u.email || (u as any).Email || '').toLowerCase();
        return hoTen.includes(s) || ten.includes(s) || email.includes(s);
    });

    if (!isActuallyAdmin) {
        return (
            <div className="admin-page">
                <div className="empty-state">
                    <div className="empty-state-icon">🚫</div>
                    <h2>Quyền truy cập bị từ chối</h2>
                    <p>Chỉ Quản trị viên hệ thống mới có quyền truy cập trang này.</p>
                </div>
            </div>
        );
    }

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
                        placeholder="🔍 Tìm kiếm..." 
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
                                <th>Số điện thoại</th>
                                <th>Vai trò</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((u) => {
                                // Sử dụng dữ liệu đã được chuẩn hóa (normalize) từ service
                                const displayHoTen = u.hoTen || '—';
                                const displayTen = u.tenDangNhap || '—';
                                const displayEmail = u.email || '—';
                                const displayPhone = u.soDienThoai || '—';
                                const userRole = u.role || 'BenhNhan';

                                return (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td><strong>{displayTen}</strong></td>
                                        <td>{displayHoTen}</td>
                                        <td>{displayEmail}</td>
                                        <td>{displayPhone}</td>
                                        <td>
                                            <span className="status-badge badge-primary">
                                                {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] || userRole}
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
                                );
                            })}
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
                            <label>Số điện thoại *</label>
                            <input
                                value={formData.soDienThoai || ''}
                                onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label>Vai trò *</label>
                            <select 
                                value={formData.role || 'BacSi'} 
                                onChange={e => setFormData({ ...formData, role: e.target.value, vaiTro: e.target.value })}
                            >
                                <option value="Admin">👑 Quản trị viên (Admin)</option>
                                <option value="BacSi">👨‍⚕️ Bác sĩ</option>
                                <option value="YTa">👩‍⚕️ Y tá / Điều dưỡng</option>
                                <option value="KeToan">💰 Kế toán</option>
                                <option value="BenhNhan">🧑 Bệnh nhân</option>
                            </select>
                        </div>

                        {/* HIỂN THỊ THÊM CÁC TRƯỜNG CHUYÊN MÔN KHI CHỌN BÁC SĨ / Y TÁ */}
                        {(formData.role === 'BacSi' || formData.role === 'YTa') && !editingUser && (
                            <>
                                <div className="form-group">
                                    <label>Khoa / Phòng *</label>
                                    <select
                                        value={formData.khoaId || ''}
                                        onChange={e => setFormData({ ...formData, khoaId: e.target.value })}
                                    >
                                        <option value="">-- Chọn Khoa --</option>
                                        {departments.map(d => (
                                            <option key={d.id} value={d.id}>{d.tenKhoa}</option>
                                        ))}
                                    </select>
                                </div>

                                {formData.role === 'BacSi' && (
                                    <div className="form-group">
                                        <label>Chuyên khoa *</label>
                                        <input 
                                            placeholder="VD: Nội tổng quát, Răng hàm mặt..."
                                            value={formData.chuyenKhoa || ''}
                                            onChange={e => setFormData({ ...formData, chuyenKhoa: e.target.value })}
                                        />
                                    </div>
                                )}

                                {formData.role === 'YTa' && (
                                    <div className="form-group">
                                        <label>Chứng chỉ hành nghề *</label>
                                        <input 
                                            placeholder="Nhập mã chứng chỉ..."
                                            value={formData.chungChiHanhNghe || ''}
                                            onChange={e => setFormData({ ...formData, chungChiHanhNghe: e.target.value })}
                                        />
                                    </div>
                                )}
                            </>
                        )}

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
