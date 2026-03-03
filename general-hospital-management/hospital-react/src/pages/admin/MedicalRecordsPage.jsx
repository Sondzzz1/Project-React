import { useState, useEffect } from 'react';
import { medicalRecordApi } from '../../api';
import { formatDate } from '../../utils/formatters';
import { usePermissions } from '../../hooks/usePermissions';
import './AdminPages.css';

export default function MedicalRecordsPage() {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const { canAdd } = usePermissions();

    useEffect(() => {
        (async () => {
            try { const r = await medicalRecordApi.getAll(); setRecords(r?.data || r || []); }
            catch (e) { console.error(e); } finally { setLoading(false); }
        })();
    }, []);

    return (
        <div className="admin-page">
            <div className="page-header"><h1>Hồ sơ Bệnh án</h1><p>Quản lý hồ sơ bệnh án điện tử</p></div>
            <div className="page-toolbar">
                <div className="toolbar-left"><input className="search-input" placeholder="🔍 Tìm hồ sơ..." /></div>
                {canAdd && <button className="btn-add">+ Tạo hồ sơ</button>}
            </div>
            <div className="data-table-wrap">
                {loading ? <div className="loading-center">Đang tải...</div> : records.length === 0 ?
                    <div className="empty-state"><div className="empty-state-icon">📁</div><p>Chưa có hồ sơ bệnh án</p></div> :
                    <table className="data-table">
                        <thead><tr><th>ID</th><th>Bệnh nhân</th><th>Chẩn đoán</th><th>Bác sĩ</th><th>Ngày tạo</th></tr></thead>
                        <tbody>{records.map(r => (
                            <tr key={r.id}><td>{r.id}</td><td>{r.tenBenhNhan}</td><td>{r.chanDoan}</td><td>{r.tenBacSi}</td><td>{formatDate(r.ngayTao)}</td></tr>
                        ))}</tbody>
                    </table>}
            </div>
        </div>
    );
}
