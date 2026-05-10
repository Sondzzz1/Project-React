import { useState, useEffect, useCallback } from 'react';
import { bedApi, admissionApi, patientApi, nurseApi } from '../../services';
import StatCard from '../common/StatCard';

export default function NurseDashboard() {
    const [stats, setStats] = useState({ beds: 0, admissions: 0, patients: 0, nurses: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            const [beds, admissions, patients, nurses] = await Promise.allSettled([
                bedApi.getAll(),
                admissionApi.getAll(),
                patientApi.getAll(),
                nurseApi.getAll(),
            ]);

            setStats({
                beds: beds.status === 'fulfilled' ? (beds.value?.length || 0) : 0,
                admissions: admissions.status === 'fulfilled' ? (admissions.value.data?.length || 0) : 0,
                patients: patients.status === 'fulfilled' ? (patients.value.data?.length || 0) : 0,
                nurses: nurses.status === 'fulfilled' ? (nurses.value.data?.length || 0) : 0,
            });
        } catch (err) {
            console.error('Failed to load nurse stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    const cards = [
        { icon: '🛏️', label: 'Giường bệnh', value: stats.beds, color: '#059669' },
        { icon: '📋', label: 'Nhập viện mới', value: stats.admissions, color: '#2196c8' },
        { icon: '🏥', label: 'Bệnh nhân đang quản lý', value: stats.patients, color: '#7c3aed' },
        { icon: '👩‍⚕️', label: 'Đội ngũ Y tá', value: stats.nurses, color: '#d97706' },
    ];

    return (
        <div className="nurse-dashboard">
            <div className="dash-stats-grid">
                {cards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </div>
        </div>
    );
}
