import { useState, useEffect, useCallback } from 'react';
import { patientApi, Patient, bhytApi } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import { formatDate } from '../../utils/formatters';
import Pagination from '../../components/common/Pagination';
import '../../assets/css/admin/admin.css';

export default function PatientPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState<Partial<Patient>>({});
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [checkingBHYT, setCheckingBHYT] = useState<boolean>(false);
    const [bhytInfo, setBhytInfo] = useState<any>(null);
    const [bhytError, setBhytError] = useState<string>('');
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    
    const { canAdd, canEdit, canDelete } = usePermissions();

    const loadPatients = useCallback(async () => {
        try {
            setLoading(true);
            const result = search
                ? await patientApi.search({ keyword: search, pageIndex: 1, pageSize: 100 })
                : await patientApi.getAll();
            const data = (result as unknown as { data?: Patient[] })?.data || (result as unknown as Patient[]) || [];
            setPatients(data as Patient[]);
        } catch (err) {
            console.error('Load patients error:', err);
            alert('Lỗi khi tải danh sách bệnh nhân, vui lòng thử lại!');
            setPatients([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadPatients(); }, [loadPatients]);

    // Filter and paginate
    const filteredPatients = patients.filter(p =>
        !search ||
        (p.hoTen || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.diaChi || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.soTheBaoHiem || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPatients.length / pageSize);
    const paginatedPatients = filteredPatients.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    const openModal = (patient: Patient | null = null) => {
        setEditingPatient(patient);
        setFormData(patient ? { ...patient } : { 
            hoTen: '', 
            ngaySinh: '', 
            gioiTinh: 'Nam', 
            diaChi: '', 
            soTheBaoHiem: '', 
            mucHuong: 0,
            hanTheBHYT: '',
            trangThai: 'Đang điều trị' 
        });
        setError('');
        setBhytInfo(null);
        setBhytError('');
        setShowModal(true);
    };

    const handleCheckBHYT = async () => {
        const soThe = formData.soTheBaoHiem?.trim();
        if (!soThe) {
            setBhytError('Vui lòng nhập số thẻ BHYT');
            return;
        }
        
        setCheckingBHYT(true);
        setBhytError('');
        setBhytInfo(null);
        
        try {
            const result = await bhytApi.kiemTraThe(soThe);
            setBhytInfo(result);
            
            if (result.hopLe) {
                // Tự động điền thông tin BHYT vào form (có thể chỉnh sửa)
                setFormData({
                    ...formData,
                    mucHuong: result.mucHuong / 100, // Convert % to decimal (80% -> 0.8)
                    hanTheBHYT: result.hanThe
                });
            } else {
                setBhytError(result.thongBao || 'Thẻ BHYT không hợp lệ');
            }
        } catch (err: any) {
            setBhytError(err.response?.data?.message || 'Không thể kiểm tra thẻ BHYT');
        } finally {
            setCheckingBHYT(false);
        }
    };

    const handleSave = async () => {
        if (!formData.hoTen) { setError('Vui lòng nhập họ tên'); return; }
        setSaving(true);
        try {
            if (editingPatient) {
                await patientApi.update(editingPatient.id, formData);
            } else {
                await patientApi.create(formData as Parameters<typeof patientApi.create>[0]);
            }
            setShowModal(false);
            loadPatients();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Lưu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (patient: Patient) => {
        if (!window.confirm(`Xóa bệnh nhân "${patient.hoTen}"?`)) return;
        try {
            await patientApi.delete(patient.id);
            loadPatients();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Xóa thất bại');
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
                ) : filteredPatients.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🏥</div><p>Chưa có dữ liệu bệnh nhân</p></div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead><tr><th>ID</th><th>Họ tên</th><th>Ngày sinh</th><th>Giới tính</th><th>Địa chỉ</th><th>Số thẻ BHYT</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                            <tbody>
                                {paginatedPatients.map(p => (
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
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={filteredPatients.length}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                        />
                    </>
                )}
            </div>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>{editingPatient ? 'Chỉnh sửa bệnh nhân' : 'Thêm bệnh nhân mới'}</h2>
                        {error && <div className="login-error">{error}</div>}
                        <div className="form-group"><label>Họ tên *</label><input value={formData.hoTen || ''} onChange={e => setFormData({ ...formData, hoTen: e.target.value })} /></div>
                        <div className="form-row">
                            <div className="form-group"><label>Ngày sinh</label><input type="date" value={formData.ngaySinh?.split('T')[0] || ''} onChange={e => setFormData({ ...formData, ngaySinh: e.target.value })} /></div>
                            <div className="form-group"><label>Giới tính</label><select value={formData.gioiTinh || ''} onChange={e => setFormData({ ...formData, gioiTinh: e.target.value })}><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                        </div>
                        <div className="form-group"><label>Địa chỉ</label><input value={formData.diaChi || ''} onChange={e => setFormData({ ...formData, diaChi: e.target.value })} /></div>
                        
                        {/* BHYT Section */}
                        <div style={{ 
                            background: '#f0f9ff', 
                            padding: '1rem', 
                            borderRadius: '8px',
                            border: '1px solid #bae6fd',
                            marginTop: '1rem'
                        }}>
                            <h3 style={{ margin: '0 0 1rem 0', color: '#0369a1', fontSize: '1rem' }}>
                                🏥 Thông tin Bảo hiểm Y tế
                            </h3>
                            
                            <div className="form-group">
                                <label>Số thẻ BHYT</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input 
                                        value={formData.soTheBaoHiem || ''} 
                                        onChange={e => {
                                            const value = e.target.value.toUpperCase();
                                            setFormData({ ...formData, soTheBaoHiem: value });
                                        }}
                                        placeholder="VD: DN4010012345678"
                                        style={{ flex: 1 }}
                                    />
                                    <button 
                                        type="button"
                                        className="btn-save"
                                        onClick={handleCheckBHYT}
                                        disabled={checkingBHYT || !formData.soTheBaoHiem}
                                        style={{ 
                                            minWidth: '120px',
                                            background: '#0284c7'
                                        }}
                                    >
                                        {checkingBHYT ? '⏳ Đang kiểm tra...' : '🔍 Kiểm tra'}
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    📝 Nhập số thẻ BHYT. VD: DN4010012345678 (chuẩn 15 ký tự) hoặc DN4087385
                                </div>
                            </div>

                            {bhytError && (
                                <div style={{ 
                                    padding: '0.75rem', 
                                    background: '#fee2e2', 
                                    color: '#991b1b',
                                    borderRadius: '6px',
                                    marginTop: '0.5rem',
                                    fontSize: '0.9rem'
                                }}>
                                    ❌ {bhytError}
                                </div>
                            )}

                            {bhytInfo && bhytInfo.hopLe && (
                                <div style={{ 
                                    padding: '1rem', 
                                    background: '#d1fae5', 
                                    borderRadius: '6px',
                                    marginTop: '0.5rem',
                                    border: '1px solid #6ee7b7'
                                }}>
                                    <div style={{ color: '#065f46', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                        ✅ Thẻ BHYT hợp lệ
                                    </div>
                                    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', color: '#047857' }}>
                                        <div><strong>Mức hưởng:</strong> {bhytInfo.mucHuong}% (= {(bhytInfo.mucHuong / 100).toFixed(2)})</div>
                                        <div><strong>Hạn thẻ:</strong> {bhytInfo.hanThe ? new Date(bhytInfo.hanThe).toLocaleDateString('vi-VN') : '—'}</div>
                                        <div><strong>Mã đối tượng:</strong> {bhytInfo.maDoiTuong}</div>
                                        <div><strong>Nơi đăng ký:</strong> {bhytInfo.maNoiDK}</div>
                                        <div><strong>Tuyến:</strong> <span style={{ 
                                            padding: '0.25rem 0.5rem',
                                            background: bhytInfo.goiYTuyen === 'Đúng tuyến' ? '#10b981' : '#f59e0b',
                                            color: 'white',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem'
                                        }}>{bhytInfo.goiYTuyen}</span></div>
                                    </div>
                                </div>
                            )}

                            <div className="form-row" style={{ marginTop: '1rem' }}>
                                <div className="form-group">
                                    <label>Mức hưởng (0.0 - 1.0)</label>
                                    <input 
                                        type="number" 
                                        value={formData.mucHuong || 0} 
                                        onChange={e => setFormData({ ...formData, mucHuong: Number(e.target.value) })}
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        placeholder="VD: 0.8 = 80%"
                                    />
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                                        Nhập số thập phân: 0.8 = 80%, 0.9 = 90%, 1.0 = 100%
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Hạn thẻ BHYT</label>
                                    <input 
                                        type="date" 
                                        value={formData.hanTheBHYT?.split('T')[0] || ''} 
                                        onChange={e => setFormData({ ...formData, hanTheBHYT: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="form-row">
                            <div className="form-group"><label>Trạng thái</label><select value={formData.trangThai || ''} onChange={e => setFormData({ ...formData, trangThai: e.target.value })}><option value="Đang điều trị">Đang điều trị</option><option value="Đã xuất viện">Đã xuất viện</option><option value="Chờ nhập viện">Chờ nhập viện</option></select></div>
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
