import { useState, useEffect, useCallback } from 'react';
import { billingApi, reportApi, admissionApi, patientApi } from '../../services';
import StatCard from '../common/StatCard';

export default function AccountantDashboard() {
    const [stats, setStats] = useState({ billing: 0, reports: 0, admissions: 0, patients: 0 });
    const [loading, setLoading] = useState(true);

    const loadStats = useCallback(async () => {
        try {
            const [billing, reports, admissions, patients] = await Promise.allSettled([
                billingApi.getAll(),
                reportApi.getBedCapacity(),
                admissionApi.getAll(),
                patientApi.getAll(),
            ]);

            setStats({
                billing: billing.status === 'fulfilled' ? (billing.value.data?.length || 0) : 0,
                reports: reports.status === 'fulfilled' ? (reports.value.data?.length || 0) : 0,
                admissions: admissions.status === 'fulfilled' ? (admissions.value.data?.length || 0) : 0,
                patients: patients.status === 'fulfilled' ? (patients.value.data?.length || 0) : 0,
            });
        } catch (err) {
            console.error('Failed to load accountant stats:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadStats(); }, [loadStats]);

    const cards = [
        { icon: '💰', label: 'Hóa đơn chưa thanh toán', value: stats.billing, color: '#d97706' },
        { icon: '📈', label: 'Báo cáo doanh thu', value: stats.reports, color: '#059669' },
        { icon: '📋', label: 'Lượt điều trị', value: stats.admissions, color: '#2196c8' },
        { icon: '🏥', label: 'Bệnh nhân', value: stats.patients, color: '#7c3aed' },
    ];

    return (
        <div className="accountant-dashboard">
            <div className="dash-stats-grid">
                {cards.map((card, i) => (
                    <StatCard key={i} {...card} />
                ))}
            </div>
        </div>
    );
}
