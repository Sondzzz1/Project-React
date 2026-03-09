import './AboutUsPage.css';

export default function AboutUsPage() {
    return (
        <div className="about-page">
            <div className="about-hero">
                <h1>Giới thiệu</h1>
                <p>Bệnh viện Đa khoa Hoàn Mỹ - Hơn 25 năm đồng hành cùng sức khỏe cộng đồng</p>
            </div>
            <div className="container about-content">
                <section className="about-section">
                    <h2>Về chúng tôi</h2>
                    <p>Thành lập năm 2000, Bệnh viện Đa khoa Hoàn Mỹ là một trong những cơ sở y tế hàng đầu tại Việt Nam. Với đội ngũ hơn 150 bác sĩ chuyên khoa và 500 nhân viên y tế, bệnh viện cam kết mang đến dịch vụ chăm sóc sức khỏe toàn diện, chất lượng cao.</p>
                </section>
                <section className="about-section">
                    <h2>Tầm nhìn &amp; Sứ mệnh</h2>
                    <div className="about-cards">
                        <div className="about-card"><div className="about-card-icon">🎯</div><h3>Tầm nhìn</h3><p>Trở thành bệnh viện đa khoa hàng đầu Đông Nam Á về chất lượng dịch vụ y tế và trải nghiệm bệnh nhân.</p></div>
                        <div className="about-card"><div className="about-card-icon">💙</div><h3>Sứ mệnh</h3><p>Cung cấp dịch vụ y tế chất lượng quốc tế với chi phí hợp lý, lấy bệnh nhân làm trung tâm.</p></div>
                        <div className="about-card"><div className="about-card-icon">⭐</div><h3>Giá trị cốt lõi</h3><p>Tận tâm - Chuyên nghiệp - Đổi mới - Nhân văn - Hợp tác.</p></div>
                    </div>
                </section>
                <section className="about-section">
                    <h2>Thành tựu nổi bật</h2>
                    <div className="about-achievements">
                        <div className="achievement"><h3>150+</h3><p>Bác sĩ chuyên khoa</p></div>
                        <div className="achievement"><h3>350</h3><p>Giường bệnh</p></div>
                        <div className="achievement"><h3>50,000+</h3><p>Bệnh nhân/năm</p></div>
                        <div className="achievement"><h3>25+</h3><p>Năm kinh nghiệm</p></div>
                    </div>
                </section>
            </div>
        </div>
    );
}
