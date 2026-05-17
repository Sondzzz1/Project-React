import { useState, useEffect, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axiosPublic from '../../services/axiosPublic';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../constant/api';
import './AppointmentPage.css';

// ─── Local types ────────────────────────────────────────────────────────────────

interface DeptItem {
    id: number;
    tenKhoa: string;
    moTa?: string;
}

interface DoctorItem {
    id: string;       // GUID
    hoTen: string;
    chuyenKhoa?: string;
    khoaId?: string | number | null;
    tenKhoa?: string;
}

interface AppointmentForm {
    hoTen: string;
    soDienThoai: string;
    email: string;
    ngaySinh: string;
    gioiTinh: string;
    /** ID số của KhoaPhong – dùng để filter bác sĩ */
    khoaKhamId: string;
    /** Tên khoa – gửi lên backend field khoaKham */
    khoaKhamTen: string;
    /** GUID thực của BacSi – gửi lên backend field bacSiId */
    bacSiId: string;
    /** Tên bác sĩ – chỉ hiển thị */
    bacSiTen: string;
    ngayKham: string;
    gioKham: string;
    trieuChung: string;
    bhyt: string;
}

const TIME_SLOTS = [
    '07:30', '08:00', '08:30', '09:00', '09:30', '10:00',
    '10:30', '11:00', '14:00', '14:30', '15:00', '15:30', '16:00',
];

const STEPS = [
    { num: 1, title: 'Chọn khoa & bác sĩ', icon: '🏥' },
    { num: 2, title: 'Chọn ngày giờ',       icon: '📅' },
    { num: 3, title: 'Điền thông tin',       icon: '📝' },
    { num: 4, title: 'Xác nhận',             icon: '✅' },
];

const EMPTY_FORM: AppointmentForm = {
    hoTen: '', soDienThoai: '', email: '', ngaySinh: '', gioiTinh: '',
    khoaKhamId: '', khoaKhamTen: '',
    bacSiId: '', bacSiTen: '',
    ngayKham: '', gioKham: '', trieuChung: '', bhyt: '',
};

const FALLBACK_DEPARTMENTS: DeptItem[] = [
    { id: 1, tenKhoa: 'Khoa Nội Tổng hợp', moTa: 'Khám và điều trị các bệnh nội khoa' },
    { id: 2, tenKhoa: 'Khoa Ngoại Tổng hợp', moTa: 'Phẫu thuật và điều trị ngoại khoa' },
    { id: 3, tenKhoa: 'Khoa Sản', moTa: 'Chăm sóc mẹ và bé' },
    { id: 4, tenKhoa: 'Khoa Nhi', moTa: 'Chăm sóc sức khỏe trẻ em' },
    { id: 5, tenKhoa: 'Khoa Tim mạch', moTa: 'Chuyên khoa tim mạch' },
    { id: 6, tenKhoa: 'Khoa Cấp cứu', moTa: 'Trực cấp cứu 24/7' },
];

const FALLBACK_DOCTORS: DoctorItem[] = [
    { id: 'd1', hoTen: 'GS.TS.BS Nguyễn Văn Minh', chuyenKhoa: 'Nội khoa', khoaId: '1' },
    { id: 'd2', hoTen: 'TS.BS Trần Quốc Hùng', chuyenKhoa: 'Ngoại khoa', khoaId: '2' },
    { id: 'd3', hoTen: 'TS.BS Lê Thị Hương', chuyenKhoa: 'Sản khoa', khoaId: '3' },
];

// ─── Helper: safely unwrap API response (array OR {data:[]} OR {success,data:[]}) ──
function unwrapArray<T>(raw: unknown): T[] {
    if (Array.isArray(raw)) return raw as T[];
    if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>;
        if (Array.isArray(obj['data'])) return obj['data'] as T[];
    }
    return [];
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function AppointmentPage() {
    const { user, isAuthenticated } = useAuth();
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [form, setForm] = useState<AppointmentForm>(EMPTY_FORM);
    
    // Tự động điền thông tin nếu đã đăng nhập
    useEffect(() => {
        if (isAuthenticated && user) {
            setForm(prev => ({
                ...prev,
                hoTen: prev.hoTen || user.fullName || user.hoTen || '',
                soDienThoai: prev.soDienThoai || (user as any).soDienThoai || '',
                email: prev.email || user.email || '',
            }));
        }
    }, [isAuthenticated, user]);
    const [submitted, setSubmitted]   = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string>('');

    // Data from API
    const [departments, setDepartments]  = useState<DeptItem[]>([]);
    const [allDoctors, setAllDoctors]    = useState<DoctorItem[]>([]);
    const [loadingData, setLoadingData]  = useState<boolean>(true);
    const [loadError, setLoadError]      = useState<string>('');

    // ── Fetch departments & doctors once on mount ──────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            setLoadError('');
            try {
                console.log('[AppointmentPage] Bắt đầu tải dữ liệu khoa và bác sĩ...');
                const [deptRes, docRes] = await Promise.allSettled([
                    axiosPublic.get(`${ENDPOINTS.DEPARTMENT}/get-all`),
                    axiosPublic.get(`${ENDPOINTS.DOCTOR}/doctors`),
                ]);

                if (deptRes.status === 'fulfilled') {
                    const data = unwrapArray<DeptItem>(deptRes.value.data);
                    console.log('[AppointmentPage] Tải danh sách khoa thành công:', data.length);
                    setDepartments(data);
                } else {
                    const error = deptRes.reason;
                    const status = error?.response?.status;
                    console.error('[AppointmentPage] Lỗi tải danh sách khoa:', error);
                    
                    if (status === 401 || status === 403) {
                        console.warn('[AppointmentPage] Truy cập bị chặn, sử dụng dữ liệu dự phòng (Fallback).');
                        setDepartments(FALLBACK_DEPARTMENTS);
                    } else {
                        setLoadError(`Không thể tải danh sách khoa. (${status || 'Network Error'})`);
                    }
                }

                if (docRes.status === 'fulfilled') {
                    const data = unwrapArray<DoctorItem>(docRes.value.data);
                    console.log('[AppointmentPage] Tải danh sách bác sĩ thành công:', data.length);
                    setAllDoctors(data);
                } else {
                    console.warn('[AppointmentPage] Không tải được danh sách bác sĩ, sử dụng dữ liệu dự phòng.');
                    setAllDoctors(FALLBACK_DOCTORS);
                }
            } catch (err) {
                console.error('[AppointmentPage] fetchData unexpected error:', err);
                setLoadError('Có lỗi hệ thống khi tải dữ liệu. Vui lòng tải lại trang.');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // ── Bác sĩ lọc theo khoa đang chọn ────────────────────────────────────────
    // Fallback: nếu không có bác sĩ nào có khoaId khớp → hiện toàn bộ bác sĩ
    const doctorsByKhoa: DoctorItem[] = (() => {
        if (!form.khoaKhamId || allDoctors.length === 0) return [];
        const filtered = allDoctors.filter(
            (d) => d.khoaId != null && String(d.khoaId) === String(form.khoaKhamId)
        );
        // Nếu không có bác sĩ nào thuộc khoa này → trả về tất cả bác sĩ
        return filtered.length > 0 ? filtered : allDoctors;
    })();

    // ── Chọn khoa ─────────────────────────────────────────────────────────────
    const handleSelectDept = (dept: DeptItem) => {
        setForm(prev => ({
            ...prev,
            khoaKhamId:  String(dept.id),
            khoaKhamTen: dept.tenKhoa,
            bacSiId:     '',
            bacSiTen:    '',
        }));
    };

    // ── Chọn bác sĩ ───────────────────────────────────────────────────────────
    const handleSelectDoctor = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const guid = e.target.value;
        const doc  = allDoctors.find(d => d.id === guid);
        setForm(prev => ({
            ...prev,
            bacSiId:  guid,
            bacSiTen: doc?.hoTen || '',
        }));
    };

    // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        try {
            // Chuẩn hóa giờ khám sang HH:mm:ss (TimeSpan yêu cầu)
            let formattedGioKham = form.gioKham;
            if (formattedGioKham && formattedGioKham.length === 5) {
                formattedGioKham = `${formattedGioKham}:00`;
            }

            // Kiểm tra BacSiId (Chỉ chặn các ID fallback như d1, d2, d3 hoặc empty GUID)
            const isFallbackId = form.bacSiId.startsWith('d') && form.bacSiId.length < 5;
            if (!form.bacSiId || isFallbackId || form.bacSiId === "00000000-0000-0000-0000-000000000000") {
                setSubmitError('Vui lòng quay lại Bước 1 và chọn một bác sĩ cụ thể.');
                setSubmitting(false);
                return;
            }
            const sanitizedBacSiId = form.bacSiId;

            // C# DateTime cần định dạng ISO đầy đủ hoặc YYYY-MM-DD
            // C# TimeSpan cần HH:mm:ss
            const payload = {
                benhNhanId: user?.id,
                bacSiId:    sanitizedBacSiId,
                ngayKham:   `${form.ngayKham}T00:00:00`, // Chuyển về ISO DateTime
                gioKham:    formattedGioKham,
                lyDoKham:   form.trieuChung || "Khám bệnh",
                ghiChu:     `Đăng ký qua Web - ${form.hoTen} (${form.soDienThoai})`
            };

            console.log('[AppointmentPage] Gửi yêu cầu đặt lịch (Chuẩn Backend):', payload);

            // Backend yêu cầu [Authorize] -> PHẢI dùng axiosInstance
            let res = await axiosInstance.post(`${ENDPOINTS.APPOINTMENT}/dat-lich`, payload);
            console.log('[AppointmentPage] 🎉 Đặt lịch thành công!');
            setSubmitted(true);
        } catch (err: any) {
            console.error('[AppointmentPage] Submit error:', err);
            
            const errorData = err.response?.data;
            const errorMsg = (typeof errorData === 'string' ? errorData : errorData?.message) || "";
            
            // Nếu thất bại vì bệnh nhân chưa có profile (thường gặp khi mới đăng ký user)
            if (errorMsg.toLowerCase().includes('bệnh nhân không tồn tại') || 
                errorMsg.toLowerCase().includes('patient not found')) {
                
                console.warn('[AppointmentPage] Bệnh nhân chưa có profile y tế. Đang tiến hành khởi tạo hồ sơ tự động...');
                
                const patientProfile = {
                    id: user?.id,
                    hoTen: form.hoTen.trim(),
                    ngaySinh: form.ngaySinh || "2000-01-01",
                    gioiTinh: form.gioiTinh || "Nam",
                    diaChi: "Chưa cập nhật (Tự động tạo từ Web)",
                    soTheBaoHiem: form.bhyt || "",
                    trangThai: "Đang hoạt động"
                };

                try {
                    console.log('[AppointmentPage] Đang gọi API tạo hồ sơ:', patientProfile);
                    await axiosInstance.post(`${ENDPOINTS.PATIENT}/create`, patientProfile).catch(e => {
                        console.warn('[AppointmentPage] Profile creation warning (possibly already exists):', e.response?.status);
                    });

                    console.log('[AppointmentPage] ✅ Đã xử lý hồ sơ. Đang gửi lại yêu cầu đặt lịch...');
                    await axiosInstance.post(`${ENDPOINTS.APPOINTMENT}/dat-lich`, payload);
                    
                    console.log('[AppointmentPage] 🎉 Đặt lịch thành công sau khi tạo hồ sơ!');
                    setSubmitted(true);
                    return; // Thoát nếu thành công
                } catch (retryErr: any) {
                    console.error('[AppointmentPage] ❌ Lỗi khi thử lại:', retryErr);
                }
            }

            // Nếu không phải lỗi "không tồn tại" hoặc retry vẫn lỗi thì hiển thị thông báo
            let msg = 'Có lỗi xảy ra khi đặt lịch.';
            if (errorData) {
                if (typeof errorData === 'string') msg = errorData;
                else if (errorData.message) msg = errorData.message;
                else if (errorData.errors) {
                    msg = "Dữ liệu không hợp lệ: " + Object.values(errorData.errors).flat().join(', ');
                }
            }
            setSubmitError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Navigation ─────────────────────────────────────────────────────────────
    const nextStep = () => setCurrentStep(s => Math.min(s + 1, 4));
    const prevStep = () => setCurrentStep(s => Math.max(s - 1, 1));

    const canNext = (): boolean => {
        if (currentStep === 1) return !!form.khoaKhamId;
        if (currentStep === 2) return !!form.ngayKham && !!form.gioKham;
        if (currentStep === 3) return !!form.hoTen.trim() && !!form.soDienThoai.trim();
        return true;
    };

    // ── Success screen ─────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="appt-page">
                <div className="appt-hero">
                    <h1>Đặt Lịch Khám</h1>
                    <p>Đặt lịch hẹn trực tuyến dễ dàng, nhanh chóng</p>
                </div>
                <div className="container appt-content">
                    <div className="appt-success">
                        <div className="appt-success-icon">🎉</div>
                        <h2>Đặt lịch thành công!</h2>
                        <p>Cảm ơn bạn đã đặt lịch khám tại Bệnh viện Hoàn Mỹ.</p>
                        <p className="appt-note">
                            📱 Xác nhận đã được gửi qua SĐT <strong>{form.soDienThoai}</strong>
                        </p>
                        <div className="appt-summary-card">
                            <div className="appt-sum-row"><span>Họ tên:</span>   <strong>{form.hoTen}</strong></div>
                            <div className="appt-sum-row"><span>Khoa:</span>      <strong>{form.khoaKhamTen}</strong></div>
                            <div className="appt-sum-row"><span>Bác sĩ:</span>   <strong>{form.bacSiTen || 'Bệnh viện chỉ định'}</strong></div>
                            <div className="appt-sum-row"><span>Ngày khám:</span><strong>{form.ngayKham}</strong></div>
                            <div className="appt-sum-row"><span>Giờ khám:</span> <strong>{form.gioKham}</strong></div>
                        </div>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
                            💡 Vui lòng mang theo CCCD/CMND và thẻ BHYT (nếu có) khi đến khám
                        </p>
                        <Link to="/" className="appt-back-btn">← Về trang chủ</Link>
                    </div>
                </div>
            </div>
        );
    }

    // ── Main form ──────────────────────────────────────────────────────────────
    return (
        <div className="appt-page">
            <div className="appt-hero">
                <h1>Đặt Lịch Khám Online</h1>
                <p>Đặt lịch hẹn trực tuyến — Không cần xếp hàng — Tiết kiệm thời gian</p>
            </div>

            <div className="container appt-content">
                {/* ── Progress Steps ── */}
                <div className="appt-steps">
                    {STEPS.map((s) => (
                        <div
                            key={s.num}
                            className={`appt-step ${currentStep >= s.num ? 'active' : ''} ${currentStep === s.num ? 'current' : ''}`}
                        >
                            <div className="appt-step-circle">{currentStep > s.num ? '✔' : s.icon}</div>
                            <span className="appt-step-label">{s.title}</span>
                        </div>
                    ))}
                </div>

                <form className="appt-form" onSubmit={handleSubmit}>

                    {/* Submit error */}
                    {submitError && (
                        <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>
                            ⚠️ {submitError}
                        </div>
                    )}

                    {/* ════ BƯỚC 1: Chọn Khoa & Bác sĩ ════ */}
                    {currentStep === 1 && (
                        <div className="appt-step-content">
                            <h2>Bước 1: Chọn Khoa &amp; Bác sĩ</h2>

                            {/* Loading / Error khi fetch */}
                            {loadingData && (
                                <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    ⏳ Đang tải danh sách khoa...
                                </p>
                            )}
                            {!loadingData && loadError && (
                                <div style={{ padding: '0.75rem 1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>
                                    {loadError}
                                </div>
                            )}

                            {/* Grid chọn khoa */}
                            {!loadingData && departments.length > 0 && (
                                <div className="appt-dept-grid">
                                    {departments.map((dept) => (
                                        <div
                                            key={dept.id}
                                            className={`appt-dept-card ${form.khoaKhamId === String(dept.id) ? 'selected' : ''}`}
                                            onClick={() => handleSelectDept(dept)}
                                        >
                                            <div className="appt-dept-icon">🏥</div>
                                            <h3>{dept.tenKhoa}</h3>
                                            {dept.moTa && <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>{dept.moTa}</p>}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Combobox bác sĩ – hiện sau khi chọn khoa */}
                            {!loadingData && form.khoaKhamId && (
                                <div className="appt-doctor-select">
                                    <label>Chọn bác sĩ *</label>
                                    <select value={form.bacSiId} onChange={handleSelectDoctor}>
                                        <option value="">-- Để bệnh viện chỉ định --</option>
                                        {doctorsByKhoa.length > 0
                                            ? doctorsByKhoa.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.hoTen}{d.chuyenKhoa ? ` — ${d.chuyenKhoa}` : ''}
                                                    {/* Hiện tên khoa nếu đang dùng fallback (hiện tất cả) */}
                                                    {d.tenKhoa && String(d.khoaId) !== form.khoaKhamId
                                                        ? ` (${d.tenKhoa})`
                                                        : ''}
                                                </option>
                                              ))
                                            : <option disabled value="">(Chưa có bác sĩ)</option>
                                        }
                                    </select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════ BƯỚC 2: Chọn Ngày & Giờ ════ */}
                    {currentStep === 2 && (
                        <div className="appt-step-content">
                            <h2>Bước 2: Chọn Ngày &amp; Giờ Khám</h2>
                            <div className="appt-field">
                                <label>Ngày khám *</label>
                                <input
                                    type="date"
                                    value={form.ngayKham}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setForm(prev => ({ ...prev, ngayKham: e.target.value }))}
                                />
                            </div>
                            {form.ngayKham && (
                                <div className="appt-timeslots">
                                    <label>Chọn giờ khám *</label>
                                    <div className="appt-time-grid">
                                        {TIME_SLOTS.map((t) => (
                                            <button
                                                type="button"
                                                key={t}
                                                className={`appt-time-btn ${form.gioKham === t ? 'active' : ''}`}
                                                onClick={() => setForm(prev => ({ ...prev, gioKham: t }))}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ════ BƯỚC 3: Thông Tin Bệnh Nhân ════ */}
                    {currentStep === 3 && (
                        <div className="appt-step-content">
                            <h2>Bước 3: Thông Tin Bệnh Nhân</h2>
                            <div className="appt-form-row">
                                <div className="appt-field">
                                    <label>Họ và tên *</label>
                                    <input
                                        required
                                        value={form.hoTen}
                                        onChange={(e) => setForm(prev => ({ ...prev, hoTen: e.target.value }))}
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div className="appt-field">
                                    <label>Số điện thoại *</label>
                                    <input
                                        required
                                        value={form.soDienThoai}
                                        onChange={(e) => setForm(prev => ({ ...prev, soDienThoai: e.target.value }))}
                                        placeholder="0912 345 678"
                                    />
                                </div>
                            </div>
                            <div className="appt-form-row">
                                <div className="appt-field">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div className="appt-field">
                                    <label>Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={form.ngaySinh}
                                        onChange={(e) => setForm(prev => ({ ...prev, ngaySinh: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="appt-form-row">
                                <div className="appt-field">
                                    <label>Giới tính</label>
                                    <select
                                        value={form.gioiTinh}
                                        onChange={(e) => setForm(prev => ({ ...prev, gioiTinh: e.target.value }))}
                                    >
                                        <option value="">-- Chọn --</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nữ">Nữ</option>
                                    </select>
                                </div>
                                <div className="appt-field">
                                    <label>Số BHYT</label>
                                    <input
                                        value={form.bhyt}
                                        onChange={(e) => setForm(prev => ({ ...prev, bhyt: e.target.value }))}
                                        placeholder="Nếu có"
                                    />
                                </div>
                            </div>
                            <div className="appt-field">
                                <label>Triệu chứng / Lý do khám</label>
                                <textarea
                                    rows={3}
                                    value={form.trieuChung}
                                    onChange={(e) => setForm(prev => ({ ...prev, trieuChung: e.target.value }))}
                                    placeholder="Mô tả ngắn gọn triệu chứng..."
                                />
                            </div>
                        </div>
                    )}

                    {/* ════ BƯỚC 4: Xác Nhận ════ */}
                    {currentStep === 4 && (
                        <div className="appt-step-content">
                            <h2>Bước 4: Xác Nhận Thông Tin</h2>
                            <div className="appt-confirm-card">
                                <div className="appt-confirm-section">
                                    <h3>📋 Thông tin khám</h3>
                                    <div className="appt-sum-row"><span>Khoa:</span>      <strong>{form.khoaKhamTen}</strong></div>
                                    <div className="appt-sum-row"><span>Bác sĩ:</span>   <strong>{form.bacSiTen || 'Bệnh viện chỉ định'}</strong></div>
                                    <div className="appt-sum-row"><span>Ngày:</span>      <strong>{form.ngayKham}</strong></div>
                                    <div className="appt-sum-row"><span>Giờ:</span>       <strong>{form.gioKham}</strong></div>
                                </div>
                                <div className="appt-confirm-section">
                                    <h3>👤 Thông tin bệnh nhân</h3>
                                    <div className="appt-sum-row"><span>Họ tên:</span>   <strong>{form.hoTen}</strong></div>
                                    <div className="appt-sum-row"><span>SĐT:</span>       <strong>{form.soDienThoai}</strong></div>
                                    {form.email      && <div className="appt-sum-row"><span>Email:</span>      <strong>{form.email}</strong></div>}
                                    {form.gioiTinh   && <div className="appt-sum-row"><span>Giới tính:</span> <strong>{form.gioiTinh}</strong></div>}
                                    {form.ngaySinh   && <div className="appt-sum-row"><span>Ngày sinh:</span> <strong>{form.ngaySinh}</strong></div>}
                                    {form.trieuChung && <div className="appt-sum-row"><span>Triệu chứng:</span><strong>{form.trieuChung}</strong></div>}
                                    {form.bhyt       && <div className="appt-sum-row"><span>Số BHYT:</span>   <strong>{form.bhyt}</strong></div>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Navigation ── */}
                    <div className="appt-nav">
                        {currentStep > 1 && (
                            <button type="button" className="appt-nav-btn appt-btn-back" onClick={prevStep}>
                                ← Quay lại
                            </button>
                        )}
                        <div style={{ flex: 1 }} />
                        {currentStep < 4 ? (
                            <button
                                type="button"
                                className="appt-nav-btn appt-btn-next"
                                onClick={nextStep}
                                disabled={!canNext() || (currentStep === 1 && loadingData)}
                            >
                                Tiếp theo →
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="appt-nav-btn appt-btn-submit"
                                disabled={submitting}
                            >
                                {submitting ? '⏳ Đang xử lý...' : '✅ Xác nhận đặt lịch'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
