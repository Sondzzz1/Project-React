import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import { Table, Button, Modal } from '../../components/common';
import axiosInstance from '../../services/axiosInstance';
import { ENDPOINTS } from '../../constant/api';
import './AdminPages.css';

interface Appointment {
    id: string;
    benhNhanId: string;
    tenBenhNhan: string;
    ngayKham: string;
    gioKham: string;
    bacSiId: string;
    tenBacSi: string;
    bacSi?: string; // Bổ sung lại cho Form
    chuyenKhoa: string;
    trangThai: string;
    ghiChu?: string;
    lyDoKham?: string;
}

export default function AppointmentsPage() {
    const { user } = useAuth();
    const { role, canAdd, canEdit, canDelete } = usePermissions();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    useEffect(() => {
        loadAppointments();
    }, []);

    const loadAppointments = async () => {
        try {
            setLoading(true);
            const searchParams: any = {
                pageIndex: 1,
                pageSize: 100
            };

            // Tự động lọc theo vai trò từ API
            if (user?.role === 'BenhNhan') searchParams.benhNhanId = user.id;
            if (user?.role === 'BacSi') searchParams.bacSiId = user.id;
            
            const response = await axiosInstance.post(`${ENDPOINTS.APPOINTMENT}/danh-sach`, searchParams);
            if (response.data.success) {
                setAppointments(response.data.data.items);
            }
        } catch (error) {
            console.error('Lỗi khi tải lịch khám:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedAppointment(null);
        setIsModalOpen(true);
    };

    const handleEdit = (appointment: Appointment) => {
        setSelectedAppointment(appointment);
        setIsModalOpen(true);
    };

    const handleDelete = async (appointment: Appointment) => {
        if (!window.confirm(`Bạn có chắc muốn hủy lịch khám này?`)) return;
        
        try {
            // TODO: Gọi API
            // await appointmentApi.delete(appointment.id);
            alert('Hủy lịch khám thành công!');
            loadAppointments();
        } catch (error) {
            console.error('Lỗi khi hủy lịch khám:', error);
            alert('Có lỗi xảy ra!');
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            if (selectedAppointment) {
                // TODO: Update
                // await appointmentApi.update(selectedAppointment.id, data);
                alert('Cập nhật lịch khám thành công!');
            } else {
                // TODO: Create
                // await appointmentApi.create(data);
                alert('Đặt lịch khám thành công!');
            }
            setIsModalOpen(false);
            loadAppointments();
        } catch (error) {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra!');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; color: string }> = {
            'Chờ xác nhận': { label: 'Chờ xác nhận', color: '#f59e0b' },
            'Đã xác nhận':  { label: 'Đã xác nhận',  color: '#10b981' },
            'Đã khám':      { label: 'Đã khám',      color: '#3b82f6' },
            'Đã hủy':       { label: 'Đã hủy',       color: '#ef4444' },
            'Đã từ chối':   { label: 'Đã từ chối',   color: '#ef4444' },
        };

        const config = statusMap[status] || { label: status || 'Chờ xác nhận', color: '#6b7280' };
        return (
            <span className="status-badge" style={{ 
                backgroundColor: config.color + '20', 
                color: config.color,
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: 600
            }}>
                {config.label}
            </span>
        );
    };

    const columns: any[] = [
        { dataIndex: 'ngayKham',    title: 'Ngày khám' },
        { dataIndex: 'gioKham',     title: 'Giờ khám' },
        { dataIndex: 'tenBenhNhan', title: 'Bệnh nhân' },
        { dataIndex: 'bacSi',       title: 'Bác sĩ' },
        { dataIndex: 'chuyenKhoa',  title: 'Chuyên khoa' },
        { 
            dataIndex: 'trangThai',   
            title: 'Trạng thái',
            render: (_: any, row: any) => getStatusBadge(row.trangThai || row.TrangThai)
        },
        { 
            dataIndex: 'id', 
            title: 'Hành động',
            render: (_: any, row: any) => (
                <div className="table-actions">
                    {canEdit && (
                        <Button variant="secondary" onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>
                            Sửa
                        </Button>
                    )}
                    {canDelete && (
                        <Button variant="danger" onClick={(e) => { e.stopPropagation(); handleDelete(row); }}>
                            Hủy
                        </Button>
                    )}
                </div>
            )
        },
    ];

    // Lọc dữ liệu theo vai trò (để chắc chắn ở Frontend)
    const filteredAppointments = useMemo(() => {
        if (user?.role === 'BenhNhan') {
            return appointments.filter(app => app.benhNhanId === user.id);
        }
        if (user?.role === 'BacSi') {
            return appointments.filter(app => app.bacSiId === user.id);
        }
        return appointments;
    }, [appointments, user]);

    if (loading) {
        return <div className="loading-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>📅 Quản lý Lịch khám</h1>
                {canAdd && (
                    <Button variant="primary" onClick={handleAdd}>
                        + Đặt lịch mới
                    </Button>
                )}
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="empty-state">
                    <p>Chưa có lịch khám nào.</p>
                    {canAdd && (
                        <Button variant="primary" onClick={handleAdd}>
                            Đặt lịch khám
                        </Button>
                    )}
                </div>
            ) : (
                <Table
                    columns={columns}
                    data={filteredAppointments.map((a: any) => ({
                        ...a,
                        // Giữ nguyên giá trị gốc để hàm render xử lý
                        ngayKham: a.ngayKham || a.NgayKham ? new Date(a.ngayKham || a.NgayKham).toLocaleDateString('vi-VN') : '—',
                        gioKham: a.gioKham || a.GioKham || '—',
                        tenBenhNhan: a.tenBenhNhan || a.TenBenhNhan || '—',
                        bacSi: a.tenBacSi || a.TenBacSi || '—',
                        chuyenKhoa: a.chuyenKhoa || a.ChuyenKhoa || '—',
                        trangThai: a.trangThai || a.TrangThai
                    }))}
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedAppointment ? 'Cập nhật lịch khám' : 'Đặt lịch khám mới'}
            >
                <AppointmentForm
                    appointment={selectedAppointment}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    );
}

// Form component
interface AppointmentFormProps {
    appointment: Appointment | null;
    onSubmit: (data: any) => void;
    onCancel: () => void;
}

function AppointmentForm({ appointment, onSubmit, onCancel }: AppointmentFormProps) {
    const [formData, setFormData] = useState({
        ngayKham: appointment?.ngayKham || '',
        gioKham: appointment?.gioKham || '',
        bacSi: appointment?.tenBacSi || appointment?.bacSi || '',
        chuyenKhoa: appointment?.chuyenKhoa || '',
        ghiChu: appointment?.ghiChu || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="form">
            <div className="form-group">
                <label>Ngày khám *</label>
                <input
                    type="date"
                    name="ngayKham"
                    value={formData.ngayKham}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Giờ khám *</label>
                <input
                    type="time"
                    name="gioKham"
                    value={formData.gioKham}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Chuyên khoa *</label>
                <select name="chuyenKhoa" value={formData.chuyenKhoa} onChange={handleChange} required>
                    <option value="">-- Chọn chuyên khoa --</option>
                    <option value="Nội khoa">Nội khoa</option>
                    <option value="Ngoại khoa">Ngoại khoa</option>
                    <option value="Sản phụ khoa">Sản phụ khoa</option>
                    <option value="Nhi khoa">Nhi khoa</option>
                    <option value="Tim mạch">Tim mạch</option>
                    <option value="Thần kinh">Thần kinh</option>
                </select>
            </div>

            <div className="form-group">
                <label>Bác sĩ</label>
                <input
                    type="text"
                    name="bacSi"
                    value={formData.bacSi}
                    onChange={handleChange}
                    placeholder="Để trống nếu chưa chọn bác sĩ"
                />
            </div>

            <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                    name="ghiChu"
                    value={formData.ghiChu}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Triệu chứng, lý do khám..."
                />
            </div>

            <div className="form-actions">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Hủy
                </Button>
                <Button type="submit" variant="primary">
                    {appointment ? 'Cập nhật' : 'Đặt lịch'}
                </Button>
            </div>
        </form>
    );
}
