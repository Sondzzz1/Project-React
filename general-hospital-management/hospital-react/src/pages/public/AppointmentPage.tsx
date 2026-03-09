import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import './AppointmentPage.css';

interface AppointmentForm {
    hoTen: string;
    soDienThoai: string;
    email: string;
    ngaySinh: string;
    gioiTinh: string;
    khoaKham: string;
    bacSi: string;
    ngayKham: string;
    gioKham: string;
    trieuChung: string;
    bhyt: string;
}

const departments = [
    { id: 'NK', name: 'Khoa Nội Tổng hợp' },
    { id: 'NGK', name: 'Khoa Ngoại Tổng hợp' },
    { id: 'SAN', name: 'Khoa Sản' },
    { id: 'NHI', name: 'Khoa Nhi' },
    { id: 'TM', name: 'Khoa Tim mạch' },
    { id: 'TK', name: 'Khoa Thần kinh' },
];

const doctorsByDept: Record<string, { id: string; name: string }[]> = {
    NK: [{ id: 'bs1', name: 'GS.TS Nguyễn Văn Minh' }, { id: 'bs9', name: 'PGS.TS Trần Thị Mai' }],
    NGK: [{ id: 'bs2', name: 'TS.BS Trần Quốc Hùng' }],
    SAN: [{ id: 'bs3', name: 'TS.BS Lê Thị Hương' }],
    NHI: [{ id: 'bs4', name: 'PGS.TS Phạm Văn Đức' }],
    TM: [{ id: 'bs5', name: 'GS.TS Vũ Đình Hải' }],
    TK: [{ id: 'bs7', name: 'TS.BS Đỗ Minh Quân' }],
};

const timeSlots = ['07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

const steps = [
    { num: 1, title: 'Chọn khoa & bác sĩ', icon: '🏥' },
    { num: 2, title: 'Chọn ngày giờ', icon: '📅' },
    { num: 3, title: 'Điền thông tin', icon: '📝' },
    { num: 4, title: 'Xác nhận', icon: '✅' },
];

export default function AppointmentPage() {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [form, setForm] = useState<AppointmentForm>({
        hoTen: '', soDienThoai: '', email: '', ngaySinh: '', gioiTinh: '',
        khoaKham: '', bacSi: '', ngayKham: '', gioKham: '', trieuChung: '', bhyt: '',
    });
    const [submitted, setSubmitted] = useState<boolean>(false);

    const availableDoctors = form.khoaKham ? (doctorsByDept[form.khoaKham] || []) : [];

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const nextStep = () => { if (currentStep < 4) setCurrentStep(currentStep + 1); };
    const prevStep = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

    const canNext = (): boolean => {
        if (currentStep === 1) return !!form.khoaKham;
        if (currentStep === 2) return !!form.ngayKham && !!form.gioKham;
        if (currentStep === 3) return !!form.hoTen && !!form.soDienThoai;
        return true;
    };

    if (submitted) {
        return (
            <div className="appt-page">
                <div className="appt-hero"><h1>Đặt Lịch Khám</h1><p>Đặt lịch hẹn trực tuyến dễ dàng, nhanh chóng</p></div>
                <div className="container appt-content">
                    <div className="appt-success">
                        <div className="appt-success-icon">🎉</div>
                        <h2>Đặt lịch thành công!</h2>
                        <p>Cảm ơn bạn đã đặt lịch khám tại Bệnh viện Hoàn Mỹ.</p>
                        <div className="appt-summary-card">
                            <div className="appt-sum-row"><span>Họ tên:</span><strong>{form.hoTen}</strong></div>
                            <div className="appt-sum-row"><span>Khoa:</span><strong>{departments.find(d => d.id === form.khoaKham)?.name}</strong></div>
                            <div className="appt-sum-row"><span>Bác sĩ:</span><strong>{availableDoctors.find(d => d.id === form.bacSi)?.name || 'Bệnh viện chỉ định'}</strong></div>
                            <div className="appt-sum-row"><span>Ngày khám:</span><strong>{form.ngayKham}</strong></div>
                            <div className="appt-sum-row"><span>Giờ khám:</span><strong>{form.gioKham}</strong></div>
                        </div>
                        <p className="appt-note">📱 Xác nhận sẽ được gửi qua SĐT <strong>{form.soDienThoai}</strong></p>
                        <Link to="/" className="appt-back-btn">← Về trang chủ</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="appt-page">
            <div className="appt-hero">
                <h1>Đặt Lịch Khám Online</h1>
                <p>Đặt lịch hẹn trực tuyến — Không cần xếp hàng — Tiết kiệm thời gian</p>
            </div>

            <div className="container appt-content">
                {/* Progress Steps */}
                <div className="appt-steps">
                    {steps.map((s) => (
                        <div key={s.num} className={`appt-step ${currentStep >= s.num ? 'active' : ''} ${currentStep === s.num ? 'current' : ''}`}>
                            <div className="appt-step-circle">{currentStep > s.num ? '✔' : s.icon}</div>
                            <span className="appt-step-label">{s.title}</span>
                        </div>
                    ))}
                </div>

                <form className="appt-form" onSubmit={handleSubmit}>
                    {/* Step 1: Choose Department & Doctor */}
                    {currentStep === 1 && (
                        <div className="appt-step-content">
                            <h2>Bước 1: Chọn Khoa & Bác sĩ</h2>
                            <div className="appt-dept-grid">
                                {departments.map((dept) => (
                                    <div key={dept.id} className={`appt-dept-card ${form.khoaKham === dept.id ? 'selected' : ''}`} onClick={() => setForm({ ...form, khoaKham: dept.id, bacSi: '' })}>
                                        <div className="appt-dept-icon">🏥</div>
                                        <h3>{dept.name}</h3>
                                    </div>
                                ))}
                            </div>
                            {form.khoaKham && availableDoctors.length > 0 && (
                                <div className="appt-doctor-select">
                                    <label>Chọn bác sĩ (không bắt buộc)</label>
                                    <select value={form.bacSi} onChange={(e) => setForm({ ...form, bacSi: e.target.value })}>
                                        <option value="">Để bệnh viện chỉ định</option>
                                        {availableDoctors.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Choose Date & Time */}
                    {currentStep === 2 && (
                        <div className="appt-step-content">
                            <h2>Bước 2: Chọn Ngày & Giờ Khám</h2>
                            <div className="appt-field">
                                <label>Ngày khám *</label>
                                <input type="date" value={form.ngayKham} min={new Date().toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, ngayKham: e.target.value })} />
                            </div>
                            {form.ngayKham && (
                                <div className="appt-timeslots">
                                    <label>Chọn giờ khám *</label>
                                    <div className="appt-time-grid">
                                        {timeSlots.map((t) => (
                                            <button type="button" key={t} className={`appt-time-btn ${form.gioKham === t ? 'active' : ''}`} onClick={() => setForm({ ...form, gioKham: t })}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Patient Info */}
                    {currentStep === 3 && (
                        <div className="appt-step-content">
                            <h2>Bước 3: Thông Tin Bệnh Nhân</h2>
                            <div className="appt-form-row">
                                <div className="appt-field"><label>Họ và tên *</label><input required value={form.hoTen} onChange={(e) => setForm({ ...form, hoTen: e.target.value })} placeholder="Nguyễn Văn A" /></div>
                                <div className="appt-field"><label>Số điện thoại *</label><input required value={form.soDienThoai} onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })} placeholder="0912 345 678" /></div>
                            </div>
                            <div className="appt-form-row">
                                <div className="appt-field"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" /></div>
                                <div className="appt-field"><label>Ngày sinh</label><input type="date" value={form.ngaySinh} onChange={(e) => setForm({ ...form, ngaySinh: e.target.value })} /></div>
                            </div>
                            <div className="appt-form-row">
                                <div className="appt-field">
                                    <label>Giới tính</label>
                                    <select value={form.gioiTinh} onChange={(e) => setForm({ ...form, gioiTinh: e.target.value })}>
                                        <option value="">-- Chọn --</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                                <div className="appt-field"><label>Số BHYT</label><input value={form.bhyt} onChange={(e) => setForm({ ...form, bhyt: e.target.value })} placeholder="Nếu có" /></div>
                            </div>
                            <div className="appt-field">
                                <label>Triệu chứng / Lý do khám</label>
                                <textarea rows={3} value={form.trieuChung} onChange={(e) => setForm({ ...form, trieuChung: e.target.value })} placeholder="Mô tả ngắn gọn triệu chứng..." />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Confirm */}
                    {currentStep === 4 && (
                        <div className="appt-step-content">
                            <h2>Bước 4: Xác Nhận Thông Tin</h2>
                            <div className="appt-confirm-card">
                                <div className="appt-confirm-section">
                                    <h3>📋 Thông tin khám</h3>
                                    <div className="appt-sum-row"><span>Khoa:</span><strong>{departments.find(d => d.id === form.khoaKham)?.name}</strong></div>
                                    <div className="appt-sum-row"><span>Bác sĩ:</span><strong>{availableDoctors.find(d => d.id === form.bacSi)?.name || 'Bệnh viện chỉ định'}</strong></div>
                                    <div className="appt-sum-row"><span>Ngày:</span><strong>{form.ngayKham}</strong></div>
                                    <div className="appt-sum-row"><span>Giờ:</span><strong>{form.gioKham}</strong></div>
                                </div>
                                <div className="appt-confirm-section">
                                    <h3>👤 Thông tin bệnh nhân</h3>
                                    <div className="appt-sum-row"><span>Họ tên:</span><strong>{form.hoTen}</strong></div>
                                    <div className="appt-sum-row"><span>SĐT:</span><strong>{form.soDienThoai}</strong></div>
                                    {form.email && <div className="appt-sum-row"><span>Email:</span><strong>{form.email}</strong></div>}
                                    {form.trieuChung && <div className="appt-sum-row"><span>Triệu chứng:</span><strong>{form.trieuChung}</strong></div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="appt-nav">
                        {currentStep > 1 && <button type="button" className="appt-nav-btn appt-btn-back" onClick={prevStep}>← Quay lại</button>}
                        <div style={{ flex: 1 }} />
                        {currentStep < 4 ? (
                            <button type="button" className="appt-nav-btn appt-btn-next" onClick={nextStep} disabled={!canNext()}>Tiếp theo →</button>
                        ) : (
                            <button type="submit" className="appt-nav-btn appt-btn-submit">✅ Xác nhận đặt lịch</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
