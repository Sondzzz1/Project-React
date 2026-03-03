import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const slides = [
    {
        title: 'Bệnh viện Đa khoa Hoàn Mỹ',
        desc: 'Chăm sóc sức khỏe toàn diện với đội ngũ 150+ bác sĩ chuyên khoa',
        cta: 'Đặt lịch khám ngay'
    },
    {
        title: 'Trang thiết bị Y tế Hiện đại',
        desc: 'Hệ thống MRI 3.0 Tesla, CT Scanner 256 lát cắt, Xét nghiệm tự động',
        cta: 'Khám phá dịch vụ'
    },
    {
        title: 'Đội ngũ Chuyên gia Hàng đầu',
        desc: 'Giáo sư, Tiến sĩ, Bác sĩ chuyên khoa II từ các bệnh viện lớn',
        cta: 'Xem đội ngũ bác sĩ'
    }
];

const services = [
    { icon: '🩺', name: 'Khám Sức khỏe Tổng quát', desc: 'Gói khám từ cơ bản đến cao cấp với 45+ hạng mục', price: 'Từ 1.500.000 VNĐ' },
    { icon: '🚑', name: 'Cấp cứu 24/7', desc: 'Phòng cấp cứu 20 giường, xe cứu thương GPS', price: 'Hotline: 1900 1234' },
    { icon: '🔬', name: 'Xét nghiệm & Chẩn đoán', desc: 'Phòng Lab đạt chuẩn ISO 15189, kết quả 2-4 giờ', price: '200+ loại xét nghiệm' },
    { icon: '💉', name: 'Phẫu thuật Nội soi', desc: '8 phòng mổ vô trùng, phẫu thuật nội soi 3D', price: 'Tỷ lệ thành công 98.5%' },
    { icon: '🤰', name: 'Thai sản Trọn gói', desc: 'Khám thai định kỳ, sinh thường, sinh mổ', price: 'Từ 25.000.000 VNĐ' },
    { icon: '❤️', name: 'Tim mạch Can thiệp', desc: 'Đặt stent mạch vành, siêu âm tim 4D', price: 'Chuyên gia đầu ngành' }
];

const departments = [
    { code: 'NK-001', name: 'Khoa Nội Tổng hợp', type: 'Nội khoa', head: 'PGS.TS Nguyễn Văn Minh', beds: 60, available: 15 },
    { code: 'NGK-002', name: 'Khoa Ngoại Tổng hợp', type: 'Ngoại khoa', head: 'TS.BS Trần Quốc Hùng', beds: 50, available: 8 },
    { code: 'SAN-003', name: 'Khoa Sản', type: 'Sản phụ khoa', head: 'TS.BS Lê Thị Hương', beds: 45, available: 3 },
    { code: 'NHI-004', name: 'Khoa Nhi', type: 'Nhi khoa', head: 'PGS.TS Phạm Văn Đức', beds: 40, available: 12 },
    { code: 'CC-005', name: 'Khoa Cấp cứu', type: 'Cấp cứu', head: 'TS.BS Hoàng Minh Tuấn', beds: 25, available: 2 },
    { code: 'TM-006', name: 'Khoa Tim mạch', type: 'Chuyên khoa', head: 'GS.TS Vũ Đình Hải', beds: 35, available: 7 }
];

const doctors = [
    { name: 'GS.TS.BS Nguyễn Văn Minh', specialty: 'Trưởng khoa Nội Tổng hợp', exp: '30 năm', phone: '0912.345.678', schedule: 'T2, T4, T6: 8:00 - 12:00' },
    { name: 'TS.BS Trần Quốc Hùng', specialty: 'Trưởng khoa Ngoại Tổng hợp', exp: '22 năm', phone: '0912.345.679', schedule: 'T3, T5, T7: 8:00 - 12:00' },
    { name: 'TS.BS Lê Thị Hương', specialty: 'Trưởng khoa Sản', exp: '18 năm', phone: '0912.345.680', schedule: 'T2 - T6: 14:00 - 17:00' },
    { name: 'PGS.TS Phạm Văn Đức', specialty: 'Trưởng khoa Nhi', exp: '25 năm', phone: '0912.345.681', schedule: 'T2, T4, T6: 14:00 - 17:00' },
    { name: 'GS.TS Vũ Đình Hải', specialty: 'Trưởng khoa Tim mạch', exp: '35 năm', phone: '0912.345.682', schedule: 'T3, T5: 8:00 - 12:00' },
    { name: 'TS.BS Hoàng Minh Tuấn', specialty: 'Trưởng khoa Cấp cứu', exp: '15 năm', phone: '0912.345.683', schedule: 'Trực 24/7' }
];

const bedStats = [
    { icon: '🛏️', value: 350, label: 'Tổng số giường', cls: '' },
    { icon: '✅', value: 47, label: 'Giường trống', cls: 'stat-available' },
    { icon: '🏥', value: 303, label: 'Đang sử dụng', cls: 'stat-occupied' },
    { icon: '📊', value: '86.6%', label: 'Tỷ lệ sử dụng', cls: 'stat-rate' }
];

export default function HomePage() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="home-page">
            {/* Hero Slideshow */}
            <section className="hero-section">
                <div className="hero-slideshow">
                    {slides.map((slide, i) => (
                        <div key={i} className={`hero-slide ${i === currentSlide ? 'active' : ''}`}>
                            <div className="hero-overlay" />
                            <div className="hero-content">
                                <h1>{slide.title}</h1>
                                <p>{slide.desc}</p>
                                <Link to="/services" className="hero-cta">{slide.cta}</Link>
                            </div>
                        </div>
                    ))}
                    <div className="hero-dots">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                className={`hero-dot ${i === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="home-section">
                <div className="container">
                    <h2 className="section-title">Dịch vụ Y tế Chuyên nghiệp</h2>
                    <div className="services-grid">
                        {services.map((s, i) => (
                            <div key={i} className="service-card">
                                <div className="service-icon">{s.icon}</div>
                                <h3>{s.name}</h3>
                                <p>{s.desc}</p>
                                <div className="service-price">{s.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Departments */}
            <section className="home-section section-alt">
                <div className="container">
                    <h2 className="section-title">Hệ thống Khoa Phòng</h2>
                    <div className="dept-grid">
                        {departments.map(dept => (
                            <div key={dept.code} className="dept-card">
                                <div className="dept-header">
                                    <h3>{dept.name}</h3>
                                    <span className={`dept-type ${dept.type === 'Cấp cứu' ? 'urgent' : ''}`}>{dept.type}</span>
                                </div>
                                <div className="dept-info">
                                    <p><strong>Mã khoa:</strong> {dept.code}</p>
                                    <p><strong>Trưởng khoa:</strong> {dept.head}</p>
                                    <p><strong>Số giường:</strong> {dept.beds}</p>
                                    <p><strong>Còn trống:</strong> <span className={dept.available <= 3 ? 'critical' : 'available'}>{dept.available} giường</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Doctors */}
            <section className="home-section">
                <div className="container">
                    <h2 className="section-title">Đội ngũ Bác sĩ Chuyên khoa</h2>
                    <div className="doctors-grid">
                        {doctors.map((doc, i) => (
                            <div key={i} className="doctor-card">
                                <div className="doctor-avatar">
                                    {doc.name.split(' ').pop().charAt(0)}
                                </div>
                                <h3>{doc.name}</h3>
                                <p className="doctor-spec">{doc.specialty}</p>
                                <p className="doctor-exp">{doc.exp} kinh nghiệm</p>
                                <div className="doctor-contact">
                                    <p>📞 {doc.phone}</p>
                                    <p>🕐 {doc.schedule}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Bed Stats */}
            <section className="home-section section-alt">
                <div className="container">
                    <h2 className="section-title">Thống kê Giường bệnh</h2>
                    <div className="stats-grid">
                        {bedStats.map((s, i) => (
                            <div key={i} className={`stat-card ${s.cls}`}>
                                <div className="stat-icon">{s.icon}</div>
                                <h3>{s.value}</h3>
                                <p>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="home-section cta-section">
                <div className="container cta-content">
                    <h2>Đặt lịch khám Online</h2>
                    <p>Đặt lịch hẹn trực tuyến dễ dàng, nhanh chóng. Không cần xếp hàng.</p>
                    <div className="cta-steps">
                        {['Chọn khoa & bác sĩ', 'Chọn ngày giờ', 'Điền thông tin', 'Xác nhận'].map((step, i) => (
                            <div key={i} className="cta-step">
                                <span className="step-num">{i + 1}</span>
                                <p>{step}</p>
                            </div>
                        ))}
                    </div>
                    <Link to="/login" className="cta-btn">Đặt lịch ngay</Link>
                    <p className="cta-note">💡 Mang theo CCCD/CMND và thẻ BHYT khi đến khám</p>
                </div>
            </section>
        </div>
    );
}
