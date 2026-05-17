import { useState, useEffect, useCallback } from 'react';
import {
    admissionApi, Admission, CreateAdmissionRequest, UpdateAdmissionRequest,
    bedApi, Bed,
    patientApi, Patient,
    departmentApi, Department
} from '../../services';
import { xuatVienApi, XuatVienPreview } from '../../services/xuatvien.services';
import { bhytApi, KetQuaKiemTraBHYT } from '../../services/bhyt.services';
import { formatDate } from '../../utils/formatters';
import { getStatusColor } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import Pagination from '../../components/common/Pagination';
import '../../assets/css/admin/admin.css';

type ModalMode = 'create' | 'update' | 'transfer' | 'discharge' | null;

export default function AdmissionPage() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
    const [allBeds, setAllBeds] = useState<Bed[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [modalMode, setModalMode] = useState<ModalMode>(null);
    const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    // Form tạo mới nhập viện
    const [createForm, setCreateForm] = useState<Partial<CreateAdmissionRequest>>({});
    // Form cập nhật nhập viện
    const [updateForm, setUpdateForm] = useState<Partial<UpdateAdmissionRequest>>({});
    // Discharge state
    // xuất việt
    const [dischargePreview, setDischargePreview] = useState<XuatVienPreview | null>(null);
    const [dischargeLoading, setDischargeLoading] = useState<boolean>(false);
    const [dischargeGhiChu, setDischargeGhiChu] = useState<string>('');
    const [bhytResult, setBhytResult] = useState<KetQuaKiemTraBHYT | null>(null);
    const [bhytChecking, setBhytChecking] = useState<boolean>(false);

    // Form chuyển giường
    const [newBedId, setNewBedId] = useState<string>('');
    const [transferReason, setTransferReason] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);

    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [admissionsRes, bedsRes, patientsRes, deptsRes] = await Promise.allSettled([
                admissionApi.getAll(),
                bedApi.getAll(),
                patientApi.getAll(),
                departmentApi.getAll()
            ]);

            // Admissions — getAll đã xử lý và trả về Admission[] trực tiếp
            if (admissionsRes.status === 'fulfilled') {
                const data = admissionsRes.value;
                // getAdmissions trả về Admission[] trực tiếp
                setAdmissions(Array.isArray(data) ? data : []);
            } else {
                console.error('Admissions error:', admissionsRes.reason);
                setAdmissions([]);
            }

            // Beds
            if (bedsRes.status === 'fulfilled') {
                const data = bedsRes.value;
                const beds: Bed[] = Array.isArray(data) ? data :
                    ((data as { data?: Bed[] })?.data || []);
                setAllBeds(beds);
                setAvailableBeds(beds.filter(b => b.trangThai === 'Trống'));
            } else {
                setAllBeds([]);
                setAvailableBeds([]);
            }

            // Patients
            if (patientsRes.status === 'fulfilled') {
                const data = patientsRes.value;
                const list: Patient[] = Array.isArray(data) ? data :
                    ((data as { data?: Patient[] })?.data || []);
                setPatients(list);
            } else {
                setPatients([]);
            }

            // Departments
            if (deptsRes.status === 'fulfilled') {
                const data = deptsRes.value;
                const list: Department[] = Array.isArray(data) ? data :
                    ((data as { data?: Department[] })?.data || []);
                setDepartments(list);
            } else {
                setDepartments([]);
            }
        } catch (e) {
            console.error('Load data error:', e);
            setAdmissions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => { setCurrentPage(1); }, [search]);

    const filtered: Admission[] = admissions.filter(a =>
        !search ||
        (a.tenBenhNhan || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.tenKhoa || '').toLowerCase().includes(search.toLowerCase()) ||
        (a.trangThai || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    // ── Mở modal ──────────────────────────────────────────────────────────────

    const openCreateModal = () => {
        setCreateForm({ benhNhanId: '', giuongId: '', khoaId: '', lyDoNhap: '', isDungTuyen: false });
        setError('');
        setModalMode('create');
    };

    const openUpdateModal = (a: Admission) => {
        setSelectedAdmission(a);
        setUpdateForm({ id: a.id, lyDoNhap: a.lyDoNhap, trangThai: a.trangThai, ngayXuat: a.ngayXuat });
        setError('');
        setModalMode('update');
    };

    const openTransferModal = (a: Admission) => {
        setSelectedAdmission(a);
        setNewBedId('');
        setTransferReason('');
        setError('');
        setModalMode('transfer');
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedAdmission(null);
        setError('');
    };

    // ── Xử lý lưu ─────────────────────────────────────────────────────────────

    const handleCreate = async () => {
        if (!createForm.benhNhanId || !createForm.giuongId || !createForm.khoaId || !createForm.lyDoNhap) {
            setError('Vui lòng nhập đầy đủ: bệnh nhân, giường, khoa, lý do nhập');
            return;
        }
        setSaving(true);
        try {
            await admissionApi.create(createForm as CreateAdmissionRequest);
            closeModal();
            loadData();
            alert('Nhập viện thành công!');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Nhập viện thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async () => {
        if (!updateForm.id) return;
        setSaving(true);
        try {
            await admissionApi.update(updateForm as UpdateAdmissionRequest);
            closeModal();
            loadData();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    };
    // chuyển giường
    const handleTransfer = async () => {
        if (!selectedAdmission || !newBedId || !transferReason) {
            setError('Vui lòng chọn giường mới và nhập lý do chuyển');
            return;
        }
        setSaving(true);
        try {
            await admissionApi.transferBed(selectedAdmission.id, newBedId, transferReason);
            closeModal();
            loadData();
            alert('Chuyển giường thành công!');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Chuyển giường thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (a: Admission) => {
        if (!window.confirm(`Xóa phiếu nhập viện của "${a.tenBenhNhan}"?`)) return;
        try {
            await admissionApi.delete(a.id);
            loadData();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
        }
    };
    // kiểm tra điều kiện xuất viện
    const openDischargeModal = async (a: Admission) => {
        setSelectedAdmission(a);
        setDischargeGhiChu('');
        setBhytResult(null);
        setError('');
        setDischargePreview(null);
        setModalMode('discharge');
        // Tự động kiểm tra điều kiện xuất viện
        setDischargeLoading(true);
        try {
            const preview = await xuatVienApi.getPreview(a.id);
            setDischargePreview(preview);
        } catch {
            setError('Không thể kiểm tra điều kiện xuất viện');
        } finally {
            setDischargeLoading(false);
        }
    };
    
    const handleCheckBHYT = async () => {
        if (!dischargePreview?.soTheBaoHiem) return;
        setBhytChecking(true);
        try {
            const result = await bhytApi.kiemTraThe(dischargePreview.soTheBaoHiem);
            setBhytResult(result);
        } catch {
            setError('Không thể kiểm tra thẻ BHYT');
        } finally {
            setBhytChecking(false);
        }
    };

    const handleDischarge = async () => {
        if (!selectedAdmission) return;
        const isReady = dischargePreview?.sanSangXuatVien ?? dischargePreview?.coTheXuatVien ?? false;
        if (dischargePreview && !isReady) {
            if (!window.confirm('Chưa đủ điều kiện. Bạn vẫn muốn tiếp tục xuất viện?')) return;
        }
        setSaving(true);
        try {
            await xuatVienApi.xacNhan({ nhapVienId: selectedAdmission.id, ghiChu: dischargeGhiChu });
            closeModal();
            loadData();
            alert('Xuất viện thành công!');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Xuất viện thất bại');
        } finally {
            setSaving(false);
        }
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Nhập viện</h1>
                <p>Theo dõi bệnh nhân nhập viện, chuyển giường, xuất viện</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input
                        className="search-input"
                        placeholder="🔍 Tìm bệnh nhân, khoa, trạng thái..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {canAdd && (
                    <button className="btn-add" onClick={openCreateModal}>
                        + Nhập viện mới
                    </button>
                )}
            </div>

            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <p>Chưa có dữ liệu nhập viện</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Bệnh nhân</th>
                                    <th>Giường</th>
                                    <th>Khoa</th>
                                    <th>Lý do nhập</th>
                                    <th>Ngày nhập</th>
                                    <th>Ngày xuất</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(a => (
                                    <tr key={a.id}>
                                        <td><strong>{a.tenBenhNhan || '—'}</strong></td>
                                        <td>{a.tenGiuong || a.giuongId?.substring(0, 8) + '...' || '—'}</td>
                                        <td>{a.tenKhoa || a.khoaId?.substring(0, 8) + '...' || '—'}</td>
                                        <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {a.lyDoNhap || '—'}
                                        </td>
                                        <td>{formatDate(a.ngayNhap, 'full')}</td>
                                        <td>{a.ngayXuat ? formatDate(a.ngayXuat, 'full') : '—'}</td>
                                        <td>
                                            <span className={`status-badge badge-${getStatusColor(a.trangThai)}`}>
                                                {a.trangThai}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                {canEdit && (
                                                    <button
                                                        className="btn-action btn-edit"
                                                        onClick={() => openUpdateModal(a)}
                                                    >
                                                        Sửa
                                                    </button>
                                                )}
                                                {canEdit && a.trangThai === 'Đang điều trị' && (
                                                    <button
                                                        className="btn-action"
                                                        style={{ background: '#6366f1', color: '#fff', border: 'none' }}
                                                        onClick={() => openTransferModal(a)}
                                                    >
                                                        🔄 Chuyển giường
                                                    </button>
                                                )}
                                                {canEdit && (a.trangThai === 'Đang điều trị' || a.trangThai === 'Chờ xuất viện') && (
                                                    <button
                                                        className="btn-action"
                                                        style={{ background: '#10b981', color: '#fff', border: 'none' }}
                                                        onClick={() => openDischargeModal(a)}
                                                    >
                                                        🏥 Xuất viện
                                                    </button>
                                                )}
                                                {canDelete && (
                                                    <button
                                                        className="btn-action btn-delete"
                                                        onClick={() => handleDelete(a)}
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
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filtered.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
                        />
                    </>
                )}
            </div>

            {/* ── Modal Nhập viện mới ─────────────────────────────────────────── */}
            {modalMode === 'create' && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Nhập viện mới</h2>
                        {error && <div className="login-error">{error}</div>}

                        <div className="form-row">
                            <div className="form-group">
                                <label>Bệnh nhân *</label>
                                <select
                                    value={createForm.benhNhanId || ''}
                                    onChange={e => setCreateForm({ ...createForm, benhNhanId: e.target.value })}
                                >
                                    <option value="">-- Chọn bệnh nhân --</option>
                                    {patients.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.hoTen} {p.ngaySinh ? `(${formatDate(p.ngaySinh)})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Khoa *</label>
                                <select
                                    value={createForm.khoaId || ''}
                                    onChange={e => setCreateForm({ ...createForm, khoaId: e.target.value })}
                                >
                                    <option value="">-- Chọn khoa --</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>{d.tenKhoa}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Giường *</label>
                            <select
                                value={createForm.giuongId || ''}
                                onChange={e => setCreateForm({ ...createForm, giuongId: e.target.value })}
                            >
                                <option value="">-- Chọn giường trống --</option>
                                {availableBeds.map(b => (
                                    <option key={b.id} value={b.id}>
                                        {b.tenGiuong || b.id} — {b.loaiGiuong}
                                        {(b.giaTien ?? b.giaGiuong) ? ` (${Number(b.giaTien ?? b.giaGiuong).toLocaleString('vi-VN')} đ)` : ''}
                                    </option>
                                ))}
                            </select>
                            {availableBeds.length === 0 && (
                                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '4px' }}>
                                    ⚠️ Không có giường trống
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Lý do nhập viện *</label>
                            <textarea
                                rows={3}
                                value={createForm.lyDoNhap || ''}
                                onChange={e => setCreateForm({ ...createForm, lyDoNhap: e.target.value })}
                                placeholder="Nhập lý do nhập viện..."
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={createForm.isDungTuyen || false}
                                    onChange={e => setCreateForm({ ...createForm, isDungTuyen: e.target.checked })}
                                />
                                Đúng tuyến (có bảo hiểm y tế)
                            </label>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>Hủy</button>
                            <button className="btn-save" onClick={handleCreate} disabled={saving}>
                                {saving ? 'Đang lưu...' : '✅ Xác nhận nhập viện'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Cập nhật nhập viện ───────────────────────────────────── */}
            {modalMode === 'update' && selectedAdmission && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Cập nhật nhập viện</h2>
                        {error && <div className="login-error">{error}</div>}

                        <div className="form-group">
                            <label>Bệnh nhân (chỉ đọc)</label>
                            <input value={selectedAdmission.tenBenhNhan || ''} readOnly
                                style={{ background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>Lý do nhập viện</label>
                            <textarea
                                rows={3}
                                value={updateForm.lyDoNhap || ''}
                                onChange={e => setUpdateForm({ ...updateForm, lyDoNhap: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Trạng thái</label>
                                <select
                                    value={updateForm.trangThai || ''}
                                    onChange={e => setUpdateForm({ ...updateForm, trangThai: e.target.value })}
                                >
                                    <option value="Đang điều trị">Đang điều trị</option>
                                    <option value="Chờ xuất viện">Chờ xuất viện</option>
                                    <option value="Đã xuất viện">Đã xuất viện</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Ngày xuất viện</label>
                                <input
                                    type="datetime-local"
                                    value={updateForm.ngayXuat ? updateForm.ngayXuat.slice(0, 16) : ''}
                                    onChange={e => setUpdateForm({ ...updateForm, ngayXuat: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>Hủy</button>
                            <button className="btn-save" onClick={handleUpdate} disabled={saving}>
                                {saving ? 'Đang lưu...' : 'Lưu'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Modal Chuyển giường ────────────────────────────────────────── */}
            {modalMode === 'transfer' && selectedAdmission && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Chuyển giường bệnh nhân</h2>
                        {error && <div className="login-error">{error}</div>}

                        <div className="form-group">
                            <label>Bệnh nhân</label>
                            <input value={selectedAdmission.tenBenhNhan || ''} disabled
                                style={{ background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }} />
                        </div>

                        <div className="form-group">
                            <label>Giường hiện tại</label>
                            <input
                                value={selectedAdmission.tenGiuong || selectedAdmission.giuongId || ''}
                                disabled
                                style={{ background: '#f3f4f6', color: '#6b7280', cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Giường mới *</label>
                            <select value={newBedId} onChange={e => setNewBedId(e.target.value)}>
                                <option value="">-- Chọn giường trống --</option>
                                {availableBeds
                                    .filter(b => String(b.id) !== String(selectedAdmission.giuongId))
                                    .map(b => (
                                        <option key={b.id} value={b.id}>
                                            {b.tenGiuong || b.id} — {b.loaiGiuong}
                                            {(b.giaTien ?? b.giaGiuong) ? ` (${Number(b.giaTien ?? b.giaGiuong).toLocaleString('vi-VN')} đ)` : ''}
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Lý do chuyển giường *</label>
                            <textarea
                                rows={3}
                                value={transferReason}
                                onChange={e => setTransferReason(e.target.value)}
                                placeholder="Nhập lý do chuyển giường..."
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>Hủy</button>
                            <button className="btn-save" onClick={handleTransfer} disabled={saving}>
                                {saving ? 'Đang chuyển...' : '🔄 Xác nhận chuyển'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Modal Xuất viện ──────────────────────────────────────────── */}
            {modalMode === 'discharge' && selectedAdmission && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
                        <h2>🏥 Xuất viện — {selectedAdmission.tenBenhNhan}</h2>
                        {error && <div className="login-error">{error}</div>}

                        {dischargeLoading ? (
                            <div className="loading-center">Đang kiểm tra điều kiện...</div>
                        ) : dischargePreview ? (
                            <>
                                {/* Thông tin điều kiện xuất viện */}
                                    <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                                        <div>📅 Số ngày nằm viện: <strong>{dischargePreview.soNgayNam ?? dischargePreview.soNgayNamVien ?? dischargePreview.ngayNamVien ?? '—'}</strong></div>
                                        <div>🧾 Số hóa đơn: <strong>{dischargePreview.danhSachHoaDon?.length ?? dischargePreview.soHoaDon ?? dischargePreview.hoaDonCount ?? '0'}</strong></div>
                                        
                                        <div>💰 Tổng chi phí: <strong>
                                            {dischargePreview.tongTienHoaDon ?? dischargePreview.tongChiPhiDichVu ?? dischargePreview.tongTien ?? dischargePreview.chiPhi 
                                                ? Number(dischargePreview.tongTienHoaDon ?? dischargePreview.tongChiPhiDichVu ?? dischargePreview.tongTien ?? dischargePreview.chiPhi).toLocaleString('vi-VN') + ' đ' 
                                                : '0 đ'}
                                        </strong></div>

                                        <div>✅ Đã thanh toán: <strong style={{ color: '#16a34a' }}>
                                            {dischargePreview.daThanhToan !== undefined
                                                ? Number(dischargePreview.daThanhToan).toLocaleString('vi-VN') + ' đ'
                                                : '0 đ'}
                                        </strong></div>

                                        <div style={{ gridColumn: 'span 2', padding: '8px', background: '#fee2e2', borderRadius: '4px', border: '1px solid #fca5a5' }}>
                                            ⚠️ Còn nợ: <strong style={{ color: '#dc2626', fontSize: '1.05rem' }}>
                                                {dischargePreview.conNo !== undefined
                                                    ? Number(dischargePreview.conNo).toLocaleString('vi-VN') + ' đ'
                                                    : '0 đ'}
                                            </strong>
                                            {dischargePreview.conNo > 0 && <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: '#991b1b' }}>(Vui lòng thanh toán trước khi xuất viện)</span>}
                                        </div>
                                    </div>

                                {/* Kiểm tra BHYT nếu có thẻ */}
                                {dischargePreview.soTheBaoHiem && (
                                    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 'bold', color: '#0369a1' }}>🏷️ Thẻ BHYT: {dischargePreview.soTheBaoHiem}</span>
                                            <button
                                                className="btn-action btn-edit"
                                                onClick={handleCheckBHYT}
                                                disabled={bhytChecking}
                                                style={{ padding: '4px 10px', fontSize: '0.85rem' }}
                                            >
                                                {bhytChecking ? 'Đang kiểm tra...' : '🔍 Kiểm tra'}
                                            </button>
                                        </div>
                                        {bhytResult && (
                                            <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
                                                <div style={{ color: bhytResult.hopLe ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
                                                    {bhytResult.hopLe ? '✅ Thẻ hợp lệ' : '❌ Thẻ không hợp lệ'} — {bhytResult.thongBao}
                                                </div>
                                                {bhytResult.hopLe && (
                                                    <div style={{ marginTop: '4px', color: '#0369a1' }}>
                                                        Mức hưởng: <strong>{bhytResult.mucHuong}%</strong>
                                                        {bhytResult.hanThe && <> | Hạn: <strong>{bhytResult.hanThe}</strong></>}
                                                        {' | '}{bhytResult.goiYTuyen}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Ghi chú xuất viện */}
                                <div className="form-group">
                                    <label>Ghi chú xuất viện</label>
                                    <textarea
                                        rows={2}
                                        value={dischargeGhiChu}
                                        onChange={e => setDischargeGhiChu(e.target.value)}
                                        placeholder="Ghi chú thêm khi xuất viện..."
                                    />
                                </div>
                            </>
                        ) : null}

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={closeModal}>Hủy</button>
                            <button
                                className="btn-save"
                                style={{ background: dischargePreview && dischargePreview.sanSangXuatVien === false ? '#94a3b8' : '#10b981' }}
                                onClick={handleDischarge}
                                disabled={saving || dischargeLoading || (dischargePreview && dischargePreview.sanSangXuatVien === false)}
                                title={dischargePreview && dischargePreview.sanSangXuatVien === false ? "Bệnh nhân chưa thanh toán đủ viện phí" : ""}
                            >
                                {saving ? 'Đang xử lý...' : '🏥 Xác nhận xuất viện'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
