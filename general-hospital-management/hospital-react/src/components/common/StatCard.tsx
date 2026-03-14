import React from 'react';

// =========================================================================
// BÀI 3.5: PROPS VALIDATION (Xác thực dữ liệu Props)
// Trong React hiện đại với TypeScript, chúng ta sử dụng `interface` hoặc `type` 
// để thực hiện Props Validation ngay lúc biên dịch (compile-time).
// Điều này thay thế cho thư viện `prop-types` cũ giúp code an toàn và bắt lỗi sớm.
// =========================================================================

export interface StatCardProps {
    icon: string;       // Bắt buộc phải là chuỗi (chứa emoji hoặc symbol)
    label: string;      // Bắt buộc là chuỗi văn bản (VD: "Bệnh nhân")
    value: number;      // Bắt buộc là số (VD: 150)
    color: string;      // Bắt buộc là mã màu CSS (VD: "#2196c8")
    onClick?: () => void; // Tùy chọn (Optional Props validation): có thể truyền hàm hoặc không
}

export default function StatCard({ icon, label, value, color, onClick }: StatCardProps) {
    return (
        <div 
            className="dash-stat-card" 
            style={{ borderLeftColor: color, cursor: onClick ? 'pointer' : 'default' }}
            onClick={onClick}
        >
            <div className="dash-stat-icon" style={{ background: color + '15', color: color }}>
                {icon}
            </div>
            <div className="dash-stat-info">
                <span className="dash-stat-value">{value}</span>
                <span className="dash-stat-label">{label}</span>
            </div>
        </div>
    );
}
