import { useState, useEffect, useCallback } from 'react';
import { billingApi, Invoice, bhytApi } from '../../services';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { downloadBlob, extractArrayData } from '../../utils/helpers';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>('Tiền mặt');
    const [paying, setPaying] = useState<boolean>(false);
    const [showBHYTModal, setShowBHYTModal] = useState<boolean>(false);
    const [bhytCalculating, setBhytCalculating] = useState<boolean>(false);
    const [bhytResult, setBhytResult] = useState<any>(null);
    const [bhytParams, setBhytParams] = useState({
        dungTuyen: true,
        laCapCuu: false,
        coGiayChuyenVien: false
    });
    
    // Create Invoice state
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [nhapVienId, setNhapVienId] = useState<string>('');
    const [previewData, setPreviewData] = useState<any>(null);
    const [creating, setCreating] = useState<boolean>(false);
    
    const { canExport, canEdit, canDelete } = usePermissions();

    const loadInvoices = useCallback(async () => {
        try {
            setLoading(true);
            const r = await billingApi.getAll();
            setInvoices(extractArrayData<Invoice>(r));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadInvoices(); }, [loadInvoices]);

    const filtered = invoices.filter(inv =>
        !search ||
        (inv.tenBenhNhan || '').toLowerCase().includes(search.toLowerCase()) ||
        inv.id.toLowerCase().includes(search.toLowerCase())
    );

    const handleExportPdf = async (id: string) => {
        try {
            const blob = await billingApi.exportPdf(id);
            downloadBlob(blob, `hoadon_${id.substring(0, 8)}.pdf`);
        } catch {
            alert('Xuất PDF thất bại');
        }
    };

    const handleExportExcel = async (id: string) => {
        try {
            const blob = await billingApi.exportExcel(id);
            downloadBlob(blob, `hoadon_${id.substring(0, 8)}.xlsx`);
        } catch {
            alert('Xuất Excel thất bại');
        }
    };

    const openPaymentModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setPaymentMethod('Tiền mặt');
        setBhytResult(null);
        setBhytParams({
            dungTuyen: true,
            laCapCuu: false,
            coGiayChuyenVien: false
        });
        setShowPaymentModal(true);
    };

    const openBHYTCalculator = () => {
        setShowBHYTModal(true);
    };

    const handleCalculateBHYT = async () => {
        if (!selectedInvoice) return;
        
        setBhytCalculating(true);
        try {
            const result = await bhytApi.tinhToanChiPhi({
                idBenhNhan: selectedInvoice.benhNhanId || '',
                tongTien: selectedInvoice.tongTien,
                dungTuyen: bhytParams.dungTuyen,
                laCapCuu: bhytParams.laCapCuu,
                coGiayChuyenVien: bhytParams.coGiayChuyenVien,
                ngayHoaDon: new Date().toISOString()
            });
            setBhytResult(result);
            setShowBHYTModal(false);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không thể tính toán BHYT');
        } finally {
            setBhytCalculating(false);
        }
    };

    const handlePayment = async () => {
        if (!selectedInvoice) return;
        setPaying(true);
        try {
            await billingApi.pay(selectedInvoice.id, { phuongThucThanhToan: paymentMethod });
            setShowPaymentModal(false);
            loadInvoices();
            alert('Thanh toán thành công!');
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { message?: string } } };
            alert(axiosErr.response?.data?.message || 'Thanh toán thất bại');
        } finally {
            setPaying(false);
        }
    };

    const handlePreview = async () => {
        if (!nhapVienId) return alert('Vui lòng nhập ID Nhập viện');
        try {
            const data = await billingApi.getPreview(nhapVienId);
            setPreviewData(data);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Không tìm thấy thông tin để gợi ý');
            setPreviewData(null);
        }
    };

    const handleCreateInvoice = async () => {
        if (!previewData) return;
        setCreating(true);
        try {
            await billingApi.create({
                nhapVienId: previewData.nhapVienId || nhapVienId,
                benhNhanId: previewData.benhNhanId,
                tongTien: previewData.tongTienGoiY || previewData.tongTien || 0,
                baoHiemChiTra: previewData.baoHiemChiTraGoiY || previewData.baoHiemChiTra || 0,
                ghiChu: 'Tạo tự động từ gợi ý nhập viện'
            });
            alert('Tạo hóa đơn thành công');
            setShowCreateModal(false);
            setNhapVienId('');
            setPreviewData(null);
            loadInvoices();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Tạo hóa đơn thất bại');
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;
        try {
            await billingApi.delete(id);
            alert('Xóa thành công');
            loadInvoices();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Xóa thất bại');
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Quản lý Hóa đơn</h1>
                <p>Quản lý hóa đơn viện phí</p>
            </div>
            <div className="page-toolbar">
                <div className="toolbar-left">
                    <input
                        className="search-input"
                        placeholder="🔍 Tìm hóa đơn..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="toolbar-right">
                    {canEdit && (
                        <button className="btn-add" onClick={() => setShowCreateModal(true)}>
                            + Tạo hóa đơn
                        </button>
                    )}
                </div>
            </div>
            <div className="data-table-wrap">
                {loading ? (
                    <div className="loading-center">Đang tải...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">💰</div>
                        <p>Chưa có hóa đơn</p>
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Bệnh nhân</th>
                                <th>Tổng tiền</th>
                                <th>BHYT chi trả</th>
                                <th>Còn phải trả</th>
                                <th>Ngày tạo</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(inv => (
                                <tr key={inv.id}>
                                    <td>{inv.id.substring(0, 8)}...</td>
                                    <td><strong>{inv.tenBenhNhan}</strong></td>
                                    <td>{formatCurrency(inv.tongTien)}</td>
                                    <td>{formatCurrency(inv.baoHiemChiTra)}</td>
                                    <td><strong>{formatCurrency(inv.benhNhanThanhToan)}</strong></td>
                                    <td>{formatDate(inv.ngay || '')}</td>
                                    <td>
                                        <span className={`status-badge badge-${inv.trangThai === 'Đã thanh toán' ? 'success' : 'warning'}`}>
                                            {inv.trangThai}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            {inv.trangThai === 'Chưa thanh toán' && canEdit && (
                                                <>
                                                    <button
                                                        className="btn-action btn-edit"
                                                        onClick={() => openPaymentModal(inv)}
                                                        style={{ background: '#059669' }}
                                                    >
                                                        💳 Thanh toán
                                                    </button>
                                                    {(canDelete || true) && (
                                                        <button
                                                            className="btn-action btn-delete"
                                                            onClick={() => handleDelete(inv.id)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            {canExport && (
                                                <>
                                                    <button
                                                        className="btn-action btn-view"
                                                        onClick={() => handleExportPdf(inv.id)}
                                                    >
                                                        PDF
                                                    </button>
                                                    <button
                                                        className="btn-action btn-edit"
                                                        onClick={() => handleExportExcel(inv.id)}
                                                    >
                                                        Excel
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showPaymentModal && selectedInvoice && (
                <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Thanh toán hóa đơn</h2>
                        
                        <div className="form-group">
                            <label>Bệnh nhân</label>
                            <input value={selectedInvoice.tenBenhNhan} disabled />
                        </div>

                        {/* BHYT Calculator Button */}
                        {selectedInvoice.benhNhanId && (
                            <div style={{ marginBottom: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn-save"
                                    onClick={openBHYTCalculator}
                                    style={{ width: '100%', background: '#0284c7' }}
                                >
                                    🧮 Tính toán chi phí BHYT
                                </button>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'center' }}>
                                    ⚠️ Chỉ áp dụng nếu bệnh nhân có thẻ BHYT hợp lệ
                                </div>
                            </div>
                        )}

                        {bhytResult && (
                            <div style={{ 
                                background: '#d1fae5', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                marginBottom: '1rem',
                                border: '1px solid #6ee7b7'
                            }}>
                                <div style={{ color: '#065f46', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                                    ✅ Kết quả tính toán BHYT
                                </div>
                                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.95rem', color: '#047857' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Tổng tiền:</span>
                                        <strong>{formatCurrency(bhytResult.tongTien)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Tỷ lệ hưởng:</span>
                                        <strong>{bhytResult.tyLeHuong}%</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>BHYT chi trả:</span>
                                        <strong style={{ color: '#059669' }}>{formatCurrency(bhytResult.baoHiemChiTra)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '2px solid #6ee7b7' }}>
                                        <span>Bệnh nhân phải trả:</span>
                                        <strong style={{ fontSize: '1.1rem', color: '#dc2626' }}>{formatCurrency(bhytResult.benhNhanPhaiTra)}</strong>
                                    </div>
                                    {bhytResult.dienGiai && (
                                        <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'white', borderRadius: '4px', fontSize: '0.85rem' }}>
                                            📝 {bhytResult.dienGiai}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label>Tổng tiền</label>
                                <input value={formatCurrency(bhytResult?.tongTien || selectedInvoice.tongTien)} disabled />
                            </div>
                            <div className="form-group">
                                <label>BHYT chi trả</label>
                                <input value={formatCurrency(bhytResult?.baoHiemChiTra || selectedInvoice.baoHiemChiTra)} disabled />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Số tiền cần thanh toán</label>
                            <input
                                value={formatCurrency(bhytResult?.benhNhanPhaiTra || selectedInvoice.benhNhanThanhToan)}
                                disabled
                                style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#059669' }}
                            />
                        </div>

                        <div className="form-group">
                            <label>Phương thức thanh toán</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Chuyển khoản">Chuyển khoản</option>
                                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                                <option value="Ví điện tử">Ví điện tử</option>
                            </select>
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowPaymentModal(false)}>
                                Hủy
                            </button>
                            <button
                                className="btn-save"
                                onClick={handlePayment}
                                disabled={paying}
                                style={{ background: '#059669' }}
                            >
                                {paying ? 'Đang xử lý...' : '💳 Xác nhận thanh toán'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Invoice Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <h2>Tạo hóa đơn mới</h2>
                        
                        <div className="form-group">
                            <label>ID Nhập viện *</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                    value={nhapVienId} 
                                    onChange={e => setNhapVienId(e.target.value)} 
                                    placeholder="Nhập ID nhập viện..."
                                    style={{ flex: 1 }}
                                />
                                <button className="btn-save" onClick={handlePreview} style={{ background: '#0284c7', width: 'auto', padding: '0 1rem' }}>
                                    Xem trước
                                </button>
                            </div>
                        </div>

                        {previewData && (
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                                <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#0f172a' }}>Chi tiết dự kiến</h3>
                                <div style={{ display: 'grid', gap: '8px', fontSize: '0.95rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Bệnh nhân:</span> <strong>{previewData.tenBenhNhan}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Tổng chi phí:</span> <strong>{formatCurrency(previewData.tongTienGoiY ?? previewData.tongTien)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>BHYT chi trả:</span> <strong style={{ color: '#059669' }}>{formatCurrency(previewData.baoHiemChiTraGoiY ?? previewData.baoHiemChiTra)}</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #cbd5e1' }}>
                                        <span>Bệnh nhân trả:</span> <strong style={{ color: '#dc2626', fontSize: '1.1rem' }}>{formatCurrency(previewData.benhNhanPhaiTraGoiY ?? previewData.benhNhanThanhToan)}</strong>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowCreateModal(false)}>Hủy</button>
                            <button 
                                className="btn-save" 
                                onClick={handleCreateInvoice} 
                                disabled={!previewData || creating}
                            >
                                {creating ? 'Đang tạo...' : 'Tạo hóa đơn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* BHYT Calculator Modal */}
            {showBHYTModal && selectedInvoice && (
                <div className="modal-overlay" onClick={() => setShowBHYTModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h2>🧮 Tính toán chi phí BHYT</h2>
                        
                        <div style={{ 
                            background: '#fef3c7', 
                            padding: '1rem', 
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            border: '1px solid #fbbf24'
                        }}>
                            <div style={{ color: '#92400e', fontSize: '0.9rem', lineHeight: '1.6' }}>
                                <strong>⚠️ Lưu ý:</strong> BHYT chỉ chi trả khi:
                                <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: 0 }}>
                                    <li>Thẻ BHYT còn hạn</li>
                                    <li>Dịch vụ thuộc phạm vi BHYT</li>
                                    <li>Thuốc trong danh mục BHYT</li>
                                    <li>Không vượt hạn mức chi trả</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ 
                            background: '#f0f9ff', 
                            padding: '1rem', 
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <div style={{ marginBottom: '0.5rem' }}>
                                <strong>Bệnh nhân:</strong> {selectedInvoice.tenBenhNhan}
                            </div>
                            <div>
                                <strong>Tổng tiền:</strong> {formatCurrency(selectedInvoice.tongTien)}
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={bhytParams.dungTuyen}
                                    onChange={e => setBhytParams({ ...bhytParams, dungTuyen: e.target.checked })}
                                    style={{ width: 'auto' }}
                                />
                                <span>Đúng tuyến</span>
                            </label>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                                Bệnh nhân khám đúng tuyến theo nơi đăng ký ban đầu
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={bhytParams.laCapCuu}
                                    onChange={e => setBhytParams({ ...bhytParams, laCapCuu: e.target.checked })}
                                    style={{ width: 'auto' }}
                                />
                                <span>Trường hợp cấp cứu</span>
                            </label>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                                Bệnh nhân nhập viện trong tình trạng cấp cứu (được hưởng 100%)
                            </div>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <input
                                    type="checkbox"
                                    checked={bhytParams.coGiayChuyenVien}
                                    onChange={e => setBhytParams({ ...bhytParams, coGiayChuyenVien: e.target.checked })}
                                    style={{ width: 'auto' }}
                                />
                                <span>Có giấy chuyển viện</span>
                            </label>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', marginLeft: '1.5rem' }}>
                                Bệnh nhân được chuyển từ bệnh viện khác (được hưởng 100%)
                            </div>
                        </div>

                        <div style={{ 
                            background: '#fee2e2', 
                            padding: '0.75rem', 
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            color: '#991b1b',
                            marginTop: '1rem'
                        }}>
                            💡 <strong>Quan trọng:</strong> Nếu không thuộc các trường hợp trên, BHYT chỉ chi trả 50% (trái tuyến).
                        </div>

                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setShowBHYTModal(false)}>
                                Hủy
                            </button>
                            <button
                                className="btn-save"
                                onClick={handleCalculateBHYT}
                                disabled={bhytCalculating}
                                style={{ background: '#0284c7' }}
                            >
                                {bhytCalculating ? '⏳ Đang tính...' : '🧮 Tính toán'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
