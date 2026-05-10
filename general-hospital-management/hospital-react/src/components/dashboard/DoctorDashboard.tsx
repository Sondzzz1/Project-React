import { useState, useEffect, useCallback } from 'react';
import { patientApi, medicalRecordApi, surgeryApi, labTestApi } from '../../services';
import StatCard from '../common/StatCard';

export default function DoctorDashboard() {
    const [stats, setStats] = useState({ patients: 0, records: 0, surgeries: 0, labtests: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            const [patients, records, surgeries, labtests] = await Promise.allSettled([
                patientApi.getAll(),
                medicalRecordApi.getAll(),
                surgeryApi.getAll(),
                labTestApi.getAll(),
            ]);

            setStats({
                patients: patients.status === 'fulfilled' ? (patients.value.data?.length || 0) : 0,
                records: records.status === 'fulfilled' ? (records.value.data?.length || 0) : 0,
                surgeries: surgeries.status === 'fulfilled' ? (surgeries.value.data?.length || 0) : 0,
                labtests: labtests.status === 'fulfilled' ? (labtests.value.data?.length || 0) : 0,
            });
        } catch (err) {
            console.error('Failed to load doctor stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    const cards = [
        { icon: '🏥', label: 'Bệnh nhân', value: stats.patients, color: '#2196c8' },
        { icon: '📁', label: 'Hồ sơ bệnh án', value: stats.records, color: '#7c3aed' },
        { icon: '💉', label: 'Lịch phẫu thuật', value: stats.surgeries, color: '#059669' },
        { icon: '🔬', label: 'Xét nghiệm', value: stats.labtests, color: '#d97706' },
    ];

    return (
        <div className="doctor-dashboard">
            <div className="dash-stats-grid">
                {cards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </div>
            {/* Add more doctor-specific widgets here */}
        </div>
    );
}
