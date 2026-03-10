import { useState, useEffect } from 'react';
import { billingApi, Invoice } from '../../services';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { downloadBlob } from '../../utils/helpers';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { canExport } = usePermissions();

    useEffect(() => {
        (async () => {
            try { const r = await billingApi.getAll(); setInvoices((r as { data?: Invoice[] })?.data || (r as Invoice[]) || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    const handleExportPdf = async (id: number) => {
        try { const blob = await billingApi.exportPdf(id); downloadBlob(blob, `hoadon_${id}.pdf`); }
        catch { alert('Xuất PDF thất bại'); }
    };

    const handleExportExcel = async (id: number) => {
        try { const blob = await billingApi.exportExcel(id); downloadBlob(blob, `hoadon_${id}.xlsx`); }
        catch { alert('Xuất Excel thất bại'); }
    };

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Quản lý Hóa đơn</h1><p>Quản lý hóa đơn viện phí</p></div>
            <div className="page-toolbar"><div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm hóa đơn..." /></div></div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : invoices.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">💰</div><p>Chưa có hóa đơn</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Bệnh nhân</th><th>Tổng tiền</th><th>BHYT chi trả</th><th>Còn phải trả</th><th>Ngày tạo</th><th>Trạng thái</th><th>Xuất</th></tr></thead>
                        <tbody>{invoices.map(inv => (
                            <tr key={inv.id}>
                                <td>{inv.id}</td><td>{inv.tenBenhNhan}</td><td>{formatCurrency(inv.tongTien)}</td><td>{formatCurrency(inv.bhytChiTra)}</td>
                                <td>{formatCurrency(inv.conPhaiTra)}</td><td>{formatDate(inv.ngayTao)}</td>
                                <td><span className={`status-badge badge-${inv.trangThai === 'Đã thanh toán' ? 'success' : 'warning'}`}>{inv.trangThai}</span></td>
                                <td><div className="action-btns">{canExport && (<>
                                    <button className="btn-action btn-view" onClick={() => handleExportPdf(inv.id)}>PDF</button>
                                    <button className="btn-action btn-edit" onClick={() => handleExportExcel(inv.id)}>Excel</button>
                                </>)}</div></td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
