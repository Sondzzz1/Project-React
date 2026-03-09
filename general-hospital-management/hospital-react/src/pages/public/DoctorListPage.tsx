import { useState } from 'react';
import './DoctorListPage.css';

interface PublicDoctor {
    name: string;
    specialty: string;
    title: string;
    exp: string;
    phone: string;
    schedule: string;
    avatar: string;
    bio: string;
}

const specialties = ['Tất cả', 'Nội khoa', 'Ngoại khoa', 'Sản phụ khoa', 'Nhi khoa', 'Tim mạch', 'Thần kinh', 'Cấp cứu', 'Hồi sức'];

const doctorList: PublicDoctor[] = [
    {
        name: 'GS.TS.BS Nguyễn Văn Minh', specialty: 'Nội khoa', title: 'Trưởng khoa Nội Tổng hợp',
        exp: '30 năm', phone: '0912.345.678', schedule: 'T2, T4, T6: 8:00 - 12:00', avatar: 'M',
        bio: 'Chuyên gia hàng đầu về bệnh lý nội khoa tổng quát, tiêu hóa, hô hấp. Nguyên Phó GĐ Bệnh viện Bạch Mai.'
    },
    {
        name: 'TS.BS Trần Quốc Hùng', specialty: 'Ngoại khoa', title: 'Trưởng khoa Ngoại Tổng hợp',
        exp: '22 năm', phone: '0912.345.679', schedule: 'T3, T5, T7: 8:00 - 12:00', avatar: 'H',
        bio: 'Chuyên phẫu thuật nội soi, ngoại tiêu hóa, ngoại gan mật. Đào tạo tại Pháp.'
    },
    {
        name: 'TS.BS Lê Thị Hương', specialty: 'Sản phụ khoa', title: 'Trưởng khoa Sản',
        exp: '18 năm', phone: '0912.345.680', schedule: 'T2 - T6: 14:00 - 17:00', avatar: 'H',
        bio: 'Chuyên khám thai, sinh nở, IVF, điều trị vô sinh. Thành viên Hội Phụ sản Việt Nam.'
    },
    {
        name: 'PGS.TS Phạm Văn Đức', specialty: 'Nhi khoa', title: 'Trưởng khoa Nhi',
        exp: '25 năm', phone: '0912.345.681', schedule: 'T2, T4, T6: 14:00 - 17:00', avatar: 'Đ',
        bio: 'Chuyên gia nhi khoa, bệnh lý hô hấp trẻ em, dinh dưỡng trẻ em. Nguyên BS BV Nhi TW.'
    },
    {
        name: 'GS.TS Vũ Đình Hải', specialty: 'Tim mạch', title: 'Trưởng khoa Tim mạch',
        exp: '35 năm', phone: '0912.345.682', schedule: 'T3, T5: 8:00 - 12:00', avatar: 'H',
        bio: 'Chuyên can thiệp tim mạch, đặt stent, ablation. Nguyên GĐ Viện Tim mạch Quốc gia.'
    },
    {
        name: 'TS.BS Hoàng Minh Tuấn', specialty: 'Cấp cứu', title: 'Trưởng khoa Cấp cứu',
        exp: '15 năm', phone: '0912.345.683', schedule: 'Trực 24/7', avatar: 'T',
        bio: 'Chuyên gia cấp cứu, hồi sức tích cực. Kinh nghiệm xử lý đa chấn thương phức tạp.'
    },
    {
        name: 'TS.BS Đỗ Minh Quân', specialty: 'Thần kinh', title: 'Trưởng khoa Thần kinh',
        exp: '20 năm', phone: '0912.345.684', schedule: 'T2, T3, T5: 8:00 - 12:00', avatar: 'Q',
        bio: 'Chuyên điều trị đột quỵ não, Parkinson, động kinh. Đào tạo tại Nhật Bản.'
    },
    {
        name: 'TS.BS Nguyễn Hoàng Anh', specialty: 'Hồi sức', title: 'Trưởng khoa ICU',
        exp: '17 năm', phone: '0912.345.685', schedule: 'T2 - T7: 7:00 - 15:00', avatar: 'A',
        bio: 'Chuyên gia hồi sức cấp cứu, thở máy, lọc máu. Kinh nghiệm ICU hơn 15 năm.'
    },
    {
        name: 'PGS.TS Trần Thị Mai', specialty: 'Nội khoa', title: 'Phó khoa Nội Tổng hợp',
        exp: '20 năm', phone: '0912.345.686', schedule: 'T3, T5, T7: 14:00 - 17:00', avatar: 'M',
        bio: 'Chuyên nội tiết - đái tháo đường, tuyến giáp. Giảng viên ĐH Y Hà Nội.'
    },
];

export default function DoctorListPage() {
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('Tất cả');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const filtered = doctorList.filter(
        (d) =>
            (selectedSpecialty === 'Tất cả' || d.specialty === selectedSpecialty) &&
            (!searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialty.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="doctor-list-page">
            <div className="doclist-hero">
                <h1>Đội Ngũ Bác Sĩ</h1>
                <p>Hơn 150 bác sĩ chuyên khoa giàu kinh nghiệm, tận tâm với nghề</p>
            </div>

            <div className="container doclist-content">
                <div className="doclist-filters">
                    <div className="doclist-search">
                        <input
                            type="text"
                            placeholder="🔍 Tìm bác sĩ theo tên hoặc chuyên khoa..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="doclist-tags">
                        {specialties.map((s) => (
                            <button
                                key={s}
                                className={`doclist-tag ${selectedSpecialty === s ? 'active' : ''}`}
                                onClick={() => setSelectedSpecialty(s)}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="doclist-count">Tìm thấy <strong>{filtered.length}</strong> bác sĩ</p>

                <div className="doclist-grid">
                    {filtered.map((doc, i) => (
                        <div key={i} className="doclist-card">
                            <div className="doclist-card-top">
                                <div className="doclist-avatar">{doc.avatar}</div>
                                <div className="doclist-badge">{doc.specialty}</div>
                            </div>
                            <div className="doclist-card-body">
                                <h3>{doc.name}</h3>
                                <p className="doclist-title">{doc.title}</p>
                                <p className="doclist-bio">{doc.bio}</p>
                                <div className="doclist-meta">
                                    <div className="doclist-meta-item">
                                        <span className="meta-icon">⏱️</span>
                                        <span>{doc.exp} kinh nghiệm</span>
                                    </div>
                                    <div className="doclist-meta-item">
                                        <span className="meta-icon">📅</span>
                                        <span>{doc.schedule}</span>
                                    </div>
                                    <div className="doclist-meta-item">
                                        <span className="meta-icon">📞</span>
                                        <span>{doc.phone}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="doclist-card-actions">
                                <a href={`tel:${doc.phone.replace(/\./g, '')}`} className="doclist-btn doclist-btn-outline">📞 Gọi ngay</a>
                                <a href="/login" className="doclist-btn doclist-btn-primary">📅 Đặt lịch</a>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
