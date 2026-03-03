import { useState, useEffect, useCallback } from 'react';
import { patientApi } from '../../api';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate } from '../../utils/formatters';
import './AdminPages.css';

export default function PatientsPage() {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadPatients = useCallback(async () => {
        try {
            setLoading(true);
            const result = search
                ? await patientApi.search({ keyword: search, pageIndex: 1, pageSize: 100 })
                : await patientApi.getAll();
            setPatients(result?.data || result || []);
        } catch (err) {
            console.error('Load patients error:', err);
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadPatients(); }, [loadPatients]);

    const openModal = (patient = null) => {
        setEditingPatient(patient);
        setFormData(patient ? { ...patient } : { hoTen: '', ngaySinh: '', gioiTinh: 'Nam', diaChi: '', soTheBaoHiem: '', trangThai: 'Đang điều trị' });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.hoTen) { setError('Vui lòng nhập họ tên'); return; }
        setSaving(true);
        try {
            if (editingPatient) {
                await patientApi.update(editingPatient.id, formData);
            } else {
                await patientApi.create(formData);
            }
            setShowModal(false);
            loadPatients();
        } catch (err) {
            setError(err.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (patient) => {
        if (!window.confirm(`Xóa bệnh nhân "${patient.hoTen}"?`)) return;
        try {
            await patientApi.delete(patient.id);
            loadPatients();
        } catch (err) {
            alert(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Bệnh nhân</h1>
                <p>Danh sách và quản lý thông tin bệnh nhân</p>
            </div>

            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input className="search-input" placeholder="🔍 Tìm kiếm bệnh nhân..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {canAdd && <button className="btn-add" onClick={() => openModal()}>+ Thêm bệnh nhân</button>}
            </div>

            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : patients.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🏥</div>
                        <p>Chưa có dữ liệu bệnh nhân</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Họ tên</th>
                                <th>Ngày sinh</th>
                                <th>Giới tính</th>
                                <th>Địa chỉ</th>
                                <th>Số thẻ BHYT</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.map(p => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td><strong>{p.hoTen}</strong></td>
                                    <td>{formatDate(p.ngaySinh)}</td>
                                    <td>{p.gioiTinh}</td>
                                    <td>{p.diaChi}</td>
                                    <td>{p.soTheBaoHiem || '—'}</td>
                                    <td><span className={`status-badge badge-${p.trangThai === 'Đang điều trị' ? 'primary' : 'success'}`}>{p.trangThai}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            {canEdit && <button className="btn-action btn-edit" onClick={() => openModal(p)}>Sửa</button>}
                                            {canDelete && <button className="btn-action btn-delete" onClick={() => handleDelete(p)}>Xóa</button>}
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
                        <h2>{editingPatient ? 'Chỉnh sửa bệnh nhân' : 'Thêm bệnh nhân mới'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        <div className="form-group">
                            <label>Họ tên *</label>
                            <input value={formData.hoTen || ''} onChange={e => setFormData({ ...formData, hoTen: e.target.value })} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Ngày sinh</label>
                                <input type="date" value={formData.ngaySinh?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, ngaySinh: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Giới tính</label>
                                <select value={formData.gioiTinh || ''} onChange={e => setFormData({ ...formData, gioiTinh: e.target.value })}>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Địa chỉ</label>
                            <input value={formData.diaChi || ''} onChange={e => setFormData({ ...formData, diaChi: e.target.value })} />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Số thẻ BHYT</label>
                                <input value={formData.soTheBaoHiem || ''} onChange={e => setFormData({ ...formData, soTheBaoHiem: e.target.value })} />
                            </div>
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select value={formData.trangThai || ''} onChange={e => setFormData({ ...formData, trangThai: e.target.value })}>
                                    <option value="Đang điều trị">Đang điều trị</option>
                                    <option value="Đã xuất viện">Đã xuất viện</option>
                                    <option value="Chờ nhập viện">Chờ nhập viện</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
