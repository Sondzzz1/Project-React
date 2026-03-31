import { useState, useEffect, useCallback } from 'react';
import { doctorApi, Doctor, departmentApi, Department } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function DoctorPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
    const [formData, setFormData] = useState<Partial<Doctor>>({});
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [doctorsRes, deptRes] = await Promise.allSettled([
                doctorApi.getAll(),
                departmentApi.getAll()
            ]);
            
            if (doctorsRes.status === 'fulfilled') {
                const data = doctorsRes.value;
                const doctors = (data as { data?: Doctor[] })?.data || [];
                setDoctors(Array.isArray(data) ? data : doctors);
            } else {
                setDoctors([]);
            }
            
            if (deptRes.status === 'fulfilled') {
                const data = deptRes.value;
                const departments = (data as { data?: Department[] })?.data || [];
                setDepartments(Array.isArray(data) ? data : departments);
            } else {
                setDepartments([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered: Doctor[] = doctors.filter(d => 
        !search || 
        (d.hoTen || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.chuyenKhoa || '').toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (doctor: Doctor | null = null) => {
        setEditingDoctor(doctor);
        setFormData(doctor ? { ...doctor } : {
            hoTen: '',
            chuyenKhoa: '',
            soDienThoai: '',
            email: '',
            khoaId: undefined
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.hoTen || !formData.chuyenKhoa) {
            setError('Vui lòng nhập họ tên và chuyên khoa');
            return;
        }
        setSaving(true);
        try {
            if (editingDoctor) {
                await doctorApi.update(editingDoctor.id, formData);
            } else {
                await doctorApi.create(formData);
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

    const handleDelete = async (doctor: Doctor) => {
        if (!window.confirm(`Xóa bác sĩ "${doctor.hoTen}"?`)) return;
        try {
            await doctorApi.delete(doctor.id);
            loadData();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Bác sĩ</h1>
                <p>Danh sách bác sĩ trong hệ thống</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input 
                        className="search-input" 
                        placeholder="🔍 Tìm bác sĩ..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                {canAdd && <button className="btn-add" onClick={() => openModal()}>+ Thêm bác sĩ</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">👨‍⚕️</div>
                        <p>Chưa có dữ liệu bác sĩ</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ tên</th>
                                <th>Chuyên khoa</th>
                                <th>Khoa</th>
                                <th>SĐT</th>
                                <th>Email</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(d => (
                                <tr key={d.id}>
                                    <td>{d.id}</td>
                                    <td><strong>{d.hoTen}</strong></td>
                                    <td>{d.chuyenKhoa}</td>
                                    <td>{d.tenKhoa || '—'}</td>
                                    <td>{d.soDienThoai || '—'}</td>
                                    <td>{d.email || '—'}</td>
                                    <td>
                                        <div className="action-btns">
                                            {canEdit && (
                                                <button 
                                                    className="btn-action btn-edit" 
                                                    onClick={() => openModal(d)}
                                                >
                                                    Sửa
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button 
                                                    className="btn-action btn-delete" 
                                                    onClick={() => handleDelete(d)}
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
                        <h2>{editingDoctor ? 'Chỉnh sửa bác sĩ' : 'Thêm bác sĩ mới'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Họ tên *</label>
                            <input 
                                value={formData.hoTen || ''} 
                                onChange={e => setFormData({ ...formData, hoTen: e.target.value })}
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Chuyên khoa *</label>
                                <input 
                                    value={formData.chuyenKhoa || ''} 
                                    onChange={e => setFormData({ ...formData, chuyenKhoa: e.target.value })}
                                    placeholder="Nội khoa"
                                />
                            </div>
                            <div className="form-group">
                                <label>Khoa</label>
                                <select 
                                    value={String(formData.khoaId || '')} 
                                    onChange={e => setFormData({ ...formData, khoaId: Number(e.target.value) || undefined })}
                                >
                                    <option value="">-- Chọn khoa --</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.tenKhoa}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                <label>Email</label>
                                <input 
                                    type="email"
                                    value={formData.email || ''} 
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="doctor@hospital.com"
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
