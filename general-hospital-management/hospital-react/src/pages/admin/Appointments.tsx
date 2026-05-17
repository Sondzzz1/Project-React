import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { appointmentApi, doctorApi } from '../../services';
import './AdminPages.css';

interface Appointment {
    id: string;
    benhNhanId: string;
    tenBenhNhan: string;
    soDienThoai?: string;
    bacSiId: string;
    tenBacSi: string;
    khoaKham?: string;
    ngayKham: string;
    gioKham: string;
    lyDoKham?: string;
    trangThai: 'ChoXacNhan' | 'DaXacNhan' | 'HoanThanh' | 'DaHuy' | 'TuChoi';
    ghiChu?: string;
}

interface DoctorLookup {
    id?: string;
    hoTen?: string;
    email?: string;
    soDienThoai?: string;
    thongTinLienHe?: string;
}

const normalizeText = (value?: string) =>
    (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

const normalizePhone = (value?: string) => (value || '').replace(/\D/g, '');

const normalizeStatus = (status?: string): Appointment['trangThai'] => {
    const raw = (status || '').trim();
    const text = normalizeText(raw);

    if (raw === 'ChoXacNhan' || text === 'cho xac nhan') return 'ChoXacNhan';
    if (raw === 'DaXacNhan' || text === 'da xac nhan') return 'DaXacNhan';
    if (raw === 'HoanThanh' || text === 'hoan thanh' || text === 'da kham') return 'HoanThanh';
    if (raw === 'DaHuy' || text === 'da huy') return 'DaHuy';
    if (raw === 'TuChoi' || text === 'tu choi' || text === 'da tu choi') return 'TuChoi';

    return 'ChoXacNhan';
};

const extractPhoneFromNote = (note?: string) => note?.match(/\(([^)]+)\)/)?.[1];

const normalizeAppointment = (raw: any): Appointment => ({
    id: raw.id || raw.Id,
    benhNhanId: raw.benhNhanId || raw.BenhNhanId,
    tenBenhNhan: raw.tenBenhNhan || raw.TenBenhNhan || '—',
    soDienThoai: raw.soDienThoai || raw.SoDienThoai || extractPhoneFromNote(raw.ghiChu || raw.GhiChu),
    bacSiId: raw.bacSiId || raw.BacSiId,
    tenBacSi: raw.tenBacSi || raw.TenBacSi || '—',
    khoaKham: raw.khoaKham || raw.KhoaKham || raw.tenKhoa || raw.TenKhoa || raw.chuyenKhoa || raw.ChuyenKhoa,
    ngayKham: raw.ngayKham || raw.NgayKham,
    gioKham: raw.gioKham || raw.GioKham,
    lyDoKham: raw.lyDoKham || raw.LyDoKham,
    trangThai: normalizeStatus(raw.trangThai || raw.TrangThai),
    ghiChu: raw.ghiChu || raw.GhiChu,
});

const unwrapItems = (response: any): any[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.items)) return response.items;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.items)) return response.data.items;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.data?.items)) return response.data.data.items;
    return [];
};

const unwrapDoctors = (response: any): DoctorLookup[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
};

export default function AppointmentsPage() {
    const { user } = useAuth();
    const { role, canDelete } = usePermissions();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');

    useEffect(() => {
        loadAppointments();
    }, [filterDate, filterStatus, role, user?.id]);

    const resolveDoctorId = async () => {
        if (role !== 'BacSi' || !user?.id) return undefined;

        const userId = String(user.id);
        try {
            const doctors = unwrapDoctors(await doctorApi.getAll());
            const userEmail = normalizeText((user as any).email || (user as any).Email);
            const userPhone = normalizePhone((user as any).soDienThoai || (user as any).SoDienThoai || (user as any).phoneNumber);
            const userName = normalizeText((user as any).hoTen || (user as any).fullName || (user as any).HoTen);
            const username = normalizeText((user as any).tenDangNhap || (user as any).username || (user as any).TenDangNhap);

            const matchedDoctor = doctors.find((doctor) => {
                const doctorId = String(doctor.id || '');
                const doctorEmail = normalizeText(doctor.email);
                const doctorPhone = normalizePhone(doctor.soDienThoai || doctor.thongTinLienHe);
                const doctorName = normalizeText(doctor.hoTen);
                const doctorEmailUser = normalizeText(doctor.email?.split('@')[0]);

                return doctorId === userId ||
                    (!!userEmail && userEmail === doctorEmail) ||
                    (!!userPhone && userPhone === doctorPhone) ||
                    (!!userName && userName === doctorName) ||
                    (!!username && username === doctorEmailUser);
            });

            return matchedDoctor?.id || userId;
        } catch (error) {
            console.warn('Không resolve được BacSiId từ tài khoản hiện tại, dùng user.id làm fallback:', error);
            return userId;
        }
    };

    const loadAppointments = async () => {
        try {
            setLoading(true);
            
            const searchParams: any = {
                pageIndex: 1,
                pageSize: 100,
            };
            
            if (role === 'BacSi' && user?.id) {
                searchParams.bacSiId = await resolveDoctorId();
            } else if (role === 'BenhNhan' && user?.id) {
                searchParams.benhNhanId = user.id;
            }
            
            if (filterDate) {
                searchParams.tuNgay = `${filterDate}T00:00:00`;
                searchParams.denNgay = `${filterDate}T23:59:59`;
            }
            if (filterStatus) {
                searchParams.trangThai = filterStatus;
            }
            
            const response = await appointmentApi.getDanhSach(searchParams);
            setAppointments(unwrapItems(response).map(normalizeAppointment));
        } catch (error) {
            console.error('Lỗi khi tải lịch khám:', error);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (appointment: Appointment) => {
        if (!window.confirm(`Xác nhận lịch khám của ${appointment.tenBenhNhan}?`)) return;
        
        try {
            await appointmentApi.confirm(appointment.id);
            alert('Đã xác nhận lịch khám!');
            loadAppointments();
        } catch (error: any) {
            console.error('Lỗi khi xác nhận:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleComplete = async (appointment: Appointment) => {
        if (!window.confirm(`Đánh dấu hoàn thành lịch khám của ${appointment.tenBenhNhan}?`)) return;
        
        try {
            await appointmentApi.complete(appointment.id);
            alert('Đã hoàn thành lịch khám!');
            loadAppointments();
        } catch (error: any) {
            console.error('Lỗi khi hoàn thành:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleCancel = async (appointment: Appointment) => {
        const lyDoHuy = window.prompt(`Lý do hủy lịch khám của ${appointment.tenBenhNhan}:`);
        if (!lyDoHuy) return;
        
        try {
            await appointmentApi.cancel(appointment.id, lyDoHuy);
            alert('Đã hủy lịch khám!');
            loadAppointments();
        } catch (error: any) {
            console.error('Lỗi khi hủy:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const handleDelete = async (appointment: Appointment) => {
        const lyDoHuy = window.prompt(`Lý do xóa lịch khám này:`);
        if (!lyDoHuy) return;
        
        try {
            await appointmentApi.huyLich({ id: appointment.id, lyDoHuy });
            alert('Đã xóa lịch khám!');
            loadAppointments();
        } catch (error: any) {
            console.error('Lỗi khi xóa:', error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra!');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
            ChoXacNhan: { label: 'Chờ xác nhận', color: '#f59e0b' },
            DaXacNhan: { label: 'Đã xác nhận', color: '#2196c8' },
            HoanThanh: { label: 'Hoàn thành', color: '#059669' },
            DaHuy: { label: 'Đã hủy', color: '#dc2626' },
            TuChoi: { label: 'Từ chối', color: '#dc2626' },
        };
        const s = statusMap[status] || { label: status, color: '#6b7280' };
        return (
            <span style={{ 
                padding: '4px 12px', 
                borderRadius: '12px', 
                backgroundColor: s.color + '20', 
                color: s.color,
                fontSize: '13px',
                fontWeight: 500
            }}>
                {s.label}
            </span>
        );
    };

    const getActionButtons = (appointment: Appointment) => {
        const buttons = [];
        
        if (role === 'BacSi') {
            if (appointment.trangThai === 'ChoXacNhan') {
                buttons.push(
                    <button
                        key="confirm"
                        className="btn btn-sm btn-primary"
                        onClick={() => handleConfirm(appointment)}
                        style={{ marginRight: '5px', padding: '4px 12px', fontSize: '13px' }}
                    >
                        ✓ Xác nhận
                    </button>
                );
            }
            if (appointment.trangThai === 'DaXacNhan') {
                buttons.push(
                    <button
                        key="complete"
                        className="btn btn-sm btn-success"
                        onClick={() => handleComplete(appointment)}
                        style={{ 
                            marginRight: '5px', 
                            padding: '4px 12px', 
                            fontSize: '13px', 
                            background: '#059669', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: 'pointer' 
                        }}
                    >
                        ✓ Hoàn thành
                    </button>
                );
            }
            if (appointment.trangThai !== 'HoanThanh' && appointment.trangThai !== 'DaHuy') {
                buttons.push(
                    <button
                        key="cancel"
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancel(appointment)}
                        style={{ padding: '4px 12px', fontSize: '13px' }}
                    >
                        ✕ Hủy
                    </button>
                );
            }
        }
        
        if ((role === 'Admin' || role === 'QuanTriVien') && canDelete) {
            buttons.push(
                <button
                    key="delete"
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(appointment)}
                    style={{ padding: '4px 12px', fontSize: '13px' }}
                >
                    🗑 Xóa
                </button>
            );
        }
        
        return <div style={{ display: 'flex', gap: '5px' }}>{buttons}</div>;
    };

    if (loading) {
        return <div className="loading-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>📅 Quản lý Lịch khám</h1>
            </div>

            <div style={{ 
                background: 'white', 
                padding: '20px', 
                borderRadius: '12px', 
                marginBottom: '20px',
                display: 'flex',
                gap: '15px',
                alignItems: 'end'
            }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>
                        Lọc theo ngày
                    </label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 500 }}>
                        Lọc theo trạng thái
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                    >
                        <option value="">Tất cả</option>
                        <option value="ChoXacNhan">Chờ xác nhận</option>
                        <option value="DaXacNhan">Đã xác nhận</option>
                        <option value="HoanThanh">Hoàn thành</option>
                        <option value="DaHuy">Đã hủy</option>
                        <option value="TuChoi">Từ chối</option>
                    </select>
                </div>
                <button
                    onClick={() => { setFilterDate(''); setFilterStatus(''); }}
                    style={{ 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer'
                    }}
                >
                    🔄 Reset
                </button>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px',
                marginBottom: '20px'
            }}>
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
                        {appointments.filter(a => a.trangThai === 'ChoXacNhan').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Chờ xác nhận</div>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #2196c8' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196c8' }}>
                        {appointments.filter(a => a.trangThai === 'DaXacNhan').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Đã xác nhận</div>
                </div>
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #059669' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                        {appointments.filter(a => a.trangThai === 'HoanThanh').length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Hoàn thành</div>
                </div>
            </div>

            {appointments.length === 0 ? (
                <div className="empty-state">
                    <p>Chưa có lịch khám nào.</p>
                </div>
            ) : (
                <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Ngày</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Giờ</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Bệnh nhân</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>SĐT</th>
                                {role !== 'BacSi' && (
                                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Bác sĩ</th>
                                )}
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Khoa</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Lý do</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: 600 }}>Trạng thái</th>
                                <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: 600 }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>
                                        {new Date(appointment.ngayKham).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: 500 }}>
                                        {appointment.gioKham}
                                    </td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{appointment.tenBenhNhan}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{appointment.soDienThoai}</td>
                                    {role !== 'BacSi' && (
                                        <td style={{ padding: '12px', fontSize: '14px' }}>{appointment.tenBacSi}</td>
                                    )}
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{appointment.khoaKham}</td>
                                    <td style={{ padding: '12px', fontSize: '14px' }}>{appointment.lyDoKham}</td>
                                    <td style={{ padding: '12px' }}>{getStatusBadge(appointment.trangThai)}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {getActionButtons(appointment)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
