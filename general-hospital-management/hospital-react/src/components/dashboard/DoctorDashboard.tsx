import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { appointmentApi, patientApi, medicalRecordApi, surgeryApi, labTestApi } from '../../services';
import StatCard from '../common/StatCard';
import { Table } from '../common';
import './Dashboard.css';

interface Appointment {
    id: string;
    tenBenhNhan: string;
    soDienThoai?: string;
    gioKham: string;
    lyDoKham?: string;
    trangThai: string;
}

export default function DoctorDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ 
        todayAppointments: 0,
        patients: 0, 
        records: 0, 
        surgeries: 0, 
        labtests: 0 
    });
    const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            let appointments: Appointment[] = [];
            if (user?.id) {
                try {
                    const apptResponse = await appointmentApi.getTodayByDoctor(user.id);
                    // Backend trả về: { success: true, data: { data: [...], totalRecords, ... } }
                    const data = apptResponse?.data?.data || apptResponse?.data || [];
                    appointments = Array.isArray(data) ? data : [];
                    setTodayAppointments(appointments);
                } catch (err) {
                    console.warn('Không thể tải lịch khám:', err);
                    setTodayAppointments([]);
                }
            }

            const [patients, records, surgeries, labtests] = await Promise.allSettled([
                patientApi.getAll().catch(() => ({ data: [] })),
                medicalRecordApi.getAll().catch(() => ({ data: [] })),
                surgeryApi.getAll().catch(() => ({ data: [] })),
                labTestApi.getAll().catch(() => ({ data: [] })),
            ]);

            setStats({
                todayAppointments: appointments.length,
                patients: patients.status === 'fulfilled' ? (patients.value?.data?.length || 0) : 0,
                records: records.status === 'fulfilled' ? (records.value?.data?.length || 0) : 0,
                surgeries: surgeries.status === 'fulfilled' ? (surgeries.value?.data?.length || 0) : 0,
                labtests: labtests.status === 'fulfilled' ? (labtests.value?.data?.length || 0) : 0,
            });
        } catch (err) {
            console.error('Failed to load doctor stats:', err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { loadStats(); }, [loadStats]);

    const cards = [
        { icon: '📅', label: 'Lịch khám hôm nay', value: stats.todayAppointments, color: '#e11d48' },
        { icon: '🏥', label: 'Bệnh nhân', value: stats.patients, color: '#2196c8' },
        { icon: '📁', label: 'Hồ sơ bệnh án', value: stats.records, color: '#7c3aed' },
        { icon: '💉', label: 'Lịch phẫu thuật', value: stats.surgeries, color: '#059669' },
    ];

    const appointmentColumns = [
        { key: 'gioKham', label: 'Giờ' },
        { key: 'tenBenhNhan', label: 'Bệnh nhân' },
        { key: 'soDienThoai', label: 'SĐT' },
        { key: 'lyDoKham', label: 'Lý do khám' },
        { key: 'trangThai', label: 'Trạng thái' },
    ];

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
            ChoXacNhan: { label: 'Chờ xác nhận', color: '#f59e0b' },
            DaXacNhan: { label: 'Đã xác nhận', color: '#2196c8' },
            HoanThanh: { label: 'Hoàn thành', color: '#059669' },
            DaHuy: { label: 'Đã hủy', color: '#dc2626' },
            TuChoi: { label: 'Từ chối', color: '#dc2626' },
        };
        const s = statusMap[status] || { label: status, color: '#6b7280' };
        return <span style={{ 
            padding: '4px 12px', 
            borderRadius: '12px', 
            backgroundColor: s.color + '20', 
            color: s.color,
            fontSize: '13px',
            fontWeight: 500
        }}>{s.label}</span>;
    };

    if (loading) {
        return <div className="loading-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="doctor-dashboard">
            <div className="dash-stats-grid">
                {cards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </div>

            {/* Lịch khám hôm nay */}
            <div className="dashboard-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>📅 Lịch khám hôm nay</h3>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/admin/appointments')}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                        Xem tất cả →
                    </button>
                </div>
                
                {todayAppointments.length === 0 ? (
                    <div className="empty-state">
                        <p>Không có lịch khám nào hôm nay.</p>
                    </div>
                ) : (
                    <Table
                        columns={appointmentColumns}
                        data={todayAppointments.map(a => ({
                            ...a,
                            trangThai: getStatusBadge(a.trangThai)
                        }))}
                    />
                )}
            </div>

            {/* Thông tin hữu ích */}
            <div className="dashboard-section">
                <h3>💡 Lưu ý</h3>
                <div className="info-cards">
                    <div className="info-card">
                        <h4>📋 Quy trình khám</h4>
                        <p>1. Xác nhận lịch khám</p>
                        <p>2. Khám và chẩn đoán</p>
                        <p>3. Cập nhật hồ sơ bệnh án</p>
                        <p>4. Đánh dấu hoàn thành</p>
                    </div>
                    <div className="info-card">
                        <h4>⏰ Giờ làm việc</h4>
                        <p>Sáng: 7:30 - 11:30</p>
                        <p>Chiều: 14:00 - 17:00</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
