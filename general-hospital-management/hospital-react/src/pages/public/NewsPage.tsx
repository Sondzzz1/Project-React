import { useState } from 'react';
import './NewsPage.css';

interface NewsItem {
    id: number;
    title: string;
    excerpt: string;
    category: string;
    date: string;
    author: string;
    icon: string;
    featured?: boolean;
}

const categories = ['Tất cả', 'Tin tức', 'Sự kiện', 'Y học', 'Tuyển dụng', 'Khuyến mãi'];

const newsData: NewsItem[] = [
    {
        id: 1, title: 'Bệnh viện Hoàn Mỹ đạt chứng nhận JCI lần thứ 3', featured: true,
        excerpt: 'Ngày 15/02/2026, Bệnh viện Đa khoa Hoàn Mỹ vinh dự đón nhận chứng nhận chất lượng quốc tế JCI (Joint Commission International) lần thứ 3, khẳng định vị thế dẫn đầu về chất lượng dịch vụ y tế tại Việt Nam.',
        category: 'Tin tức', date: '15/02/2026', author: 'Ban Truyền thông', icon: '🏆'
    },
    {
        id: 2, title: 'Chương trình tầm soát ung thư miễn phí tháng 3/2026',
        excerpt: 'Nhân dịp kỷ niệm 26 năm thành lập, Bệnh viện tổ chức chương trình tầm soát ung thư vú, cổ tử cung miễn phí cho 500 phụ nữ. Đăng ký từ 01/03 - 15/03/2026.',
        category: 'Sự kiện', date: '01/03/2026', author: 'Khoa Ung bướu', icon: '🎗️'
    },
    {
        id: 3, title: 'Phẫu thuật thay khớp háng bằng Robot lần đầu tại Việt Nam',
        excerpt: 'Ekip bác sĩ khoa Chấn thương Chỉnh hình đã thực hiện thành công ca phẫu thuật thay khớp háng bằng robot Mako, mở ra kỷ nguyên mới trong phẫu thuật xương khớp.',
        category: 'Y học', date: '20/02/2026', author: 'TS.BS Trần Quốc Hùng', icon: '🤖'
    },
    {
        id: 4, title: 'Tuyển dụng Bác sĩ và Điều dưỡng năm 2026',
        excerpt: 'Bệnh viện tuyển dụng: 15 Bác sĩ đa khoa, 10 Bác sĩ chuyên khoa, 30 Điều dưỡng, 5 Dược sĩ. Chế độ đãi ngộ hấp dẫn, cơ hội phát triển nghề nghiệp.',
        category: 'Tuyển dụng', date: '10/02/2026', author: 'Phòng Nhân sự', icon: '👩‍⚕️'
    },
    {
        id: 5, title: 'Giảm 30% gói khám sức khỏe tổng quát dịp 8/3',
        excerpt: 'Ưu đãi đặc biệt nhân ngày Quốc tế Phụ nữ 8/3: Giảm 30% tất cả gói khám sức khỏe tổng quát cho chị em phụ nữ. Áp dụng từ 01/03 - 10/03/2026.',
        category: 'Khuyến mãi', date: '25/02/2026', author: 'Ban Quản lý', icon: '🌸'
    },
    {
        id: 6, title: 'Hội thảo: Cập nhật điều trị đái tháo đường type 2 năm 2026',
        excerpt: 'Khoa Nội tiết phối hợp Hội Nội tiết Việt Nam tổ chức hội thảo khoa học "Cập nhật chiến lược điều trị ĐTĐ type 2" vào ngày 25/03/2026 tại Hội trường bệnh viện.',
        category: 'Sự kiện', date: '05/03/2026', author: 'Khoa Nội tiết', icon: '📚'
    },
    {
        id: 7, title: 'Kỹ thuật can thiệp mạch vành qua da không cần phẫu thuật',
        excerpt: 'GS.TS Vũ Đình Hải chia sẻ về kỹ thuật PCI (can thiệp mạch vành qua da) mới nhất, giúp bệnh nhân tim mạch phục hồi nhanh hơn mà không cần phẫu thuật mở ngực.',
        category: 'Y học', date: '18/02/2026', author: 'GS.TS Vũ Đình Hải', icon: '❤️'
    },
    {
        id: 8, title: 'Khai trương phòng khám chuyên khoa Da liễu - Thẩm mỹ',
        excerpt: 'Bệnh viện chính thức mở phòng khám chuyên khoa Da liễu - Thẩm mỹ với trang thiết bị hiện đại nhất: Laser CO2 fractional, IPL, RF microneedling.',
        category: 'Tin tức', date: '12/02/2026', author: 'Ban Truyền thông', icon: '✨'
    },
];

export default function NewsPage() {
    const [selectedCat, setSelectedCat] = useState<string>('Tất cả');

    const filtered = newsData.filter((n) => selectedCat === 'Tất cả' || n.category === selectedCat);
    const featured = newsData.find((n) => n.featured);

    return (
        <div className="news-page">
            <div className="news-hero">
                <h1>Tin Tức & Sự Kiện</h1>
                <p>Cập nhật thông tin mới nhất từ Bệnh viện Đa khoa Hoàn Mỹ</p>
            </div>

            <div className="container news-content">
                {/* Featured Article */}
                {featured && selectedCat === 'Tất cả' && (
                    <div className="news-featured">
                        <div className="news-featured-icon">{featured.icon}</div>
                        <div className="news-featured-body">
                            <span className="news-cat-badge badge-featured">{featured.category}</span>
                            <h2>{featured.title}</h2>
                            <p>{featured.excerpt}</p>
                            <div className="news-meta">
                                <span>📅 {featured.date}</span>
                                <span>✍️ {featured.author}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Category filter */}
                <div className="news-filter">
                    {categories.map((c) => (
                        <button key={c} className={`news-filter-btn ${selectedCat === c ? 'active' : ''}`} onClick={() => setSelectedCat(c)}>
                            {c}
                        </button>
                    ))}
                </div>

                {/* News grid */}
                <div className="news-grid">
                    {filtered.filter((n) => !n.featured || selectedCat !== 'Tất cả').map((item) => (
                        <article key={item.id} className="news-card">
                            <div className="news-card-icon">{item.icon}</div>
                            <div className="news-card-body">
                                <span className={`news-cat-badge badge-${item.category.toLowerCase()}`}>{item.category}</span>
                                <h3>{item.title}</h3>
                                <p>{item.excerpt}</p>
                                <div className="news-meta">
                                    <span>📅 {item.date}</span>
                                    <span>✍️ {item.author}</span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
