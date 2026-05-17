import { useState } from 'react';
import { reportApi, ReportParams } from '../../services';
import { downloadBlob } from '../../utils/helpers';
import { formatCurrency } from '../../utils/formatters';
import StatCard from '../../components/common/StatCard';
import '../../assets/css/admin/admin.css';

export default function ReportsPage() {
    const [reportType, setReportType] = useState<string>('bed-capacity');
    const [fromDate, setFromDate] = useState<string>('');
    const [toDate, setToDate] = useState<string>('');
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const params: ReportParams = { fromDate, toDate };
            const result = reportType === 'bed-capacity'
                ? await reportApi.getBedCapacityReport(params)
                : await reportApi.getTreatmentCostReport(params);
            setReportData(result);
        } catch { alert('Tạo báo cáo thất bại'); }
        finally { setLoading(false); }
    };

    const exportFile = async (format: 'excel' | 'pdf') => {
        try {
            const params: ReportParams = { fromDate, toDate };
            const blob = format === 'excel'
                ? await reportApi.exportExcel(reportType, params)
                : await reportApi.exportPdf(reportType, params);
            downloadBlob(blob, `report_${reportType}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        } catch { alert('Xuất file thất bại'); }
    };

    const renderBedCapacityReport = () => {
        if (!reportData || !reportData.summary) return null;
        
        const summary = reportData.summary;
        const stats = reportData.departmentStats || [];

        return (
            <div className="report-results" style={{ marginTop: 32 }}>
                <h3 style={{ marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                    📊 Kết quả báo cáo: Công suất giường bệnh
                </h3>
                
                <div className="dash-stats-grid" style={{ marginBottom: 24 }}>
                    <StatCard icon="🛏️" label="Tổng giường" value={summary.tongGiuongToanVien || 0} color="#2196c8" />
                    <StatCard icon="🛌" label="Đang sử dụng" value={summary.tongGiuongDangSuDung || 0} color="#059669" />
                    <StatCard icon="🚪" label="Giường trống" value={summary.tongGiuongTrong || 0} color="#d97706" />
                    <StatCard icon="📈" label="Tỷ lệ sử dụng" value={`${(summary.tyLeSuDungTrungBinh || 0).toFixed(1)}%`} color="#7c3aed" />
                </div>

                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Khoa phòng</th>
                                <th style={{ textAlign: 'center' }}>Tổng giường</th>
                                <th style={{ textAlign: 'center' }}>Đang sử dụng</th>
                                <th style={{ textAlign: 'center' }}>Giường trống</th>
                                <th style={{ textAlign: 'center' }}>Tỷ lệ sử dụng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.length > 0 ? stats.map((dept: any) => (
                                <tr key={dept.khoaId}>
                                    <td><strong>{dept.tenKhoa}</strong></td>
                                    <td style={{ textAlign: 'center' }}>{dept.tongGiuong}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="status-badge badge-primary">{dept.giuongDangSuDung}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="status-badge badge-success">{dept.giuongTrong}</span>
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        <span className="status-badge badge-warning">{dept.tyLeSuDung.toFixed(1)}%</span>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderTreatmentCostReport = () => {
        if (!reportData || !reportData.summary) return null;
        
        const summary = reportData.summary;
        const statsByDept = reportData.chiPhiTheoKhoa || [];
        const statsByService = reportData.chiPhiTheoLoaiDichVu || [];

        return (
            <div className="report-results" style={{ marginTop: 32 }}>
                <h3 style={{ marginBottom: 16, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
                    💰 Kết quả báo cáo: Chi phí điều trị
                </h3>
                
                <div className="dash-stats-grid" style={{ marginBottom: 24 }}>
                    <StatCard icon="💵" label="Tổng chi phí toàn viện" value={formatCurrency(summary.tongChiPhiToanBo)} color="#2196c8" />
                    <StatCard icon="🏥" label="Số lượt điều trị" value={summary.tongSoLuotDieuTri || 0} color="#059669" />
                    <StatCard icon="📊" label="Trung bình/lượt" value={formatCurrency(summary.chiPhiTrungBinhMoiLuot)} color="#d97706" />
                    <StatCard icon="🔪" label="Tổng chi phí phẫu thuật" value={formatCurrency(summary.tongChiPhiPhauThuat)} color="#ef4444" />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <div className="data-table-wrap">
                        <h4 style={{ marginBottom: '12px' }}>Chi phí theo loại dịch vụ</h4>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Loại dịch vụ</th>
                                    <th style={{ textAlign: 'center' }}>Số lượng</th>
                                    <th style={{ textAlign: 'right' }}>Tổng chi phí</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statsByService.length > 0 ? statsByService.map((srv: any, idx: number) => (
                                    <tr key={idx}>
                                        <td><strong>{srv.loaiDichVu}</strong></td>
                                        <td style={{ textAlign: 'center' }}>{srv.soLuong}</td>
                                        <td style={{ textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>{formatCurrency(srv.tongChiPhi)}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={3} style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="data-table-wrap">
                    <h4 style={{ marginBottom: '12px' }}>Chi phí theo Khoa phòng</h4>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Khoa phòng</th>
                                <th style={{ textAlign: 'center' }}>Số lượt ĐT</th>
                                <th style={{ textAlign: 'right' }}>CP Dịch vụ</th>
                                <th style={{ textAlign: 'right' }}>CP Phẫu thuật</th>
                                <th style={{ textAlign: 'right' }}>CP Xét nghiệm</th>
                                <th style={{ textAlign: 'right' }}>Tổng cộng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statsByDept.length > 0 ? statsByDept.map((dept: any) => (
                                <tr key={dept.khoaId}>
                                    <td><strong>{dept.tenKhoa}</strong></td>
                                    <td style={{ textAlign: 'center' }}>{dept.soLuotDieuTri}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(dept.tongChiPhiDichVu)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(dept.tongChiPhiPhauThuat)}</td>
                                    <td style={{ textAlign: 'right' }}>{formatCurrency(dept.tongChiPhiXetNghiem)}</td>
                                    <td style={{ textAlign: 'right', color: '#dc2626', fontWeight: 'bold' }}>{formatCurrency(dept.tongCong)}</td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} style={{ textAlign: 'center' }}>Không có dữ liệu</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderDefaultReport = () => (
        <div style={{ marginTop: 24 }}>
            <h3>Kết quả báo cáo</h3>
            <pre style={{ background: '#f8fafc', padding: 16, borderRadius: 8, fontSize: '0.85rem', overflow: 'auto' }}>
                {JSON.stringify(reportData, null, 2)}
            </pre>
        </div>
    );

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Báo cáo Thống kê</h1><p>Tạo báo cáo công suất giường, chi phí điều trị</p></div>
            <div className="data-table-wrap" style={{ padding: 24 }}>
                <div className="form-row">
                    <div className="form-group"><label>Loại báo cáo</label>
                        <select value={reportType} onChange={e => { setReportType(e.target.value); setReportData(null); }}>
                            <option value="bed-capacity">Công suất giường</option><option value="treatment-cost">Chi phí điều trị</option>
                        </select>
                    </div>
                    <div className="form-group"><label>Từ ngày</label><input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} /></div>
                </div>
                <div className="form-row">
                    <div className="form-group"><label>Đến ngày</label><input type="date" value={toDate} onChange={e => setToDate(e.target.value)} /></div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                        <button className="btn-add" onClick={generateReport} disabled={loading}>{loading ? 'Đang tạo...' : '📊 Tạo báo cáo'}</button>
                        <button className="btn-action btn-view" style={{ padding: '8px 16px' }} onClick={() => exportFile('pdf')}>📄 PDF</button>
                        <button className="btn-action btn-edit" style={{ padding: '8px 16px' }} onClick={() => exportFile('excel')}>📗 Excel</button>
                    </div>
                </div>
                {reportData && (
                    reportType === 'bed-capacity' && reportData.summary ? renderBedCapacityReport() :
                    reportType === 'treatment-cost' && reportData.summary ? renderTreatmentCostReport() :
                    renderDefaultReport()
                )}
            </div>
        </div>
    );
}
