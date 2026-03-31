import { useState, useEffect, useCallback } from 'react';
import { surgeryApi, Surgery, patientApi, Patient, doctorApi, Doctor } from '../../services';
import { formatDate } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function SurgeryPage() {
    const [surgeries, setSurgeries] = useState<Surgery[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingSurgery, setEditingSurgery] = useState<Surgery | null>(null);
    const [formData, setFormData] = useState<Partial<Surgery>>({});
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [surgeriesRes, patientsRes, doctorsRes] = await Promise.allSettled([
                surgeryApi.getAll(),
                patientApi.getAll(),
                doctorApi.getAll()
            ]);
            
            if (surgeriesRes.status === 'fulfilled') {
                const data = surgeriesRes.value;
                const surgeries = (data as { data?: Surgery[] })?.data || [];
                setSurgeries(Array.isArray(data) ? data : surgeries);
            } else {
                setSurgeries([]);
            }
            
            if (patientsRes.status === 'fulfilled') {
                const data = patientsRes.value;
                const patients = (data as { data?: Patient[] })?.data || [];
                setPatients(Array.isArray(data) ? (data as Patient[]) : patients);
            } else {
                setPatients([]);
            }
            
            if (doctorsRes.status === 'fulfilled') {
                const data = doctorsRes.value;
                const doctors = (data as { data?: Doctor[] })?.data || [];
                setDoctors(Array.isArray(data) ? (data as Doctor[]) : doctors);
            } else {
                setDoctors([]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered: Surgery[] = surgeries.filter(s =>
        !search || 
        (s.tenBenhNhan || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.tenBacSi || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.loaiPhauThuat || '').toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (surgery: Surgery | null = null) => {
        setEditingSurgery(surgery);
        setFormData(surgery ? { ...surgery } : {
            benhNhanId: undefined,
            bacSiId: undefined,
            loaiPhauThuat: '',
            ngayPhauThuat: new Date().toISOString().split('T')[0],
            trangThai: 'Đã lên lịch'
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.benhNhanId || !formData.bacSiId || !formData.loaiPhauThuat) {
            setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
            return;
        }
        setSaving(true);
        try {
            if (editingSurgery) {
                await surgeryApi.update(editingSurgery.id, formData);
            } else {
                await surgeryApi.create(formData as Omit<Surgery, 'id'>);
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

    const handleDelete = async (surgery: Surgery) => {
        if (!window.confirm(`Xóa ca phẫu thuật "${surgery.loaiPhauThuat}"?`)) return;
        try {
            await surgeryApi.delete(surgery.id);
            loadData();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Phẫu thuật</h1>
                <p>Lịch phẫu thuật và theo dõi ca mổ</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input 
                        className="search-input" 
                        placeholder="🔍 Tìm ca phẫu thuật..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                {canAdd && <button className="btn-add" onClick={() => openModal()}>+ Thêm lịch mổ</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💉</div>
                        <p>Chưa có dữ liệu phẫu thuật</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Bệnh nhân</th>
                                <th>Bác sĩ</th>
                                <th>Loại PT</th>
                                <th>Ngày</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id}>
                                    <td>{s.id}</td>
                                    <td><strong>{s.tenBenhNhan}</strong></td>
                                    <td>{s.tenBacSi}</td>
                                    <td>{s.loaiPhauThuat}</td>
                                    <td>{formatDate(s.ngayPhauThuat)}</td>
                                    <td>
                                        <span className={`status-badge badge-${
                                            s.trangThai === 'Hoàn thành' ? 'success' :
                                            s.trangThai === 'Đang thực hiện' ? 'primary' :
                                            s.trangThai === 'Hủy' ? 'danger' : 'info'
                                        }`}>
                                            {s.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            {canEdit && (
                                                <button 
                                                    className="btn-action btn-edit" 
                                                    onClick={() => openModal(s)}
                                                >
                                                    Sửa
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button 
                                                    className="btn-action btn-delete" 
                                                    onClick={() => handleDelete(s)}
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
                        <h2>{editingSurgery ? 'Chỉnh sửa phẫu thuật' : 'Thêm lịch phẫu thuật'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>Bệnh nhân *</label>
                                <select 
                                    value={String(formData.benhNhanId || '')} 
                                    onChange={e => setFormData({ ...formData, benhNhanId: Number(e.target.value) || undefined })}
                                >
                                    <option value="">-- Chọn bệnh nhân --</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.hoTen}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Bác sĩ phẫu thuật *</label>
                                <select 
                                    value={String(formData.bacSiId || '')} 
                                    onChange={e => setFormData({ ...formData, bacSiId: Number(e.target.value) || undefined })}
                                >
                                    <option value="">-- Chọn bác sĩ --</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.hoTen} - {d.chuyenKhoa}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Loại phẫu thuật *</label>
                            <input 
                                value={formData.loaiPhauThuat || ''} 
                                onChange={e => setFormData({ ...formData, loaiPhauThuat: e.target.value })}
                                placeholder="Ví dụ: Phẫu thuật ruột thừa"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Ngày phẫu thuật *</label>
                                <input 
                                    type="date"
                                    value={formData.ngayPhauThuat?.split('T')[0] || ''} 
                                    onChange={e => setFormData({ ...formData, ngayPhauThuat: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select 
                                    value={formData.trangThai || ''} 
                                    onChange={e => setFormData({ ...formData, trangThai: e.target.value })}
                                >
                                    <option value="Đã lên lịch">Đã lên lịch</option>
                                    <option value="Đang thực hiện">Đang thực hiện</option>
                                    <option value="Hoàn thành">Hoàn thành</option>
                                    <option value="Hủy">Hủy</option>
                                </select>
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
