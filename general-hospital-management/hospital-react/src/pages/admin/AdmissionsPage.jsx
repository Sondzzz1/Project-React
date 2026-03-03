import { useState, useEffect } from 'react';
import { admissionApi } from '../../api';
import { formatDate } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import './AdminPages.css';

export default function AdmissionsPage() {
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { canAdd } = usePermissions();

    useEffect(() => {
        (async () => {
            try { const r = await admissionApi.getAll(); setAdmissions(r?.data || r || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Quản lý Nhập viện</h1><p>Theo dõi bệnh nhân nhập viện, chuyển giường, xuất viện</p></div>
            <div className="page-toolbar">
                <div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm bệnh nhân nhập viện..." /></div>
                {canAdd && <button className="btn-add">+ Nhập viện</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : admissions.length === 0 ?
                    <div className="empty-state"><div className="empty-state-icon">📋</div><p>Chưa có dữ liệu nhập viện</p></div> :
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Bệnh nhân</th><th>Giường</th><th>Khoa</th><th>Ngày nhập</th><th>Trạng thái</th></tr></thead>
                        <tbody>{admissions.map(a => (
                            <tr key={a.id}><td>{a.id}</td><td>{a.tenBenhNhan}</td><td>{a.tenGiuong || a.giuongId}</td><td>{a.tenKhoa || a.khoaId}</td><td>{formatDate(a.ngayNhapVien)}</td>
                                <td><span className="status-badge badge-primary">{a.trangThai}</span></td></tr>
                        ))}</tbody>
                    </table>}
            </div>
        </div>
    );
}
