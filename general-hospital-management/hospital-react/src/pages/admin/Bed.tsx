import { useState, useEffect, useCallback } from 'react';
import { bedApi, Bed, CreateBedRequest, departmentApi, Department } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import { getStatusColor } from '../../utils/formatters';
import '../../assets/css/admin/admin.css';

export default function BedPage() {
    const [beds, setBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingBed, setEditingBed] = useState<Bed | null>(null);
    const [formData, setFormData] = useState<Partial<CreateBedRequest>>({});
    const [departments, setDepartments] = useState<Department[]>([]);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [bedsRes, deptRes] = await Promise.allSettled([bedApi.getAll(), departmentApi.getAll()]);
            setBeds(bedsRes.status === 'fulfilled' ? ((bedsRes.value as { data?: Bed[] })?.data || (bedsRes.value as Bed[]) || []) : []);
            setDepartments(deptRes.status === 'fulfilled' ? ((deptRes.value as { data?: Department[] })?.data || (deptRes.value as Department[]) || []) : []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filteredBeds: Bed[] = beds.filter(b =>
        !search || (b.tenGiuong || '').toLowerCase().includes(search.toLowerCase()) || (b.maGiuong || '').toLowerCase().includes(search.toLowerCase())
    );

    const openModal = (bed: Bed | null = null) => {
        setEditingBed(bed);
        setFormData(bed ? { ...bed } : { maGiuong: '', tenGiuong: '', khoaId: '', loaiGiuong: 'Thường', giaGiuong: 0, trangThai: 'Trống' });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.maGiuong) { setError('Vui lòng nhập mã giường'); return; }
        setSaving(true);
        try {
            if (editingBed) { await bedApi.update(editingBed.id, formData); }
            else { await bedApi.create(formData as CreateBedRequest); }
            setShowModal(false); loadData();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Lưu thất bại');
        } finally { setSaving(false); }
    };

    const handleDelete = async (bed: Bed) => {
        if (!window.confirm(`Xóa giường "${bed.maGiuong}"?`)) return;
        try { await bedApi.delete(bed.id); loadData(); }
        catch (err: unknown) { const axiosErr = err as { response?: { data?: { message?: string } } }; alert(axiosErr.response?.data?.message || 'Xóa thất bại'); }
    };

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Quản lý Giường bệnh</h1><p>Theo dõi và quản lý giường bệnh</p></div>
            <div className="page-toolbar">
                <div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm giường..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                {canAdd && <button className="btn-add" onClick={() => openModal()}>+ Thêm giường</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : filteredBeds.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🛏️</div><p>Chưa có dữ liệu giường bệnh</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Mã giường</th><th>Tên giường</th><th>Khoa</th><th>Loại</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                        <tbody>{filteredBeds.map(b => (
                            <tr key={b.id}>
                                <td><strong>{b.maGiuong}</strong></td><td>{b.tenGiuong}</td><td>{b.tenKhoa || b.khoaId}</td><td>{b.loaiGiuong}</td>
                                <td>{b.giaGiuong?.toLocaleString('vi-VN')} đ</td>
                                <td><span className={`status-badge badge-${getStatusColor(b.trangThai)}`}>{b.trangThai}</span></td>
                                <td><div className="action-btns">
                                    {canEdit && <button className="btn-action btn-edit" onClick={() => openModal(b)}>Sửa</button>}
                                    {canDelete && <button className="btn-action btn-delete" onClick={() => handleDelete(b)}>Xóa</button>}
                                </div></td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>{editingBed ? 'Chỉnh sửa giường' : 'Thêm giường mới'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        <div className="form-row">
                            <div className="form-group"><label>Mã giường *</label><input value={formData.maGiuong || ''} onChange={e => setFormData({ ...formData, maGiuong: e.target.value })} /></div>
                            <div className="form-group"><label>Tên giường</label><input value={formData.tenGiuong || ''} onChange={e => setFormData({ ...formData, tenGiuong: e.target.value })} /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Khoa</label>
                                <select value={String(formData.khoaId || '')} onChange={e => setFormData({ ...formData, khoaId: e.target.value })}>
                                    <option value="">-- Chọn khoa --</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.tenKhoa}</option>)}
                                </select>
                            </div>
                            <div className="form-group"><label>Loại giường</label>
                                <select value={formData.loaiGiuong || ''} onChange={e => setFormData({ ...formData, loaiGiuong: e.target.value })}>
                                    <option value="Thường">Thường</option><option value="VIP">VIP</option><option value="ICU">ICU</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Giá giường</label><input type="number" value={formData.giaGiuong || 0} onChange={e => setFormData({ ...formData, giaGiuong: Number(e.target.value) })} /></div>
                            <div className="form-group"><label>Trạng thái</label>
                                <select value={formData.trangThai || ''} onChange={e => setFormData({ ...formData, trangThai: e.target.value })}>
                                    <option value="Trống">Trống</option><option value="Đang sử dụng">Đang sử dụng</option><option value="Bảo trì">Bảo trì</option>
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
