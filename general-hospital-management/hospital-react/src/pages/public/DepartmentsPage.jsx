import './DepartmentsPage.css';

const departments = [
    { code: 'NK-001', name: 'Khoa Nội Tổng hợp', type: 'Nội khoa', head: 'PGS.TS Nguyễn Văn Minh', beds: 60, available: 15, doctors: 12, nurses: 24, desc: 'Khoa Nội Tổng hợp chuyên khám, chẩn đoán và điều trị các bệnh lý nội khoa.' },
    { code: 'NGK-002', name: 'Khoa Ngoại Tổng hợp', type: 'Ngoại khoa', head: 'TS.BS Trần Quốc Hùng', beds: 50, available: 8, doctors: 15, nurses: 28, desc: 'Chuyên phẫu thuật tổng quát, ngoại tiêu hóa, ngoại thần kinh.' },
    { code: 'SAN-003', name: 'Khoa Sản', type: 'Sản phụ khoa', head: 'TS.BS Lê Thị Hương', beds: 45, available: 3, doctors: 10, nurses: 20, desc: 'Chăm sóc thai sản, sinh nở, và sức khỏe phụ nữ.' },
    { code: 'NHI-004', name: 'Khoa Nhi', type: 'Nhi khoa', head: 'PGS.TS Phạm Văn Đức', beds: 40, available: 12, doctors: 8, nurses: 18, desc: 'Chẩn đoán và điều trị các bệnh lý ở trẻ em.' },
    { code: 'CC-005', name: 'Khoa Cấp cứu', type: 'Cấp cứu', head: 'TS.BS Hoàng Minh Tuấn', beds: 25, available: 2, doctors: 14, nurses: 30, desc: 'Tiếp nhận và xử lý cấp cứu 24/7 với đội ngũ trực liên tục.' },
    { code: 'TM-006', name: 'Khoa Tim mạch', type: 'Chuyên khoa', head: 'GS.TS Vũ Đình Hải', beds: 35, available: 7, doctors: 11, nurses: 22, desc: 'Can thiệp tim mạch, đặt stent, siêu âm tim.' },
    { code: 'TK-007', name: 'Khoa Thần kinh', type: 'Chuyên khoa', head: 'TS.BS Đỗ Minh Quân', beds: 30, available: 5, doctors: 9, nurses: 18, desc: 'Chẩn đoán và điều trị bệnh lý thần kinh, đột quỵ.' },
    { code: 'HSCC-009', name: 'Khoa Hồi sức Cấp cứu (ICU)', type: 'Hồi sức', head: 'TS.BS Nguyễn Hoàng Anh', beds: 20, available: 2, doctors: 12, nurses: 24, desc: 'Hồi sức tích cực cho bệnh nhân nặng.' },
];

export default function DepartmentsPage() {
    return (
        <div className="departments-page">
            <div className="dept-page-hero">
                <h1>Hệ thống Khoa Phòng</h1>
                <p>Bệnh viện Đa khoa Hoàn Mỹ với {departments.length} khoa chuyên môn hàng đầu</p>
            </div>
            <div className="container dept-page-content">
                {departments.map(dept => (
                    <div key={dept.code} className="dept-detail-card">
                        <div className="dept-detail-header">
                            <div>
                                <h2>{dept.name}</h2>
                                <span className={`dept-type-badge ${dept.type === 'Cấp cứu' || dept.type === 'Hồi sức' ? 'urgent' : ''}`}>{dept.type}</span>
                            </div>
                            <span className="dept-code">{dept.code}</span>
                        </div>
                        <p className="dept-desc">{dept.desc}</p>
                        <div className="dept-stats-row">
                            <div className="dept-stat"><span className="dept-stat-label">Trưởng khoa</span><span className="dept-stat-value">{dept.head}</span></div>
                            <div className="dept-stat"><span className="dept-stat-label">Bác sĩ</span><span className="dept-stat-value">{dept.doctors}</span></div>
                            <div className="dept-stat"><span className="dept-stat-label">Điều dưỡng</span><span className="dept-stat-value">{dept.nurses}</span></div>
                            <div className="dept-stat"><span className="dept-stat-label">Tổng giường</span><span className="dept-stat-value">{dept.beds}</span></div>
                            <div className="dept-stat"><span className="dept-stat-label">Còn trống</span><span className={`dept-stat-value ${dept.available <= 3 ? 'critical' : 'available'}`}>{dept.available}</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
