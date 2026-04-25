import { useState, useEffect, useCallback } from 'react';
import { surgeryApi, Surgery, patientApi, Patient, doctorApi, Doctor } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

// Hàm format ngày từ ISO string → dd/MM/yyyy HH:mm
function formatDateTime(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    } catch {
        return dateStr;
    }
}

// Hàm format ngày sang yyyy-MM-ddTHH:mm để dùng trong input[datetime-local]
function toInputDateTime(dateStr?: string): string {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return '';
        // Format: yyyy-MM-ddTHH:mm
        return d.toISOString().slice(0, 16);
    } catch {
        return '';
    }
}

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
                const list = (data as { data?: Surgery[] })?.data;
                setSurgeries(Array.isArray(data) ? (data as Surgery[]) : (list || []));
            } else {
                setSurgeries([]);
            }

            if (patientsRes.status === 'fulfilled') {
                const data = patientsRes.value;
                const list = (data as { data?: Patient[] })?.data;
                setPatients(Array.isArray(data) ? (data as Patient[]) : (list || []));
            } else {
                setPatients([]);
            }

            if (doctorsRes.status === 'fulfilled') {
                const data = doctorsRes.value;
                const list = (data as { data?: Doctor[] })?.data;
                setDoctors(Array.isArray(data) ? (data as Doctor[]) : (list || []));
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
        (s.loaiPhauThuat || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.phongMo || '').toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (surgery: Surgery | null = null) => {
        setEditingSurgery(surgery);
        setFormData(surgery ? { ...surgery } : {
            nhapVienId: undefined,     // PhauThuat.NhapVienId
            bacSiChinhId: undefined,   // PhauThuat.BacSiChinhId
            loaiPhauThuat: '',
            ngay: new Date().toISOString().slice(0, 16), // PhauThuat.Ngay
            ekip: '',
            phongMo: '',
            trangThai: 'Đã lên lịch',
            chiPhi: undefined
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.loaiPhauThuat) {
            setError('Vui lòng nhập loại phẫu thuật');
            return;
        }
        setSaving(true);
        try {
            if (editingSurgery) {
                await surgeryApi.update(editingSurgery.id, formData);
            } else {
                await surgeryApi.create(formData as Partial<Surgery>);
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

    const getStatusClass = (status?: string) => {
        switch (status) {
            case 'Hoàn thành': return 'success';
            case 'Đang thực hiện': return 'primary';
            case 'Hủy': return 'danger';
            default: return 'info'; // Đã lên lịch
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
                                <th>Bệnh nhân</th>
                                <th>Bác sĩ chính</th>
                                <th>Loại phẫu thuật</th>
                                <th>Ngày mổ</th>
                                <th>Phòng mổ</th>
                                <th>Chi phí</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s.id}>
                                    <td><strong>{s.tenBenhNhan || s.nhapVienId || '—'}</strong></td>
                                    <td>{s.tenBacSi || s.bacSiChinhId || '—'}</td>
                                    <td>{s.loaiPhauThuat || '—'}</td>
                                    <td>{formatDateTime(s.ngay)}</td>
                                    <td>{s.phongMo || '—'}</td>
                                    <td>
                                        {s.chiPhi != null
                                            ? Number(s.chiPhi).toLocaleString('vi-VN') + ' đ'
                                            : '—'}
                                    </td>
                                    <td>
                                        <span className={`status-badge badge-${getStatusClass(s.trangThai)}`}>
                                            {s.trangThai || '—'}
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

                        {/* NhapVienId - chọn bệnh nhân qua danh sách */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nhập viện (Bệnh nhân) *</label>
                                <select
                                    value={String(formData.nhapVienId || '')}
                                    onChange={e => setFormData({ ...formData, nhapVienId: e.target.value || undefined })}
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
                                <label>Bác sĩ phẫu thuật chính *</label>
                                <select
                                    value={String(formData.bacSiChinhId || '')}
                                    onChange={e => setFormData({ ...formData, bacSiChinhId: e.target.value || undefined })}
                                >
                                    <option value="">-- Chọn bác sĩ --</option>
                                    {doctors.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.hoTen} {d.chuyenKhoa ? `- ${d.chuyenKhoa}` : ''}
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
                            {/* Ngày mổ - dùng datetime-local để khớp PhauThuat.Ngay (DateTime) */}
                            <div className="form-group">
                                <label>Ngày & giờ mổ</label>
                                <input
                                    type="datetime-local"
                                    value={toInputDateTime(formData.ngay)}
                                    onChange={e => setFormData({ ...formData, ngay: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Phòng mổ</label>
                                <input
                                    value={formData.phongMo || ''}
                                    onChange={e => setFormData({ ...formData, phongMo: e.target.value })}
                                    placeholder="Ví dụ: Phòng mổ số 3"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Ê-kíp phẫu thuật</label>
                                <input
                                    value={formData.ekip || ''}
                                    onChange={e => setFormData({ ...formData, ekip: e.target.value })}
                                    placeholder="Tên các thành viên ê-kíp..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Chi phí (VNĐ)</label>
                                <input
                                    type="number"
                                    value={formData.chiPhi ?? ''}
                                    onChange={e => setFormData({ ...formData, chiPhi: e.target.value ? Number(e.target.value) : undefined })}
                                    placeholder="Ví dụ: 5000000"
                                />
                                {formData.chiPhi != null && Number(formData.chiPhi) > 0 && (
                                    <div style={{ fontSize: '0.85rem', color: '#059669', marginTop: '4px', fontWeight: 'bold' }}>
                                        Thực tế: {Number(formData.chiPhi).toLocaleString('vi-VN')} VNĐ
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Trạng thái</label>
                            <select
                                value={formData.trangThai || 'Đã lên lịch'}
                                onChange={e => setFormData({ ...formData, trangThai: e.target.value })}
                            >
                                <option value="Đã lên lịch">Đã lên lịch</option>
                                <option value="Đang thực hiện">Đang thực hiện</option>
                                <option value="Hoàn thành">Hoàn thành</option>
                                <option value="Hủy">Hủy</option>
                            </select>
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
