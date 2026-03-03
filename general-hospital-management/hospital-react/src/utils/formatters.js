/**
 * Format ngày tháng Việt Nam
 * @param {Date|string} date
 * @param {string} format - 'dd/MM/yyyy' | 'yyyy-MM-dd' | 'full'
 */
export function formatDate(date, format = 'dd/MM/yyyy') {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    switch (format) {
        case 'yyyy-MM-dd':
            return `${year}-${month}-${day}`;
        case 'full':
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        case 'time':
            return `${hours}:${minutes}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

/**
 * Format tiền tệ VND
 * @param {number} amount
 */
export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(amount);
}

/**
 * Format số với dấu phân cách hàng nghìn
 */
export function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Trả về badge class dựa trên trạng thái
 */
export function getStatusColor(status) {
    const statusMap = {
        'Đang điều trị': 'primary',
        'Đã xuất viện': 'success',
        'Chờ nhập viện': 'warning',
        'Trống': 'success',
        'Đang sử dụng': 'primary',
        'Bảo trì': 'warning',
        'Hỏng': 'danger',
        'Hoàn thành': 'success',
        'Đang thực hiện': 'primary',
        'Đã lên lịch': 'info',
        'Hủy': 'danger',
        'Đã thanh toán': 'success',
        'Chưa thanh toán': 'warning',
    };
    return statusMap[status] || 'default';
}
