import { useState } from 'react';
import { reportApi } from '../../api';
import { downloadBlob } from '../../utils/helpers';
import './AdminPages.css';

export default function ReportsPage() {
    const [reportType, setReportType] = useState('bed-capacity');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            const params = { fromDate, toDate };
            const result = reportType === 'bed-capacity'
                ? await reportApi.getBedCapacityReport(params)
                : await reportApi.getTreatmentCostReport(params);
            setReportData(result?.data || result);
        } catch (e) { alert('Tạo báo cáo thất bại'); }
        finally { setLoading(false); }
    };

    const exportFile = async (format) => {
        try {
            const params = { fromDate, toDate };
            const blob = format === 'excel'
                ? await reportApi.exportExcel(reportType, params)
                : await reportApi.exportPdf(reportType, params);
            downloadBlob(blob, `report_${reportType}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
        } catch (e) { alert('Xuất file thất bại'); }
    };

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Báo cáo Thống kê</h1><p>Tạo báo cáo công suất giường, chi phí điều trị</p></div>
            <div className="data-table-wrap" style={{ padding: 24 }}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Loại báo cáo</label>
                        <select value={reportType} onChange={e => setReportType(e.target.value)}>
                            <option value="bed-capacity">Công suất giường</option>
                            <option value="treatment-cost">Chi phí điều trị</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Từ ngày</label>
                        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Đến ngày</label>
                        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                        <button className="btn-add" onClick={generateReport} disabled={loading}>{loading ? 'Đang tạo...' : '📊 Tạo báo cáo'}</button>
                        <button className="btn-action btn-view" style={{ padding: '8px 16px' }} onClick={() => exportFile('pdf')}>📄 PDF</button>
                        <button className="btn-action btn-edit" style={{ padding: '8px 16px' }} onClick={() => exportFile('excel')}>📗 Excel</button>
                    </div>
                </div>
                {reportData && (
                    <div style={{ marginTop: 24 }}>
                        <h3>Kết quả báo cáo</h3>
                        <pre style={{ background: '#f8fafc', padding: 16, borderRadius: 8, fontSize: '0.85rem', overflow: 'auto' }}>
                            {JSON.stringify(reportData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
