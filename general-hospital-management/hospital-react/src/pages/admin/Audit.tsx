import { useState, useEffect } from 'react';
import { auditApi, AuditLog } from '../../services';
import { formatDate } from '../../utils/formatters';
import '../../assets/css/admin/admin.css';

export default function AuditPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try { const r = await auditApi.getLogs({ page: 1, pageSize: 50 }); setLogs((r as { data?: AuditLog[] })?.data || (r as AuditLog[]) || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Nhật ký Hệ thống</h1><p>Theo dõi hoạt động và thay đổi trong hệ thống</p></div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : logs.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">🔍</div><p>Chưa có nhật ký</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>Thời gian</th><th>Người dùng</th><th>Hành động</th><th>Đối tượng</th><th>Chi tiết</th></tr></thead>
                        <tbody>{logs.map((log, i) => (
                            <tr key={i}>
                                <td>{formatDate(log.timestamp, 'full')}</td><td>{log.userName}</td>
                                <td><span className="status-badge badge-info">{log.action}</span></td>
                                <td>{log.entity}</td><td>{log.details}</td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
