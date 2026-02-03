# Hướng dẫn Phân quyền Hệ thống

## Tổng quan

Hệ thống hỗ trợ 6 vai trò với các quyền truy cập khác nhau:

1. **Admin (Quản trị viên)** - Toàn quyền
2. **Doctor (Bác sĩ)** - Quản lý bệnh nhân, hồ sơ, lịch mổ
3. **Nurse (Y tá)** - Quản lý bệnh nhân, giường bệnh, hồ sơ
4. **Caregiver (Điều dưỡng)** - Tương tự Y tá
5. **Accountant (Kế toán)** - Quản lý viện phí, báo cáo
6. **Patient (Bệnh nhân)** - Xem thông tin cá nhân

## Cách sử dụng

### 1. Đăng nhập

- Mở file `Pages/login.html` trong trình duyệt
- Chọn vai trò và đăng nhập
- Hoặc click vào tài khoản demo để tự động điền

### 2. Cấu trúc File

```
js/
  ├── auth.js          # File quản lý phân quyền chính
  └── admin_click.js   # Logic xử lý admin

Pages/
  ├── login.html       # Trang đăng nhập
  └── admin.html       # Trang quản trị (dùng chung cho tất cả vai trò)
```

### 3. Quyền truy cập chi tiết

#### Admin
- ✅ Tất cả chức năng
- ✅ Thêm/Sửa/Xóa
- ✅ Xem báo cáo
- ✅ Cấu hình hệ thống

#### Bác sĩ
- ✅ Tổng quan
- ✅ Lịch khám & Hẹn
- ✅ Quản lý Bệnh nhân
- ✅ Lịch Phẫu thuật
- ✅ Hồ sơ Bệnh án
- ❌ Quản lý Giường bệnh
- ❌ Nhân sự Y tế
- ❌ Viện phí
- ❌ Báo cáo
- ❌ Cấu hình

#### Y tá / Điều dưỡng
- ✅ Tổng quan
- ✅ Lịch khám & Hẹn
- ✅ Quản lý Bệnh nhân
- ✅ Quản lý Giường bệnh
- ✅ Hồ sơ Bệnh án
- ❌ Lịch Phẫu thuật
- ❌ Nhân sự Y tế
- ❌ Viện phí
- ❌ Báo cáo
- ❌ Cấu hình

#### Kế toán
- ✅ Tổng quan
- ✅ Viện phí & BHYT
- ✅ Báo cáo thống kê
- ❌ Tất cả chức năng khác

#### Bệnh nhân
- ✅ Tổng quan
- ✅ Lịch khám & Hẹn (của mình)
- ✅ Hồ sơ Bệnh án (của mình)
- ✅ Viện phí (của mình)
- ❌ Tất cả chức năng quản lý

## Cách tùy chỉnh quyền

### Thêm quyền mới

Mở file `js/auth.js` và chỉnh sửa object `PERMISSIONS`:

```javascript
const PERMISSIONS = {
    [ROLES.ADMIN]: {
        newFeature: true,  // Thêm quyền mới
        // ...
    },
    [ROLES.DOCTOR]: {
        newFeature: false, // Bác sĩ không có quyền
        // ...
    }
};
```

### Thêm vai trò mới

1. Thêm vào `ROLES`:
```javascript
const ROLES = {
    // ...
    NEW_ROLE: 'new_role'
};
```

2. Thêm quyền vào `PERMISSIONS`:
```javascript
const PERMISSIONS = {
    // ...
    [ROLES.NEW_ROLE]: {
        home: true,
        // ... các quyền khác
    }
};
```

3. Cập nhật `applyPermissions()` để xử lý menu mới

## Kiểm tra quyền trong code

```javascript
// Kiểm tra một quyền
if (hasPermission('billing')) {
    // Code chỉ chạy khi có quyền
}

// Kiểm tra nhiều quyền
if (hasAllPermissions(['billing', 'report'])) {
    // Code chỉ chạy khi có tất cả quyền
}

// Kiểm tra ít nhất một quyền
if (hasAnyPermission(['billing', 'report'])) {
    // Code chỉ chạy khi có ít nhất một quyền
}
```

## Lưu ý

- Thông tin đăng nhập hiện tại lưu trong `sessionStorage`
- Khi refresh trang, cần đăng nhập lại (hoặc cải thiện để lưu vào localStorage)
- Trong thực tế, cần tích hợp với backend API để xác thực thật
- Cần thêm middleware kiểm tra quyền ở phía server

