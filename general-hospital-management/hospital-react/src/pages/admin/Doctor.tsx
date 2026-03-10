import { useState, useEffect } from 'react';
import { doctorApi, Doctor } from '../../services';
import { usePermissions } from '../../hooks/usePermissions';
import '../../assets/css/admin/admin.css';

export default function DoctorPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [search, setSearch] = useState<string>('');
    const { canAdd, canEdit, canDelete } = usePermissions();

    useEffect(() => {
        (async () => {
            try {
                const r = await doctorApi.getAll();
                setDoctors((r as { data?: Doctor[] })?.data || (r as Doctor[]) || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered: Doctor[] = doctors.filter(d => !search || (d.hoTen || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Quản lý Bác sĩ</h1><p>Danh sách bác sĩ trong hệ thống</p></div>
            <div className="page-toolbar">
                <div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm bác sĩ..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                {canAdd && <button className="btn-add">+ Thêm bác sĩ</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : filtered.length === 0 ? (
                    <div className="empty-state"><div className="empty-state-icon">👨‍⚕️</div><p>Chưa có dữ liệu</p></div>
                ) : (
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Họ tên</th><th>Chuyên khoa</th><th>SĐT</th><th>Email</th><th>Thao tác</th></tr></thead>
                        <tbody>{filtered.map(d => (
                            <tr key={d.id}>
                                <td>{d.id}</td><td><strong>{d.hoTen}</strong></td><td>{d.chuyenKhoa}</td><td>{d.soDienThoai || '—'}</td><td>{d.email || '—'}</td>
                                <td><div className="action-btns">{canEdit && <button className="btn-action btn-edit">Sửa</button>}{canDelete && <button className="btn-action btn-delete">Xóa</button>}</div></td>
                            </tr>
                        ))}</tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
