import { useState, useEffect } from 'react';
import { billingApi, Invoice, bhytApi } from '../../services';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { downloadBlob } from '../../utils/helpers';
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
    const { canExport, canEdit } = usePermissions();

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const r = await billingApi.getAll();
            setInvoices((r as { data?: Invoice[] })?.data || (r as Invoice[]) || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadInvoices(); }, []);

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
                                                <button
                                                    className="btn-action btn-edit"
                                                    onClick={() => openPaymentModal(inv)}
                                                    style={{ background: '#059669' }}
                                                >
                                                    💳 Thanh toán
                                                </button>
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
                        <div style={{ marginBottom: '1rem' }}>
                            <button
                                type="button"
                                className="btn-save"
                                onClick={openBHYTCalculator}
                                style={{ width: '100%', background: '#0284c7' }}
                            >
                                🧮 Tính toán chi phí BHYT
                            </button>
                        </div>

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

            {/* BHYT Calculator Modal */}
            {showBHYTModal && selectedInvoice && (
                <div className="modal-overlay" onClick={() => setShowBHYTModal(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <h2>🧮 Tính toán chi phí BHYT</h2>
                        
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
                                Bệnh nhân nhập viện trong tình trạng cấp cứu
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
                                Bệnh nhân được chuyển từ bệnh viện khác
                            </div>
                        </div>

                        <div style={{ 
                            background: '#fef3c7', 
                            padding: '0.75rem', 
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            color: '#92400e',
                            marginTop: '1rem'
                        }}>
                            💡 <strong>Lưu ý:</strong> Tỷ lệ hưởng BHYT phụ thuộc vào tuyến khám, trường hợp cấp cứu và giấy chuyển viện.
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
