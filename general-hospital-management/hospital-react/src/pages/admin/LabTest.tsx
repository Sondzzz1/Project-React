import { useState, useEffect } from 'react';
import { labTestApi, LabTest } from '../../services/labtest.services';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate } from '../../utils/formatters';
import './AdminPages.css';

export default function LabTestPage() {
    const [labTests, setLabTests] = useState<LabTest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingTest, setEditingTest] = useState<LabTest | null>(null);
    const [formData, setFormData] = useState<Partial<LabTest>>({});
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    useEffect(() => {
        loadLabTests();
    }, []);

    const loadLabTests = async () => {
        try {
            setLoading(true);
            const response = await labTestApi.getAll();
            const data = response || [];
            setLabTests(data);
        } catch (err) {
            console.error('Load lab tests error:', err);
            setLabTests([]);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (test: LabTest | null = null) => {
        setEditingTest(test);
        setFormData(test ? { ...test } : {
            loaiXetNghiem: '',
            ketQua: '',
            ngay: new Date().toISOString().split('T')[0],
            benhNhanId: '',
            bacSiId: ''
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.loaiXetNghiem || !formData.benhNhanId) {
            setError('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        setSaving(true);
        try {
            if (editingTest) {
                await labTestApi.update(editingTest.id, formData);
            } else {
                await labTestApi.create(formData);
            }
            setShowModal(false);
            loadLabTests();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (test: LabTest) => {
        if (!window.confirm(`Xóa xét nghiệm "${test.loaiXetNghiem}"?`)) return;
        try {
            await labTestApi.delete(test.id);
            loadLabTests();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
        }
    };

    const filteredTests = labTests.filter(t =>
        !search ||
        (t.loaiXetNghiem || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.ketQua || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.tenBenhNhan || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Xét nghiệm</h1>
                <p>Quản lý kết quả xét nghiệm y khoa</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input 
                        className="search-input" 
                        placeholder="🔍 Tìm kiếm xét nghiệm..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                {canAdd && <button className="btn-add" onClick={() => openModal()}>+ Thêm xét nghiệm</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filteredTests.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">🔬</div>
                        <p>Chưa có dữ liệu xét nghiệm</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Bệnh Nhân</th>
                                <th>Loại xét nghiệm</th>
                                <th>Kết quả</th>
                                <th>Ngày XN</th>
                                <th>Bệnh nhân ID</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.map(t => (
                                <tr key={t.id}>
                                    <td>{t.id.substring(0,8)}...</td>
                                    <td>{t.tenBenhNhan}</td>
                                    <td><strong>{t.loaiXetNghiem}</strong></td>
                                    <td>
                                        <span className="status-badge badge-primary">
                                            {t.ketQua}
                                        </span>
                                    </td>
                                    <td>{formatDate(t.ngay || '')}</td>
                                    <td>{t.benhNhanId}</td>
                                    <td>
                                        <div className="action-btns">
                                            {canEdit && <button className="btn-action btn-edit" onClick={() => openModal(t)}>Sửa</button>}
                                            {canDelete && <button className="btn-action btn-delete" onClick={() => handleDelete(t)}>Xóa</button>}
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
                        <h2>{editingTest ? 'Chỉnh sửa xét nghiệm' : 'Thêm xét nghiệm mới'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Loại xét nghiệm *</label>
                            <input 
                                value={formData.loaiXetNghiem || ''} 
                                onChange={e => setFormData({ ...formData, loaiXetNghiem: e.target.value })}
                                placeholder="Ví dụ: Glucose máu"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Kết quả</label>
                                <input 
                                    value={formData.ketQua || ''} 
                                    onChange={e => setFormData({ ...formData, ketQua: e.target.value })}
                                    placeholder="Ví dụ: 5.5 mmol/L"
                                />
                            </div>
                            <div className="form-group">
                                <label>Ngày xét nghiệm</label>
                                <input 
                                    type="date"
                                    value={formData.ngay?.split('T')[0] || ''} 
                                    onChange={e => setFormData({ ...formData, ngay: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Bệnh nhân ID *</label>
                                <input 
                                    type="text"
                                    value={formData.benhNhanId || ''} 
                                    onChange={e => setFormData({ ...formData, benhNhanId: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Bác sĩ chỉ định ID</label>
                                <input 
                                    type="text"
                                    value={formData.bacSiId || ''} 
                                    onChange={e => setFormData({ ...formData, bacSiId: e.target.value })}
                                />
                            </div>
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
