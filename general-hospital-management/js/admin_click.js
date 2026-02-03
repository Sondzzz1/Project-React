/* ============================
   ADMIN DASHBOARD LOGIC
   File: js/admin.js
=============================== */

/**
 * Hàm chuyển đổi giữa các tab (Tổng quan, Bệnh nhân, Lịch hẹn...)
 * @param {string} id - ID của phần nội dung cần hiện (ví dụ: 'home', 'patients')
 * @param {HTMLElement} element - Thẻ li được click (để active menu)
 */
function showSection(id, element) {
    // 1. Ẩn tất cả các trang (thêm class .hidden)
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.add('hidden');
    });

    // 2. Hiện trang được chọn (xóa class .hidden)
    const selectedPage = document.getElementById(id);
    if (selectedPage) {
        selectedPage.classList.remove('hidden');
    }

    // 3. Xử lý trạng thái active trên Sidebar
    // Nếu hàm được gọi từ menu (có biến element), ta cập nhật class active
    if (element) {
        const menuItems = document.querySelectorAll('.sidebar ul li');
        menuItems.forEach(item => item.classList.remove('active'));
        element.classList.add('active');
    }
}

/**
 * Hàm xử lý đăng xuất
 */
function logout() {
    if(confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) {
        // Gọi hàm logout từ auth.js
        if (typeof logoutUser === 'function') {
            logoutUser();
        } else {
            sessionStorage.removeItem('currentUser');
            alert('Đã đăng xuất thành công!');
            window.location.href = 'login.html';
        }
    }
}

/**
 * Hàm mở form thêm bệnh nhân (Demo)
 */
function openPatientForm() {
    // Sau này bạn có thể thay bằng code mở Modal (Popup)
    alert("Chức năng đang phát triển: Mở form tiếp nhận bệnh nhân mới.");
}

/**
 * Hàm mở form đặt lịch hẹn
 */
function openAppointmentForm() {
    alert("Chức năng đang phát triển: Mở form đặt lịch hẹn mới.");
}

/**
 * Hàm mở form tạo hồ sơ bệnh án
 */
function openRecordForm() {
    alert("Chức năng đang phát triển: Mở form tạo hồ sơ bệnh án mới.");
}

/**
 * Hàm mở form thêm nhân sự
 */
function openDoctorForm() {
    alert("Chức năng đang phát triển: Mở form thêm nhân sự y tế.");
}

/**
 * Hàm mở form tạo hóa đơn
 */
function openBillingForm() {
    alert("Chức năng đang phát triển: Mở form tạo hóa đơn viện phí.");
}

/**
 * Hàm mở form quản lý giường bệnh
 */
function openBedForm() {
    alert("Chức năng đang phát triển: Mở form thêm giường bệnh/khoa phòng.");
}

/**
 * Hàm lọc giường bệnh theo khoa
 */
function filterBeds() {
    const department = document.getElementById('departmentFilter').value;
    // Logic lọc giường bệnh theo khoa
    console.log("Lọc giường bệnh theo khoa:", department);
}

/**
 * Hàm mở form đặt lịch phẫu thuật
 */
function openSurgeryForm() {
    alert("Chức năng đang phát triển: Mở form đặt lịch phẫu thuật/thủ thuật.");
}

/**
 * Hàm xem chi tiết hồ sơ bệnh án
 */
function viewRecordDetail(recordId) {
    alert("Chức năng đang phát triển: Xem chi tiết hồ sơ bệnh án " + recordId);
}

// (Tùy chọn) Tự động kích hoạt tab đầu tiên khi tải trang nếu cần
document.addEventListener("DOMContentLoaded", () => {
    // Mặc định đang để active ở HTML nên không cần code này cũng được,
    // nhưng để chắc chắn thì có thể gọi showSection('home') ở đây.
});