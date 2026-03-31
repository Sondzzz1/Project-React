import { useState, useEffect, useCallback } from 'react';
import { admissionApi, Admission, bedApi, Bed } from '../../services';
import { formatDate } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import Pagination from '../../components/common/Pagination';
import '../../assets/css/admin/admin.css';

export default function AdmissionPage() {
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [availableBeds, setAvailableBeds] = useState<Bed[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
    const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);
    const [newBedId, setNewBedId] = useState<string>('');
    const [transferReason, setTransferReason] = useState<string>('');
    const [transferring, setTransferring] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    
    const { canAdd, canEdit } = usePermissions();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [admissionsRes, bedsRes] = await Promise.allSettled([
                admissionApi.getAll(),
                bedApi.getAll()
            ]);
            
            console.log('Admissions Response:', admissionsRes);
            console.log('Beds Response:', bedsRes);
            
            // Đảm bảo admissions luôn là array
            if (admissionsRes.status === 'fulfilled') {
                const data = admissionsRes.value;
                console.log('Admissions data:', data);
                setAdmissions(Array.isArray(data) ? data : []);
            } else {
                console.error('Admissions error:', admissionsRes.reason);
                setAdmissions([]);
            }
            
            // Lọc giường trống từ tất cả giường
            if (bedsRes.status === 'fulfilled') {
                const data = bedsRes.value;
                const allBeds = (data as { data?: Bed[] })?.data || (Array.isArray(data) ? data : []);
                console.log('All beds:', allBeds);
                const available = allBeds.filter(bed => bed.trangThai === 'Trống');
                console.log('Available beds:', available);
                setAvailableBeds(available);
            } else {
                console.error('Beds error:', bedsRes.reason);
                setAvailableBeds([]);
            }
        } catch (e) {
            console.error('Load data error:', e);
            setAdmissions([]);
            setAvailableBeds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    // Đảm bảo admissions là array trước khi filter
    const filtered: Admission[] = Array.isArray(admissions) 
        ? admissions.filter(a => !search || (a.tenBenhNhan || '').toLowerCase().includes(search.toLowerCase()))
        : [];

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => { setCurrentPage(1); }, [search]);

    const openTransferModal = (admission: Admission) => {
        setSelectedAdmission(admission);
        setNewBedId('');
        setTransferReason('');
        setError('');
        setShowTransferModal(true);
    };

    const handleTransfer = async () => {
        if (!selectedAdmission || !newBedId || !transferReason) {
            setError('Vui lòng chọn giường mới và nhập lý do chuyển');
            return;
        }

        setTransferring(true);
        try {
            await admissionApi.transferBed(selectedAdmission.id, newBedId, transferReason);
            setShowTransferModal(false);
            loadData();
            alert('Chuyển giường thành công!');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || 'Chuyển giường thất bại');
        } finally {
            setTransferring(false);
        }
    };

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
                        placeholder="🔍 Tìm bệnh nhân nhập viện..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                {canAdd && <button className="btn-add">+ Nhập viện</button>}
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
                                    <th>ID</th>
                                    <th>Bệnh nhân</th>
                                    <th>Giường</th>
                                    <th>Khoa</th>
                                    <th>Ngày nhập</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.id.substring(0, 8)}...</td>
                                        <td><strong>{a.tenBenhNhan}</strong></td>
                                        <td>{a.tenGiuong || a.giuongId}</td>
                                        <td>{a.tenKhoa || a.khoaId}</td>
                                        <td>{formatDate(a.ngayNhap)}</td>
                                        <td>
                                            <span className="status-badge badge-primary">
                                                {a.trangThai}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-btns">
                                                {canEdit && a.trangThai === 'Đang điều trị' && (
                                                    <button 
                                                        className="btn-action btn-edit"
                                                        onClick={() => openTransferModal(a)}
                                                    >
                                                        🔄 Chuyển giường
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

            {showTransferModal && selectedAdmission && (
                <div className="modal-overlay" onClick={() => setShowTransferModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Chuyển giường bệnh nhân</h2>
                        {error && <div className="login-error">{error}</div>}
                        
                        <div className="form-group">
                            <label>Bệnh nhân</label>
                            <input value={selectedAdmission.tenBenhNhan} disabled />
                        </div>

                        <div className="form-group">
                            <label>Giường hiện tại</label>
                            <input value={selectedAdmission.tenGiuong || selectedAdmission.giuongId} disabled />
                        </div>

                        <div className="form-group">
                            <label>Giường mới *</label>
                            <select 
                                value={newBedId} 
                                onChange={e => setNewBedId(e.target.value)}
                            >
                                <option value="">-- Chọn giường trống --</option>
                                {availableBeds.map(bed => (
                                    <option key={bed.id} value={bed.id}>
                                        {bed.maGiuong} - {bed.tenGiuong} ({bed.loaiGiuong})
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
                            <button className="btn-cancel" onClick={() => setShowTransferModal(false)}>
                                Hủy
                            </button>
                            <button 
                                className="btn-save" 
                                onClick={handleTransfer} 
                                disabled={transferring}
                            >
                                {transferring ? 'Đang chuyển...' : '🔄 Xác nhận chuyển'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
