import { useState, useEffect, useCallback } from 'react';
import { medicalRecordApi, MedicalRecord } from '../../services';
import { formatDate } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import Pagination from '../../components/common/Pagination';
import '../../assets/css/admin/admin.css';

export default function MedicalRecordPage() {
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
    const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    
    const { canAdd } = usePermissions();

    const loadRecords = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📋 Loading medical records...');
            const r = await medicalRecordApi.getAll();
            console.log('📋 Medical records response:', r);
            console.log('📋 Records data:', r.data);
            console.log('📋 Is data array?', Array.isArray(r.data));
            
            const recordsData = Array.isArray(r.data) ? r.data : [];
            console.log('📋 Final records:', recordsData);
            setRecords(recordsData);
        } catch (e) {
            console.error('❌ Error loading medical records:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadRecords(); }, [loadRecords]);

    const filtered: MedicalRecord[] = records.filter(r =>
        !search || 
        (r.tenBenhNhan || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.chanDoan || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    useEffect(() => { setCurrentPage(1); }, [search]);

    const openDetailModal = (record: MedicalRecord) => {
        setSelectedRecord(record);
        setShowDetailModal(true);
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Hồ sơ Bệnh án</h1>
                <p>Quản lý hồ sơ bệnh án điện tử</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input 
                        className="search-input" 
                        placeholder="🔍 Tìm hồ sơ..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                    />
                </div>
                {canAdd && <button className="btn-add">+ Tạo hồ sơ</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📁</div>
                        <p>Chưa có hồ sơ bệnh án</p>
                    </div>
                ) : (
                    <>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Bệnh nhân</th>
                                    <th>Chẩn đoán</th>
                                    <th>Bác sĩ</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map(r => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td><strong>{r.tenBenhNhan}</strong></td>
                                        <td>{r.chanDoan}</td>
                                        <td>{r.tenBacSi}</td>
                                        <td>{formatDate(r.ngayTao)}</td>
                                        <td>
                                            <div className="action-btns">
                                                <button 
                                                    className="btn-action btn-view"
                                                    onClick={() => openDetailModal(r)}
                                                >
                                                    👁️ Xem chi tiết
                                                </button>
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

            {showDetailModal && selectedRecord && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-box" style={{ maxWidth: '700px' }} onClick={e => e.stopPropagation()}>
                        <h2>Chi tiết Hồ sơ Bệnh án</h2>
                        
                        <div style={{ 
                            display: 'grid', 
                            gap: '1.5rem',
                            padding: '1rem 0'
                        }}>
                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                borderLeft: '4px solid #2196c8'
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#2196c8' }}>
                                    Thông tin bệnh nhân
                                </h3>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <div><strong>Họ tên:</strong> {selectedRecord.tenBenhNhan}</div>
                                    <div><strong>Mã bệnh nhân:</strong> {selectedRecord.benhNhanId || '—'}</div>
                                </div>
                            </div>

                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                borderLeft: '4px solid #059669'
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#059669' }}>
                                    Chẩn đoán
                                </h3>
                                <div style={{ 
                                    padding: '0.75rem', 
                                    background: 'white', 
                                    borderRadius: '6px',
                                    fontSize: '1rem',
                                    lineHeight: '1.6'
                                }}>
                                    {selectedRecord.chanDoan}
                                </div>
                            </div>

                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                borderLeft: '4px solid #7c3aed'
                            }}>
                                <h3 style={{ margin: '0 0 0.5rem 0', color: '#7c3aed' }}>
                                    Bác sĩ điều trị
                                </h3>
                                <div style={{ display: 'grid', gap: '0.5rem' }}>
                                    <div><strong>Họ tên:</strong> {selectedRecord.tenBacSi}</div>
                                    <div><strong>Mã bác sĩ:</strong> {selectedRecord.bacSiId || '—'}</div>
                                </div>
                            </div>

                            {selectedRecord.ghiChu && (
                                <div style={{ 
                                    background: '#fef3c7', 
                                    padding: '1rem', 
                                    borderRadius: '8px',
                                    borderLeft: '4px solid #d97706'
                                }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#d97706' }}>
                                        Ghi chú
                                    </h3>
                                    <div style={{ 
                                        padding: '0.75rem', 
                                        background: 'white', 
                                        borderRadius: '6px',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6'
                                    }}>
                                        {selectedRecord.ghiChu}
                                    </div>
                                </div>
                            )}

                            <div style={{ 
                                background: '#f1f5f9', 
                                padding: '1rem', 
                                borderRadius: '8px'
                            }}>
                                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
                                    <div><strong>Ngày tạo:</strong> {formatDate(selectedRecord.ngayTao, 'full')}</div>
                                    <div><strong>Mã hồ sơ:</strong> {selectedRecord.id}</div>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowDetailModal(false)}>
                                Đóng
                            </button>
                            <button className="btn-save" style={{ background: '#2196c8' }}>
                                📄 In hồ sơ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
