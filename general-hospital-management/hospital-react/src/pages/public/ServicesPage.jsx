import './ServicesPage.css';

const serviceCategories = [
    {
        title: 'Khám & Chẩn đoán',
        items: [
            { icon: '🩺', name: 'Khám Sức khỏe Tổng quát', desc: 'Gói khám từ cơ bản đến cao cấp với 45+ hạng mục xét nghiệm', price: 'Từ 1.500.000 VNĐ' },
            { icon: '🔬', name: 'Xét nghiệm & Chẩn đoán', desc: 'Phòng Lab đạt chuẩn ISO 15189, kết quả trong 2-4 giờ', price: '200+ loại xét nghiệm' },
            { icon: '📷', name: 'Chẩn đoán Hình ảnh', desc: 'MRI 3.0 Tesla, CT Scanner 256 lát cắt, X-quang kỹ thuật số', price: 'Kết quả nhanh' },
        ]
    },
    {
        title: 'Điều trị & Phẫu thuật',
        items: [
            { icon: '💉', name: 'Phẫu thuật Nội soi', desc: '8 phòng mổ vô trùng, nội soi 3D, robot Da Vinci', price: 'Tỷ lệ thành công 98.5%' },
            { icon: '❤️', name: 'Tim mạch Can thiệp', desc: 'Đặt stent mạch vành, cấy máy tạo nhịp, siêu âm tim 4D', price: 'Chuyên gia đầu ngành' },
            { icon: '🧠', name: 'Thần kinh', desc: 'Điều trị đột quỵ, Parkinson, động kinh', price: 'Công nghệ tiên tiến' },
        ]
    },
    {
        title: 'Chăm sóc Đặc biệt',
        items: [
            { icon: '🤰', name: 'Thai sản Trọn gói', desc: 'Khám thai định kỳ, sinh thường, sinh mổ, hậu sản', price: 'Từ 25.000.000 VNĐ' },
            { icon: '🚑', name: 'Cấp cứu 24/7', desc: 'Phòng cấp cứu 20 giường, đội ngũ trực 24/24', price: 'Hotline: 1900 1234' },
            { icon: '💊', name: 'Nhà thuốc', desc: 'Đầy đủ thuốc theo đơn và không đơn, tư vấn dược', price: 'Mở cửa 6:00 - 22:00' },
        ]
    }
];

export default function ServicesPage() {
    return (
        <div className="services-page">
            <div className="svc-hero">
                <h1>Dịch vụ Y tế</h1>
                <p>Đa dạng dịch vụ y tế chất lượng cao với đội ngũ chuyên gia hàng đầu</p>
            </div>
            <div className="container svc-content">
                {serviceCategories.map((cat, i) => (
                    <div key={i} className="svc-category">
                        <h2 className="svc-cat-title">{cat.title}</h2>
                        <div className="svc-grid">
                            {cat.items.map((s, j) => (
                                <div key={j} className="svc-card">
                                    <div className="svc-icon">{s.icon}</div>
                                    <h3>{s.name}</h3>
                                    <p>{s.desc}</p>
                                    <div className="svc-price">{s.price}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
