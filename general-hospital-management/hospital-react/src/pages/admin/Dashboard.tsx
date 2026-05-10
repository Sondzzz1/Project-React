import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import AdminTasks from '../../components/common/AdminTasks';
import StatCard from '../../components/common/StatCard';
import DoctorDashboard from '../../components/dashboard/DoctorDashboard';
import NurseDashboard from '../../components/dashboard/NurseDashboard';
import AccountantDashboard from '../../components/dashboard/AccountantDashboard';
import { patientApi, doctorApi, bedApi, nurseApi } from '../../services';
import '../../assets/css/admin/admin.css';

interface DashStats {
    patients: number;
    beds: number;
    doctors: number;
    nurses: number;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { role } = usePermissions();
    const [stats, setStats] = useState<DashStats>({ patients: 0, beds: 0, doctors: 0, nurses: 0 });
    const [loading, setLoading] = useState<boolean>(true);

    const loadStats = useCallback(async (): Promise<void> => {
        try {
            const [patients, beds, doctors, nurses] = await Promise.allSettled([
                patientApi.getAll(),
                bedApi.getAll(),
                doctorApi.getAll(),
                nurseApi.getAll(),
            ]);

            setStats({
                patients: patients.status === 'fulfilled' ? (patients.value.data?.length || 0) : 0,
                beds: beds.status === 'fulfilled' ? (beds.value?.length || 0) : 0,
                doctors: doctors.status === 'fulfilled' ? (doctors.value.data?.length || 0) : 0,
                nurses: nurses.status === 'fulfilled' ? (nurses.value.data?.length || 0) : 0,
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { 
        if (role === 'admin') {
            loadStats(); 
        } else {
            setLoading(false);
        }
    }, [loadStats, role]);

    const dashCards = [
        { icon: '🏥', label: 'Bệnh nhân', value: stats.patients, color: '#2196c8' },
        { icon: '🛏️', label: 'Giường bệnh', value: stats.beds, color: '#059669' },
        { icon: '👨‍⚕️', label: 'Bác sĩ', value: stats.doctors, color: '#7c3aed' },
        { icon: '👩‍⚕️', label: 'Y tá', value: stats.nurses, color: '#d97706' },
    ];

    const renderDashboardByRole = () => {
        switch (role) {
            case 'doctor':
                return <DoctorDashboard />;
            case 'nurse':
                return <NurseDashboard />;
            case 'accountant':
                return <AccountantDashboard />;
            default:
                return (
                    <div className="dash-stats-grid">
                        {dashCards.map((card, i) => (
                            <StatCard 
                                key={i}
                                icon={card.icon}
                                label={card.label}
                                value={card.value}
                                color={card.color}
                            />
                        ))}
                    </div>
                );
        }
    };

    const getRoleTitle = () => {
        switch (role) {
            case 'doctor': return 'Bác sĩ';
            case 'nurse': return 'Y tá';
            case 'accountant': return 'Kế toán';
            default: return 'Quản trị viên';
        }
    };

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Tổng quan - {getRoleTitle()}</h1>
                <p>Chào mừng {user?.fullName || user?.username}, chúc bạn một ngày làm việc hiệu quả!</p>
            </div>
            
            {loading ? (
                <div className="loading-center">Đang tải dữ liệu...</div>
            ) : (
                renderDashboardByRole()
            )}
            
            {role === 'admin' && <AdminTasks />}
        </div>
    );
}
