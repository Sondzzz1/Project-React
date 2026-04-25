import { useState, useEffect, useCallback } from 'react';
import { nurseApi, Nurse, departmentApi, Department } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function NursePage() {
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
    const [formData, setFormData] = useState<Partial<Nurse>>({});
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [nursesRes, deptRes] = await Promise.allSettled([
                nurseApi.getAll(),
                departmentApi.getAll()
            ]);
            
            console.log('Nurses Response:', nursesRes);
            console.log('Departments Response:', deptRes);
            
            if (nursesRes.status === 'fulfilled') {
                const data = nursesRes.value.data || [];
                console.log('Nurses data:', data);
                setNurses(data);
            } else {
                console.error('Nurses error:', nursesRes.reason);
                setNurses([]);
            }
            
            if (deptRes.status === 'fulfilled') {
                const data = deptRes.value;
                const departments = (data as { data?: Department[] })?.data || (Array.isArray(data) ? data : []);
                console.log('Departments data:', departments);
                setDepartments(departments);
            } else {
                console.error('Departments error:', deptRes.reason);
                setDepartments([]);
            }
        } catch (e) {
            console.error('Load data error:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered: Nurse[] = nurses.filter(n => 
        !search || 
        (n.hoTen || '').toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (nurse: Nurse | null = null) => {
        setEditingNurse(nurse);
        setFormData(nurse ? { ...nurse } : {
            hoTen: '',
            ngaySinh: '',
            gioiTinh: '',
            khoaId: undefined,
            soDienThoai: '',
            email: '',
            chungChiHanhNghe: ''
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.hoTen) {
            setError('Vui lòng nhập họ tên');
            return;
        }
        setSaving(true);
        try {
            if (editingNurse) {
                await nurseApi.update(editingNurse.id, formData);
            } else {
                await nurseApi.create(formData);
            }
            setShowModal(false);
            loadData();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (nurse: Nurse) => {
        if (!window.confirm(`Xóa y tá "${nurse.hoTen}"?`)) return;
        try {
            await nurseApi.delete(nurse.id);
            loadData();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Y tá</h1>
                <p>Danh sách y tá trong hệ thống</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input 
                        className="search-input" 
                        placeholder="🔍 Tìm y tá..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                {canAdd && <button className="btn-add" onClick={() => openModal()}>+ Thêm y tá</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👩‍⚕️</div>
                        <p>Chưa có dữ liệu y tá</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ tên</th>
                                <th>Ngày sinh</th>
                                <th>Giới tính</th>
                                <th>Khoa</th>
                                <th>SĐT</th>
                                <th>Chứng chỉ</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(n => (
                                <tr key={n.id}>
                                    <td style={{ fontSize: '0.8em', wordBreak: 'break-all' }}>{n.id}</td>
                                    <td><strong>{n.hoTen}</strong></td>
                                    <td>{n.ngaySinh || '—'}</td>
                                    <td>{n.gioiTinh || '—'}</td>
                                    <td>{n.tenKhoa || '—'}</td>
                                    <td>{n.soDienThoai || '—'}</td>
                                    <td>{n.chungChiHanhNghe || '—'}</td>
                                    <td>
                                        <div className="action-btns">
                                            {canEdit && (
                                                <button 
                                                    className="btn-action btn-edit" 
                                                    onClick={() => openModal(n)}
                                                >
                                                    Sửa
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button 
                                                    className="btn-action btn-delete" 
                                                    onClick={() => handleDelete(n)}
                                                >
                                                    Xóa
                                                </button>
                                            )}
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
                        <h2>{editingNurse ? 'Chỉnh sửa y tá' : 'Thêm y tá mới'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Họ tên *</label>
                            <input 
                                value={formData.hoTen || ''} 
                                onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                                placeholder="Nguyễn Thị B"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input 
                                    type="date"
                                    value={formData.ngaySinh || ''} 
                                    onChange={e => setFormData({ ...formData, ngaySinh: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Giới tính</label>
                                <select value={formData.gioiTinh || ''} onChange={e => setFormData({ ...formData, gioiTinh: e.target.value })}>
                                    <option value="">-- Chọn --</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Khoa</label>
                            <select 
                                value={String(formData.khoaId || '')} 
                                onChange={e => setFormData({ ...formData, khoaId: e.target.value || undefined })}
                            >
                                <option value="">-- Chọn khoa --</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.tenKhoa}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input 
                                    value={formData.soDienThoai || ''} 
                                    onChange={e => setFormData({ ...formData, soDienThoai: e.target.value })}
                                    placeholder="0912345678"
                                />
                            </div>
                            <div className="form-group">
                                <label>Chứng chỉ hành nghề</label>
                                <input 
                                    value={formData.chungChiHanhNghe || ''} 
                                    onChange={e => setFormData({ ...formData, chungChiHanhNghe: e.target.value })}
                                    placeholder="Số chứng chỉ..."
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Hủy
                            </button>
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
