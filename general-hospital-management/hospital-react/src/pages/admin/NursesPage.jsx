import { useState, useEffect } from 'react';
import { nurseApi } from '../../api';
import { usePermissions } from '../../hooks/usePermissions';
import './AdminPages.css';

export default function NursesPage() {
    const [nurses, setNurses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    useEffect(() => {
        (async () => {
            try { const r = await nurseApi.getAll(); setNurses(r?.data || r || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    const filtered = nurses.filter(n => !search || (n.hoTen || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Quản lý Y tá</h1><p>Danh sách y tá trong hệ thống</p></div>
            <div className="page-toolbar">
                <div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm y tá..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                {canAdd && <button className="btn-add">+ Thêm y tá</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : filtered.length === 0 ?
                    <div className="empty-state"><div className="empty-state-icon">👩‍⚕️</div><p>Chưa có dữ liệu</p></div> :
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Họ tên</th><th>Khoa</th><th>SĐT</th><th>Thao tác</th></tr></thead>
                        <tbody>{filtered.map(n => (
                            <tr key={n.id}><td>{n.id}</td><td><strong>{n.hoTen}</strong></td><td>{n.tenKhoa || n.khoaId}</td><td>{n.soDienThoai || '—'}</td>
                                <td><div className="action-btns">{canEdit && <button className="btn-action btn-edit">Sửa</button>}{canDelete && <button className="btn-action btn-delete">Xóa</button>}</div></td></tr>
                        ))}</tbody>
                    </table>}
            </div>
        </div>
    );
}
