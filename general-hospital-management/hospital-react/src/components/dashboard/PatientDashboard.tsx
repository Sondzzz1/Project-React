import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StatCard from '../common/StatCard';
import { Table } from '../common';
import './Dashboard.css';

interface Appointment {
    id: string;
    ngayKham: string;
    bacSi: string;
    trangThai: string;
    ghiChu?: string;
}

interface MedicalRecord {
    id: string;
    ngayKham: string;
    chanDoan: string;
    bacSi: string;
}

interface Bill {
    id: string;
    ngayTao: string;
    tongTien: number;
    trangThai: string;
}

export default function PatientDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatientData();
    }, []);

    const loadPatientData = async () => {
        try {
            // TODO: Gọi API lấy dữ liệu của bệnh nhân
            // const appointmentsData = await appointmentApi.getByPatient(user?.id);
            // const recordsData = await medicalRecordApi.getByPatient(user?.id);
            // const billsData = await billingApi.getByPatient(user?.id);
            
            // Mock data tạm thời
            setAppointments([]);
            setMedicalRecords([]);
            setBills([]);
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu bệnh nhân:', error);
        } finally {
            setLoading(false);
        }
    };

    const appointmentColumns = [
        { key: 'ngayKham', label: 'Ngày khám' },
        { key: 'bacSi', label: 'Bác sĩ' },
        { key: 'trangThai', label: 'Trạng thái' },
        { key: 'ghiChu', label: 'Ghi chú' },
    ];

    const recordColumns = [
        { key: 'ngayKham', label: 'Ngày khám' },
        { key: 'chanDoan', label: 'Chẩn đoán' },
        { key: 'bacSi', label: 'Bác sĩ' },
    ];

    const billColumns = [
        { key: 'ngayTao', label: 'Ngày tạo' },
        { key: 'tongTien', label: 'Tổng tiền' },
        { key: 'trangThai', label: 'Trạng thái' },
    ];

    if (loading) {
        return <div className="loading-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="patient-dashboard">
            <div className="dashboard-welcome">
                <h2>Xin chào, {user?.fullName || user?.hoTen || user?.username}!</h2>
                <p>Chúc bạn một ngày tốt lành và sức khỏe dồi dào.</p>
            </div>

            {/* Thống kê tổng quan */}
            <div className="dash-stats-grid">
                <StatCard
                    icon="📅"
                    label="Lịch khám sắp tới"
                    value={appointments.filter(a => a.trangThai === 'scheduled').length}
                    color="#2196c8"
                />
                <StatCard
                    icon="📋"
                    label="Hồ sơ bệnh án"
                    value={medicalRecords.length}
                    color="#059669"
                />
                <StatCard
                    icon="💰"
                    label="Hóa đơn chưa thanh toán"
                    value={bills.filter(b => b.trangThai === 'unpaid').length}
                    color="#d97706"
                />
                <StatCard
                    icon="✅"
                    label="Lịch khám đã hoàn thành"
                    value={appointments.filter(a => a.trangThai === 'completed').length}
                    color="#7c3aed"
                />
            </div>

            {/* Lịch khám sắp tới */}
            <div className="dashboard-section">
                <h3>📅 Lịch khám sắp tới</h3>
                {appointments.length > 0 ? (
                    <Table columns={appointmentColumns} data={appointments} />
                ) : (
                    <div className="empty-state">
                        <p>Bạn chưa có lịch khám nào.</p>
                        <a href="/appointment" className="btn btn-primary">Đặt lịch khám</a>
                    </div>
                )}
            </div>

            {/* Hồ sơ bệnh án gần đây */}
            <div className="dashboard-section">
                <h3>📋 Hồ sơ bệnh án gần đây</h3>
                {medicalRecords.length > 0 ? (
                    <Table columns={recordColumns} data={medicalRecords.slice(0, 5)} />
                ) : (
                    <div className="empty-state">
                        <p>Chưa có hồ sơ bệnh án nào.</p>
                    </div>
                )}
            </div>

            {/* Hóa đơn */}
            <div className="dashboard-section">
                <h3>💰 Hóa đơn</h3>
                {bills.length > 0 ? (
                    <Table columns={billColumns} data={bills.slice(0, 5)} />
                ) : (
                    <div className="empty-state">
                        <p>Chưa có hóa đơn nào.</p>
                    </div>
                )}
            </div>

            {/* Thông tin hữu ích */}
            <div className="dashboard-section">
                <h3>ℹ️ Thông tin hữu ích</h3>
                <div className="info-cards">
                    <div className="info-card">
                        <h4>📞 Liên hệ khẩn cấp</h4>
                        <p>Hotline: <strong>1900-xxxx</strong></p>
                        <p>Email: support@hoanmy.com</p>
                    </div>
                    <div className="info-card">
                        <h4>🕐 Giờ làm việc</h4>
                        <p>Thứ 2 - Thứ 6: 7:00 - 17:00</p>
                        <p>Thứ 7 - CN: 8:00 - 12:00</p>
                    </div>
                    <div className="info-card">
                        <h4>📍 Địa chỉ</h4>
                        <p>123 Đường ABC, Quận XYZ</p>
                        <p>TP. Hồ Chí Minh</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
