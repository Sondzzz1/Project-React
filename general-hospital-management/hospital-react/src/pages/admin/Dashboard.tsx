import { useState, useEffect } from 'react';
import { patientApi, Patient } from '../../services';
import { doctorApi, Doctor } from '../../services';
import { bedApi, Bed } from '../../services';
import { nurseApi, Nurse } from '../../services';
import '../../assets/css/admin/admin.css';

interface DashStats {
    patients: number;
    beds: number;
    doctors: number;
    nurses: number;
}

interface DashCard {
    icon: string;
    label: string;
    value: number;
    color: string;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashStats>({ patients: 0, beds: 0, doctors: 0, nurses: 0 });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async (): Promise<void> => {
        try {
            const [patients, beds, doctors, nurses] = await Promise.allSettled([
                patientApi.getAll() as Promise<Patient[]>,
                bedApi.getAll() as Promise<Bed[]>,
                doctorApi.getAll() as Promise<Doctor[]>,
                nurseApi.getAll() as Promise<Nurse[]>,
            ]);

            setStats({
                patients: patients.status === 'fulfilled' ? (patients.value as Patient[]).length : 0,
                beds: beds.status === 'fulfilled' ? (beds.value as Bed[]).length : 0,
                doctors: doctors.status === 'fulfilled' ? (doctors.value as Doctor[]).length : 0,
                nurses: nurses.status === 'fulfilled' ? (nurses.value as Nurse[]).length : 0,
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const dashCards: DashCard[] = [
        { icon: '🏥', label: 'Bệnh nhân', value: stats.patients, color: '#2196c8' },
        { icon: '🛏️', label: 'Giường bệnh', value: stats.beds, color: '#059669' },
        { icon: '👨‍⚕️', label: 'Bác sĩ', value: stats.doctors, color: '#7c3aed' },
        { icon: '👩‍⚕️', label: 'Y tá', value: stats.nurses, color: '#d97706' },
    ];

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>Tổng quan</h1>
                <p>Thống kê hệ thống bệnh viện</p>
            </div>
            {loading ? (
                <div className="loading-center">Đang tải dữ liệu...</div>
            ) : (
                <div className="dash-stats-grid">
                    {dashCards.map((card, i) => (
                        <div key={i} className="dash-stat-card" style={{ borderLeftColor: card.color }}>
                            <div className="dash-stat-icon" style={{ background: card.color + '15', color: card.color }}>{card.icon}</div>
                            <div className="dash-stat-info">
                                <span className="dash-stat-value">{card.value}</span>
                                <span className="dash-stat-label">{card.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
