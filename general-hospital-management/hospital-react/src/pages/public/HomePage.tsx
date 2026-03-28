import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

interface Slide {
    title: string;
    desc: string;
    cta: string;
}

interface Service {
    icon: string;
    name: string;
    desc: string;
    price: string;
}

interface DeptInfo {
    code: string;
    name: string;
    type: string;
    head: string;
    beds: number;
    available: number;
}

interface DoctorInfo {
    name: string;
    specialty: string;
    exp: string;
    phone: string;
    schedule: string;
    imageUrl?: string;
}

interface BedStat {
    icon: string;
    value: number | string;
    label: string;
    cls: string;
}

const slides: Slide[] = [
    { title: 'Bệnh viện Đa khoa Hoàn Mỹ', desc: 'Chăm sóc sức khỏe toàn diện với đội ngũ 150+ bác sĩ chuyên khoa. Công nghệ y tế vượt trội.', cta: 'Đặt lịch hẹn ngay' },
    { title: 'Tầm Soát Ung Thư Công Nghệ Cao', desc: 'Sử dụng thế hệ máy MRI 3.0 Tesla và AI phát hiện mầm bệnh ngay từ giai đoạn đầu.', cta: 'Khám phá dịch vụ' },
    { title: 'Đội ngũ Chuyên gia Tận tâm', desc: 'Đồng hành cùng bệnh nhân trên mọi chặng đường với phương châm "Xem người bệnh như người thân".', cta: 'Gặp gỡ bác sĩ' },
];

const services: Service[] = [
    { icon: '🩺', name: 'Khám Sức khỏe Tổng quát', desc: 'Gói khám toàn diện cá nhân hóa với 45+ hạng mục chuyên sâu.', price: 'Từ 1.500.000 VNĐ' },
    { icon: '🚑', name: 'Mạng lưới Cấp cứu 24/7', desc: 'Phòng cấp cứu lưu động nội ô và hệ thống xe cứu thương GPS.', price: 'Hotline: 1900 1234' },
    { icon: '🔬', name: 'Xét nghiệm Máu & Chẩn đoán', desc: 'Phòng Lab đạt chuẩn quốc tế ISO 15189, trả kết quả chỉ trong 2 giờ.', price: '200+ loại xét nghiệm' },
    { icon: '💉', name: 'Phẫu thuật Robot Kỹ thuật cao', desc: 'Hệ thống phòng mổ áp lực dương vô trùng chuẩn Châu Âu.', price: 'Tỷ lệ thành công 98.9%' },
    { icon: '🤰', name: 'Sản phụ khoa & Sinh trọn gói', desc: 'Dịch vụ lưu viện phòng VIP như khách sạn 5 sao, mẹ tròn con vuông.', price: 'Từ 25.000.000 VNĐ' },
    { icon: '❤️', name: 'Tim mạch Di truyền học', desc: 'Sàng lọc biến dị gen tim mạch, đặt stent mạch vành 3D.', price: 'Chuyên gia đầu ngành' },
];

const departments: DeptInfo[] = [
    { code: 'NK-001', name: 'Khoa Nội Tổng hợp', type: 'Nội khoa', head: 'PGS.TS Nguyễn Văn Minh', beds: 60, available: 15 },
    { code: 'NGK-002', name: 'Khoa Ngoại Tổng hợp', type: 'Ngoại khoa', head: 'TS.BS Trần Quốc Hùng', beds: 50, available: 8 },
    { code: 'SAN-003', name: 'Khoa Sản', type: 'Sản phụ khoa', head: 'TS.BS Lê Thị Hương', beds: 45, available: 3 },
    { code: 'NHI-004', name: 'Khoa Nhi', type: 'Nhi khoa', head: 'PGS.TS Phạm Văn Đức', beds: 40, available: 12 },
    { code: 'CC-005', name: 'Khoa Cấp cứu', type: 'Cấp cứu', head: 'TS.BS Hoàng Minh Tuấn', beds: 25, available: 2 },
    { code: 'TM-006', name: 'Khoa Tim mạch', type: 'Chuyên khoa', head: 'GS.TS Vũ Đình Hải', beds: 35, available: 7 },
];

const doctors: DoctorInfo[] = [
    { name: 'GS.TS.BS Nguyễn Văn Minh', specialty: 'Trưởng khoa Nội Tổng hợp', exp: '30 năm', phone: '0912.345.678', schedule: 'T2, T4, T6: 8:00 - 12:00', imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=500&auto=format&fit=crop&q=80' },
    { name: 'TS.BS Trần Quốc Hùng', specialty: 'Trưởng khoa Ngoại Tổng hợp', exp: '22 năm', phone: '0912.345.679', schedule: 'T3, T5, T7: 8:00 - 12:00', imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=500&auto=format&fit=crop&q=80' },
    { name: 'TS.BS Lê Thị Hương', specialty: 'Trưởng khoa Sản phụ khoa', exp: '18 năm', phone: '0912.345.680', schedule: 'T2 - T6: 14:00 - 17:00', imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=500&auto=format&fit=crop&q=80' },
    { name: 'PGS.TS Phạm Văn Đức', specialty: 'Trưởng khoa Nhi khoa', exp: '25 năm', phone: '0912.345.681', schedule: 'T2, T4, T6: 14:00 - 17:00' }, // Để trống ảnh để kiểm tra thay thế avatar
    { name: 'GS.TS Vũ Đình Hải', specialty: 'Trưởng khoa Tim mạch', exp: '35 năm', phone: '0912.345.682', schedule: 'T3, T5: 8:00 - 12:00', imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=500&auto=format&fit=crop&q=80' },
    { name: 'TS.BS Hoàng Minh Tuấn', specialty: 'Trưởng khoa Cấp cứu', exp: '15 năm', phone: '0912.345.683', schedule: 'Trực 24/7' }, // Để trống
];

const bedStats: BedStat[] = [
    { icon: '🛏️', value: 350, label: 'Tổng số giường', cls: 'stat-total' },
    { icon: '✅', value: 47, label: 'Giường đang trống', cls: 'stat-available' },
    { icon: '🏥', value: 303, label: 'Đang lưu viện', cls: 'stat-occupied' },
    { icon: '📊', value: '86.6%', label: 'Tỷ lệ lấp đầy', cls: 'stat-rate' },
];

export default function HomePage() {
    const [currentSlide, setCurrentSlide] = useState<number>(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="home-page">
            {/* HER0 SECTION */}
            <section className="hero-section">
                <div className="hero-slideshow">
                    {slides.map((slide, i) => (
                        <div key={i} className={`hero-slide ${i === currentSlide ? 'active' : ''}`}>
                            <div className="hero-overlay" />
                            <div className="hero-content">
                                <span className="hero-badge">Y Tế Trọng Điểm Quốc Gia</span>
                                <h1>{slide.title}</h1>
                                <p>{slide.desc}</p>
                                <div className="hero-buttons">
                                    <Link to="/login" className="hero-cta btn-primary">{slide.cta}</Link>
                                    <Link to="/contact" className="hero-cta btn-secondary">Liên hệ tư vấn</Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="hero-dots">
                        {slides.map((_, i) => (
                            <button key={i} className={`hero-dot ${i === currentSlide ? 'active' : ''}`} onClick={() => setCurrentSlide(i)} aria-label="Slide Control" />
                        ))}
                    </div>
                </div>
            </section>

            {/* QUICK ACTIONS BAR (Mới) */}
            <section className="quick-action-bar">
                <div className="container">
                    <div className="qa-grid">
                        <div className="qa-item">
                            <div className="qa-icon">⏰</div>
                            <div className="qa-info">
                                <h4>Giờ Làm Việc</h4>
                                <p>Thứ 2 - Thứ 7: 7:00 - 17:00</p>
                            </div>
                        </div>
                        <div className="qa-item">
                            <div className="qa-icon">🚑</div>
                            <div className="qa-info">
                                <h4>Trực Cấp Cứu</h4>
                                <p>Hoạt động 24/7. Gọi 1900 1234</p>
                            </div>
                        </div>
                        <div className="qa-item highlight">
                            <div className="qa-icon">📅</div>
                            <div className="qa-info">
                                <h4>Đặt Khám Ngay</h4>
                                <p>Đăng ký trực tuyến, không chờ đợi</p>
                            </div>
                            <Link to="/login" className="qa-link"></Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* WHY CHOOSE US (Mới) */}
            <section className="home-section section-why-us">
                <div className="container">
                    <div className="why-us-content">
                        <div className="why-us-text">
                            <span className="section-subtitle">Vì sao nên chọn chúng tôi?</span>
                            <h2 className="section-title left-align">Chăm Sóc Sức Khỏe Toàn Diện Theo Tiêu Chuẩn Quốc Tế</h2>
                            <p className="why-desc">Với hơn hai thập kỉ cống hiến, bệnh viện Đa khoa Hoàn Mỹ không ngừng đổi mới công nghệ y khoa và nâng cao y đức để bảo vệ sinh mệnh cộng đồng.</p>
                            <ul className="why-list">
                                <li><strong>Cơ sở vật chất 5 Sao:</strong> Không gian xanh, thoáng đãng, đem lại sự thoái mái. 100% buồng bệnh tiệt trùng.</li>
                                <li><strong>Hội chẩn Liên khoa:</strong> Quy trình chẩn đoán phức tạp được hội chẩn bởi Hội đồng Y khoa giàu kinh nghiệm.</li>
                                <li><strong>Bảo hiểm Linh hoạt:</strong> Ký kết với 50+ công ty BHNT & BHYT, hỗ trợ bồi thường trực tiếp tại viện.</li>
                            </ul>
                            <Link to="/about" className="link-arrow">Tìm hiểu thêm về chúng tôi &rarr;</Link>
                        </div>
                        <div className="why-us-image-grid">
                            <div className="img-box box-1">
                                <img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=500&auto=format&fit=crop&q=80" alt="Hospital Facility" />
                            </div>
                            <div className="img-box box-2">
                                <img src="https://images.unsplash.com/photo-1581594693702-fbdc51b2763b?w=500&auto=format&fit=crop&q=80" alt="Medical Team" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SERVICES */}
            <section className="home-section section-alt">
                <div className="container">
                    <span className="section-subtitle center">Chuyên Môn Của Chúng Tôi</span>
                    <h2 className="section-title">Dịch vụ Y tế Chuyên nghiệp & Đẳng cấp</h2>
                    <div className="services-grid premium-grid">
                        {services.map((s, i) => (
                            <div key={i} className="service-card glass-card">
                                <div className="service-icon-wrap">
                                    <div className="service-icon">{s.icon}</div>
                                </div>
                                <h3>{s.name}</h3>
                                <p>{s.desc}</p>
                                <div className="service-price-tag">{s.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DOCTORS */}
            <section className="home-section section-doctors">
                <div className="container">
                    <span className="section-subtitle center">Đội Ngũ Chuyên Gia</span>
                    <h2 className="section-title">Các Bác Sĩ & Chuyên Gia Đầu Ngành</h2>
                    <p className="section-desc">Hội tụ đội ngũ Y khoa giàu y đức, được đào tạo chuyên sâu trong và ngoài nước.</p>
                    <div className="doctors-grid">
                        {doctors.map((doc, i) => (
                            <div key={i} className="doctor-card modern-card">
                                <div className="doctor-avatar-wrapper">
                                    {doc.imageUrl ? (
                                        <img src={doc.imageUrl} alt={doc.name} className="doctor-photo" />
                                    ) : (
                                        <div className="doctor-avatar-placeholder">{doc.name.split(' ').pop()?.charAt(0)}</div>
                                    )}
                                </div>
                                <div className="doctor-info-box">
                                    <h3 title={doc.name}>{doc.name}</h3>
                                    <p className="doctor-spec">{doc.specialty}</p>
                                    <hr className="divider" />
                                    <div className="doc-meta">
                                        <span><strong>Kinh nghiệm:</strong> {doc.exp}</span>
                                    </div>
                                    <div className="doctor-contact">
                                        <div className="dc-item">
                                            <span className="dc-icon">📞</span>
                                            <span>{doc.phone}</span>
                                        </div>
                                        <div className="dc-item">
                                            <span className="dc-icon">🕐</span>
                                            <span>{doc.schedule}</span>
                                        </div>
                                    </div>
                                    <button className="book-btn">Đặt Khám Bác Sĩ Này</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="center-btn-wrap">
                        <Link to="/doctors" className="btn-outline">Xem Toàn Bộ Bác Sĩ</Link>
                    </div>
                </div>
            </section>

            {/* DEPARTMENTS (Khoa Phòng) */}
            <section className="home-section section-alt">
                <div className="container">
                    <span className="section-subtitle center">Mạng Lưới Y Tế</span>
                    <h2 className="section-title">Hệ thống Hệ Thống Chuyên Khoa</h2>
                    <div className="dept-grid">
                        {departments.map((dept) => (
                            <div key={dept.code} className="dept-card">
                                <div className="dept-header">
                                    <h3>{dept.name}</h3>
                                    <span className={`dept-type ${dept.type === 'Cấp cứu' ? 'urgent' : ''}`}>{dept.type}</span>
                                </div>
                                <div className="dept-body">
                                    <div className="dept-row">
                                        <span className="d-label">Mã khoa:</span>
                                        <span className="d-val code">{dept.code}</span>
                                    </div>
                                    <div className="dept-row">
                                        <span className="d-label">Trưởng khoa:</span>
                                        <span className="d-val head">{dept.head}</span>
                                    </div>
                                    <div className="dept-row">
                                        <span className="d-label">Tổng giường bệnh:</span>
                                        <span className="d-val">{dept.beds} giường</span>
                                    </div>
                                    <div className="dept-row">
                                        <span className="d-label">Số giường trống:</span>
                                        <span className={`d-val pill ${dept.available <= 3 ? 'critical' : 'available'}`}>{dept.available}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="home-section parallax-stats">
                <div className="stats-overlay"></div>
                <div className="container relative-z">
                    <div className="stats-grid premium-stats">
                        {bedStats.map((s, i) => (
                            <div key={i} className={`stat-card ${s.cls}`}>
                                <div className="stat-icon-glow">{s.icon}</div>
                                <div className="stat-content-box">
                                    <h3>{s.value}</h3>
                                    <p>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="home-section cta-premium-section">
                <div className="container">
                    <div className="cta-premium-box">
                        <div className="cta-promo">
                            <h2>Chủ động Tầm Soát - Bảo Vệ Tương Lai</h2>
                            <p>Không để bệnh tật cản bước hành trình của bạn. Đặt lịch khám hôm nay để được ưu tiên, giảm đến 15% phí khám ban đầu cho khách hàng đăng ký online.</p>
                            <Link to="/login" className="btn-solid-white">Đăng Ký Khám Khám Ngay</Link>
                            <span className="cta-note-sm">💡 Chấp nhận BHNT / BHYT các tuyến</span>
                        </div>
                        <div className="cta-steps-vertical">
                            <h4>Quy trình khám siêu tốc 4 bước:</h4>
                            <ul>
                                <li><span className="num">1</span> Đăng ký tài khoản & Đặt lịch hẹn</li>
                                <li><span className="num">2</span> Đến nhận STT tự động qua ki-ốt quét QR</li>
                                <li><span className="num">3</span> Khám với bác sĩ chuyên khoa siêu nhanh</li>
                                <li><span className="num">4</span> Lấy thuốc tự động tại nhà thuốc chuẩn GPP</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
