/* ============================
   HỆ THỐNG PHÂN QUYỀN
   File: js/auth.js
=============================== */

/**
 * Định nghĩa các vai trò và quyền truy cập
 */
const ROLES = {
    ADMIN: 'admin',
    DOCTOR: 'doctor',
    NURSE: 'nurse',
    CAREGIVER: 'caregiver', // Điều dưỡng
    ACCOUNTANT: 'accountant',
    PATIENT: 'patient'
};

/**
 * Định nghĩa quyền truy cập cho từng vai trò
 */
const PERMISSIONS = {
    [ROLES.ADMIN]: {
        // Admin có quyền truy cập tất cả
        home: true,
        appointments: true,
        patients: true,
        beds: true,
        surgery: true,
        records: true,
        doctors: true,
        billing: true,
        report: true,
        settings: true,
        canAdd: true,
        canEdit: true,
        canDelete: true,
        canViewReports: true
    },
    [ROLES.DOCTOR]: {
        home: true,
        appointments: true,
        patients: true,
        beds: false,
        surgery: true,
        records: true,
        doctors: false,
        billing: false,
        report: false,
        settings: false,
        canAdd: true,
        canEdit: true,
        canDelete: false,
        canViewReports: false
    },
    [ROLES.NURSE]: {
        home: true,
        appointments: true,
        patients: true,
        beds: true,
        surgery: false,
        records: true,
        doctors: false,
        billing: false,
        report: false,
        settings: false,
        canAdd: true,
        canEdit: true,
        canDelete: false,
        canViewReports: false
    },
    [ROLES.CAREGIVER]: {
        home: true,
        appointments: true,
        patients: true,
        beds: true,
        surgery: false,
        records: true,
        doctors: false,
        billing: false,
        report: false,
        settings: false,
        canAdd: true,
        canEdit: true,
        canDelete: false,
        canViewReports: false
    },
    [ROLES.ACCOUNTANT]: {
        home: true,
        appointments: false,
        patients: false,
        beds: false,
        surgery: false,
        records: false,
        doctors: false,
        billing: true,
        report: true,
        settings: false,
        canAdd: true,
        canEdit: true,
        canDelete: false,
        canViewReports: true
    },
    [ROLES.PATIENT]: {
        home: true,
        appointments: true,
        patients: false,
        beds: false,
        surgery: false,
        records: true, // Chỉ xem hồ sơ của chính mình
        doctors: false,
        billing: true, // Chỉ xem hóa đơn của chính mình
        report: false,
        settings: false,
        canAdd: false,
        canEdit: false,
        canDelete: false,
        canViewReports: false
    }
};

/**
 * Lưu thông tin người dùng hiện tại vào sessionStorage
 */
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

/**
 * Lấy thông tin người dùng hiện tại
 */
function getCurrentUser() {
    const userStr = sessionStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

/**
 * Lấy vai trò của người dùng hiện tại
 */
function getCurrentRole() {
    const user = getCurrentUser();
    return user ? user.role : null;
}

/**
 * Kiểm tra quyền truy cập của người dùng
 */
function hasPermission(feature) {
    const role = getCurrentRole();
    if (!role || !PERMISSIONS[role]) {
        return false;
    }
    return PERMISSIONS[role][feature] === true;
}

/**
 * Kiểm tra nhiều quyền cùng lúc (tất cả phải đúng)
 */
function hasAllPermissions(features) {
    return features.every(feature => hasPermission(feature));
}

/**
 * Kiểm tra ít nhất một quyền trong danh sách
 */
function hasAnyPermission(features) {
    return features.some(feature => hasPermission(feature));
}

/**
 * Áp dụng phân quyền cho giao diện
 */
function applyPermissions() {
    // Kiểm tra xem có đang ở trang login không
    const isLoginPage = window.location.pathname.includes('login.html') || 
                        window.location.pathname.endsWith('login.html') ||
                        document.querySelector('.login-container') !== null;
    
    // Nếu đang ở trang login, không chạy logic phân quyền
    if (isLoginPage) {
        return;
    }
    
    const role = getCurrentRole();
    if (!role) {
        // Nếu chưa đăng nhập, chuyển về trang đăng nhập
        window.location.href = 'login.html';
        return;
    }

    const permissions = PERMISSIONS[role];
    if (!permissions) {
        console.error('Vai trò không hợp lệ:', role);
        return;
    }

    // Ẩn/hiện các menu item trong sidebar
    const allMenuItems = document.querySelectorAll('.sidebar ul li');
    allMenuItems.forEach(li => {
        const onclick = li.getAttribute('onclick');
        if (onclick) {
            let feature = null;
            if (onclick.includes("'home'")) feature = 'home';
            else if (onclick.includes("'appointments'")) feature = 'appointments';
            else if (onclick.includes("'patients'")) feature = 'patients';
            else if (onclick.includes("'beds'")) feature = 'beds';
            else if (onclick.includes("'surgery'")) feature = 'surgery';
            else if (onclick.includes("'records'")) feature = 'records';
            else if (onclick.includes("'doctors'")) feature = 'doctors';
            else if (onclick.includes("'billing'")) feature = 'billing';
            else if (onclick.includes("'report'")) feature = 'report';
            else if (onclick.includes("'settings'")) feature = 'settings';
            
            if (feature && !permissions[feature]) {
                li.style.display = 'none';
            }
        }
    });

    // Ẩn/hiện các nút thêm/sửa/xóa
    if (!permissions.canAdd) {
        const addButtons = document.querySelectorAll('.add-btn');
        addButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    if (!permissions.canEdit) {
        const editButtons = document.querySelectorAll('.btn-edit');
        editButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    if (!permissions.canDelete) {
        const deleteButtons = document.querySelectorAll('.btn-delete, .btn[onclick*="delete"], .btn[onclick*="Delete"]');
        deleteButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    }

    // Ẩn các trang không có quyền truy cập
    Object.keys(permissions).forEach(feature => {
        if (feature !== 'canAdd' && feature !== 'canEdit' && feature !== 'canDelete' && feature !== 'canViewReports') {
            const page = document.getElementById(feature);
            if (page && !permissions[feature]) {
                page.style.display = 'none';
            }
        }
    });

    // Cập nhật header với vai trò
    const roleLabel = document.querySelector('.role-label');
    if (roleLabel) {
        const roleNames = {
            [ROLES.ADMIN]: 'Admin Dashboard',
            [ROLES.DOCTOR]: 'Bác sĩ',
            [ROLES.NURSE]: 'Y tá',
            [ROLES.CAREGIVER]: 'Điều dưỡng',
            [ROLES.ACCOUNTANT]: 'Kế toán',
            [ROLES.PATIENT]: 'Bệnh nhân'
        };
        roleLabel.textContent = roleNames[role] || role;
    }

    // Cập nhật title trang
    const roleTitles = {
        [ROLES.ADMIN]: 'Quản Trị',
        [ROLES.DOCTOR]: 'Bác Sĩ',
        [ROLES.NURSE]: 'Y Tá',
        [ROLES.CAREGIVER]: 'Điều Dưỡng',
        [ROLES.ACCOUNTANT]: 'Kế Toán',
        [ROLES.PATIENT]: 'Bệnh Nhân'
    };
    document.title = roleTitles[role] + ' - Bệnh Viện Đa Khoa';
}

/**
 * Đăng nhập với vai trò
 */
function login(username, password, role) {
    // Trong thực tế, đây sẽ là API call
    // Tạm thời dùng mock data
    const user = {
        id: 1,
        username: username,
        name: username,
        role: role,
        department: role === ROLES.DOCTOR ? 'Khoa Nội' : null
    };
    
    setCurrentUser(user);
    return true;
}

/**
 * Đăng xuất (hàm này được gọi từ admin_click.js)
 */
function logoutUser() {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Tự động áp dụng phân quyền khi trang được tải
// Chỉ chạy trên trang admin, không chạy trên trang login
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra xem có đang ở trang login không
    const isLoginPage = window.location.pathname.includes('login.html') || 
                        window.location.pathname.endsWith('login.html') ||
                        document.querySelector('.login-container') !== null;
    
    // Chỉ chạy applyPermissions nếu không phải trang login
    if (!isLoginPage) {
        // Thêm một chút delay để đảm bảo sessionStorage đã được set
        setTimeout(function() {
            applyPermissions();
        }, 50);
    }
});

