import { useState, useEffect } from 'react';
import { nurseApi, Nurse } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function NursePage() {
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    useEffect(() => {
        (async () => {
            try { const r = await nurseApi.getAll(); setNurses((r as { data?: Nurse[] })?.data || (r as Nurse[]) || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    const filtered: Nurse[] = nurses.filter(n => !search || (n.hoTen || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Quản lý Y tá</h1><p>Danh sách y tá trong hệ thống</p></div>
            <div className="page-toolbar">
                <div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm y tá..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                {canAdd && <button className="btn-add">+ Thêm y tá</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">👩‍⚕️</div><p>Chưa có dữ liệu</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Họ tên</th><th>Khoa</th><th>SĐT</th><th>Thao tác</th></tr></thead>
                        <tbody>{filtered.map(n => (
                            <tr key={n.id}>
                                <td>{n.id}</td><td><strong>{n.hoTen}</strong></td><td>{n.tenKhoa || n.khoaId}</td><td>{n.soDienThoai || '—'}</td>
                                <td><div className="action-btns">{canEdit && <button className="btn-action btn-edit">Sửa</button>}{canDelete && <button className="btn-action btn-delete">Xóa</button>}</div></td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
