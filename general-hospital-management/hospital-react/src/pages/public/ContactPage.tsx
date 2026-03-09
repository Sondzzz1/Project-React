import { useState, FormEvent } from 'react';
import './ContactPage.css';

interface ContactForm {
    hoTen: string;
    email: string;
    soDienThoai: string;
    chuDe: string;
    noiDung: string;
}

export default function ContactPage() {
    const [form, setForm] = useState<ContactForm>({ hoTen: '', email: '', soDienThoai: '', chuDe: '', noiDung: '' });
    const [sent, setSent] = useState<boolean>(false);
    const [sending, setSending] = useState<boolean>(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSending(true);
        // Simulate API call
        setTimeout(() => { setSent(true); setSending(false); }, 1500);
    };

    return (
        <div className="contact-page">
            <div className="contact-hero">
                <h1>Liên Hệ</h1>
                <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
            </div>

            <div className="container contact-content">
                {/* Info Cards */}
                <div className="contact-cards">
                    <div className="contact-info-card">
                        <div className="contact-info-icon">📍</div>
                        <h3>Địa chỉ</h3>
                        <p>123 Nguyễn Văn Linh,<br />Quận 7, TP. Hồ Chí Minh</p>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">📞</div>
                        <h3>Hotline 24/7</h3>
                        <p className="contact-highlight">1900 1234</p>
                        <p>Hỗ trợ tư vấn miễn phí</p>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">✉️</div>
                        <h3>Email</h3>
                        <p>contact@hoanmy.vn</p>
                        <p>support@hoanmy.vn</p>
                    </div>
                    <div className="contact-info-card">
                        <div className="contact-info-icon">🕐</div>
                        <h3>Giờ làm việc</h3>
                        <p>T2 - T6: 7:00 - 17:00</p>
                        <p>T7: 7:00 - 12:00</p>
                        <p><strong>Cấp cứu: 24/7</strong></p>
                    </div>
                </div>

                {/* Map + Form */}
                <div className="contact-main">
                    <div className="contact-map-wrap">
                        <h2>📍 Bản đồ</h2>
                        <div className="contact-map">
                            <iframe
                                title="Bản đồ Bệnh viện"
                                width="100%"
                                height="400"
                                style={{ border: 0, borderRadius: 12 }}
                                loading="lazy"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0!2d106.7!3d10.73!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQzJzQ4LjAiTiAxMDbCsDQyJzAwLjAiRQ!5e0!3m2!1svi!2s!4v0"
                            />
                        </div>
                    </div>

                    <div className="contact-form-wrap">
                        <h2>✉️ Gửi Tin Nhắn</h2>
                        {sent ? (
                            <div className="contact-success">
                                <div className="contact-success-icon">✅</div>
                                <h3>Gửi thành công!</h3>
                                <p>Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng 24 giờ.</p>
                                <button className="contact-btn-reset" onClick={() => { setSent(false); setForm({ hoTen: '', email: '', soDienThoai: '', chuDe: '', noiDung: '' }); }}>
                                    Gửi tin nhắn khác
                                </button>
                            </div>
                        ) : (
                            <form className="contact-form" onSubmit={handleSubmit}>
                                <div className="contact-form-row">
                                    <div className="contact-field">
                                        <label>Họ và tên *</label>
                                        <input required value={form.hoTen} onChange={(e) => setForm({ ...form, hoTen: e.target.value })} placeholder="Nguyễn Văn A" />
                                    </div>
                                    <div className="contact-field">
                                        <label>Email *</label>
                                        <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
                                    </div>
                                </div>
                                <div className="contact-form-row">
                                    <div className="contact-field">
                                        <label>Số điện thoại</label>
                                        <input value={form.soDienThoai} onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })} placeholder="0912 345 678" />
                                    </div>
                                    <div className="contact-field">
                                        <label>Chủ đề</label>
                                        <select value={form.chuDe} onChange={(e) => setForm({ ...form, chuDe: e.target.value })}>
                                            <option value="">-- Chọn chủ đề --</option>
                                            <option value="tuvan">Tư vấn sức khỏe</option>
                                            <option value="datlich">Đặt lịch khám</option>
                                            <option value="khieunai">Khiếu nại / Góp ý</option>
                                            <option value="tuyendung">Tuyển dụng</option>
                                            <option value="khac">Khác</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="contact-field">
                                    <label>Nội dung *</label>
                                    <textarea required rows={5} value={form.noiDung} onChange={(e) => setForm({ ...form, noiDung: e.target.value })} placeholder="Nhập nội dung tin nhắn của bạn..." />
                                </div>
                                <button type="submit" className="contact-submit-btn" disabled={sending}>
                                    {sending ? '⏳ Đang gửi...' : '📨 Gửi tin nhắn'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
