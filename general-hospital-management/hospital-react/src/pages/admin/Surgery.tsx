import { useState, useEffect } from 'react';
import { surgeryApi, Surgery } from '../../services';
import { formatDate } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function SurgeryPage() {
    const [surgeries, setSurgeries] = useState<Surgery[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { canAdd } = usePermissions();

    useEffect(() => {
        (async () => {
            try { const r = await surgeryApi.getAll(); setSurgeries((r as { data?: Surgery[] })?.data || (r as Surgery[]) || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Quản lý Phẫu thuật</h1><p>Lịch phẫu thuật và theo dõi ca mổ</p></div>
            <div className="page-toolbar">
                <div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm ca phẫu thuật..." /></div>
                {canAdd && <button className="btn-add">+ Thêm lịch mổ</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : surgeries.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">💉</div><p>Chưa có dữ liệu phẫu thuật</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Bệnh nhân</th><th>Bác sĩ</th><th>Loại PT</th><th>Ngày</th><th>Trạng thái</th></tr></thead>
                        <tbody>{surgeries.map(s => (
                            <tr key={s.id}>
                                <td>{s.id}</td><td>{s.tenBenhNhan}</td><td>{s.tenBacSi}</td><td>{s.loaiPhauThuat}</td>
                                <td>{formatDate(s.ngayPhauThuat)}</td>
                                <td><span className="status-badge badge-primary">{s.trangThai}</span></td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
