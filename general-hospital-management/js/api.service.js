/**
 * ====================================
 * HOSPITAL MANAGEMENT API SERVICE
 * AngularJS Module for API Gateway
 * ====================================
 */

(function() {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    
    var API_CONFIG = {
        // Base URL của API Gateway
        // Khi chạy local: http://localhost:5076
        // Khi chạy Docker: http://localhost:5076
        baseUrl: 'http://localhost:5076/gateway',
        
        // Token key trong localStorage
        tokenKey: 'jwt_token',
        userKey: 'current_user',
        refreshTokenKey: 'refresh_token',
        
        // Timeout for API calls (ms)
        timeout: 30000
    };

    // ============================================
    // ANGULAR MODULE DEFINITION
    // ============================================
    
    angular.module('hospitalApp', [])
    
    // ============================================
    // HTTP INTERCEPTOR - Tự động thêm JWT Token
    // ============================================
    .factory('authInterceptor', [
        '$q',
        '$window',
        function($q, $window) {
            return {
                // Thêm Authorization header vào mỗi request
                request: function(config) {
                    var token = $window.localStorage.getItem(API_CONFIG.tokenKey);
                    
                    if (token) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = 'Bearer ' + token;
                    }
                    
                    return config;
                },
                
                // Xử lý response error
                responseError: function(rejection) {
                    // KHÔNG xóa token, KHÔNG redirect
                    // Chỉ log lỗi và để controller xử lý hiển thị
                    if (rejection.status === 401) {
                        console.warn('API returned 401 Unauthorized');
                    }
                    
                    return $q.reject(rejection);
                }
            };
        }
    ])
    
    // Register interceptor
    .config([
        '$httpProvider',
        function($httpProvider) {
            $httpProvider.interceptors.push('authInterceptor');
        }
    ])
    
    // ============================================
    // AUTH SERVICE - Đăng nhập, đăng ký, logout
    // ============================================
    .factory('AuthService', [
        '$http',
        '$window',
        '$q',
        function($http, $window, $q) {
            
            var service = {};
            
            /**
             * Đăng nhập
             * @param {string} tenDangNhap - Tên đăng nhập
             * @param {string} matKhau - Mật khẩu
             * @returns {Promise}
             */
            service.login = function(tenDangNhap, matKhau) {
                return $http({
                    method: 'POST',
                    url: API_CONFIG.baseUrl + '/api/auth/login',
                    data: {
                        tenDangNhap: tenDangNhap,
                        matKhau: matKhau
                    },
                    timeout: API_CONFIG.timeout
                })
                .then(function(response) {
                    // Response format: { success: true, message: "...", data: { token: "...", user: {...} } }
                    var result = response.data;
                    
                    // Lấy token từ data object
                    var tokenData = result.data || result;
                    var token = tokenData.token;
                    
                    if (token) {
                        $window.localStorage.setItem(API_CONFIG.tokenKey, token);
                        $window.localStorage.setItem(
                            API_CONFIG.userKey, 
                            JSON.stringify(tokenData.user || tokenData)
                        );
                        console.log('Token saved successfully');
                    } else {
                        console.warn('No token in response:', result);
                    }
                    
                    return result;
                });
            };
            
            /**
             * Đăng ký tài khoản mới
             * @param {Object} userData - Thông tin đăng ký
             * @returns {Promise}
             */
            service.register = function(userData) {
                return $http({
                    method: 'POST',
                    url: API_CONFIG.baseUrl + '/api/auth/register',
                    data: userData,
                    timeout: API_CONFIG.timeout
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Đăng xuất
             */
            service.logout = function() {
                $window.localStorage.removeItem(API_CONFIG.tokenKey);
                $window.localStorage.removeItem(API_CONFIG.userKey);
                $window.localStorage.removeItem(API_CONFIG.refreshTokenKey);
                $window.sessionStorage.removeItem('currentUser');
                $window.location.href = 'login.html';
            };
            
            /**
             * Kiểm tra đã đăng nhập chưa
             * @returns {boolean}
             */
            service.isAuthenticated = function() {
                var token = $window.localStorage.getItem(API_CONFIG.tokenKey);
                return !!token;
            };
            
            /**
             * Lấy thông tin user hiện tại
             * @returns {Object|null}
             */
            service.getCurrentUser = function() {
                var userStr = $window.localStorage.getItem(API_CONFIG.userKey);
                if (userStr) {
                    try {
                        return JSON.parse(userStr);
                    } catch (e) {
                        return null;
                    }
                }
                return null;
            };
            
            /**
             * Lấy JWT token
             * @returns {string|null}
             */
            service.getToken = function() {
                return $window.localStorage.getItem(API_CONFIG.tokenKey);
            };
            
            /**
             * Đổi mật khẩu
             * @param {string} oldPassword
             * @param {string} newPassword
             * @returns {Promise}
             */
            service.changePassword = function(oldPassword, newPassword) {
                return $http({
                    method: 'POST',
                    url: API_CONFIG.baseUrl + '/api/auth/change-password',
                    data: {
                        matKhauCu: oldPassword,
                        matKhauMoi: newPassword
                    }
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Yêu cầu reset mật khẩu
             * @param {string} email
             * @returns {Promise}
             */
            service.requestPasswordReset = function(email) {
                return $http({
                    method: 'POST',
                    url: API_CONFIG.baseUrl + '/api/auth/forgot-password',
                    data: {
                        email: email
                    }
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // PATIENT SERVICE - Quản lý bệnh nhân
    // ============================================
    .factory('PatientService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/benhnhan';
            var service = {};
            
            /**
             * Lấy danh sách tất cả bệnh nhân
             * @param {Object} params - Tham số filter, search, pagination
             * @returns {Promise}
             */
            service.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/get-all',
                    params: params || {}
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy thông tin một bệnh nhân theo ID
             * @param {string} id
             * @returns {Promise}
             */
            service.getById = function(id) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/get-by-id/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Tạo bệnh nhân mới
             * @param {Object} patientData
             * @returns {Promise}
             */
            service.create = function(patientData) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/create',
                    data: patientData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Cập nhật thông tin bệnh nhân
             * @param {string} id
             * @param {Object} patientData
             * @returns {Promise}
             */
            service.update = function(id, patientData) {
                // Backend expects ID in body
                patientData.Id = id;
                return $http({
                    method: 'PUT',
                    url: baseUrl + '/update',
                    data: patientData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Xóa bệnh nhân
             * @param {string} id
             * @returns {Promise}
             */
            service.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: baseUrl + '/delete/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Tìm kiếm bệnh nhân với pagination
             * @param {Object} searchModel - { pageIndex, pageSize, keyword }
             * @returns {Promise}
             */
            service.search = function(searchModel) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/search',
                    data: searchModel || { pageIndex: 1, pageSize: 10 }
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // BED SERVICE - Quản lý giường bệnh
    // ============================================
    .factory('BedService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/giuongbenh';
            var service = {};
            
            service.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/get-all',
                    params: params || {}
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.getById = function(id) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/get-by-id/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.create = function(bedData) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/create',
                    data: bedData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.update = function(id, bedData) {
                return $http({
                    method: 'PUT',
                    url: baseUrl + '/update-giuong',
                    data: bedData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: baseUrl + '/delete-giuong/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy giường theo khoa
             * @param {number} khoaId
             * @returns {Promise}
             */
            service.getByDepartment = function(khoaId) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/by-department/' + khoaId
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy giường trống
             * @returns {Promise}
             */
            service.getAvailable = function() {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/available'
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // SURGERY SERVICE - Quản lý lịch phẫu thuật
    // ============================================
    .factory('SurgeryService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/surgery';
            var service = {};
            
            service.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: baseUrl,
                    params: params || {}
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.getById = function(id) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.create = function(surgeryData) {
                return $http({
                    method: 'POST',
                    url: baseUrl,
                    data: surgeryData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.update = function(id, surgeryData) {
                return $http({
                    method: 'PUT',
                    url: baseUrl + '/' + id,
                    data: surgeryData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy lịch phẫu thuật hôm nay
             * @returns {Promise}
             */
            service.getToday = function() {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/today'
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy lịch phẫu thuật theo bác sĩ
             * @param {number} doctorId
             * @returns {Promise}
             */
            service.getByDoctor = function(doctorId) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/by-doctor/' + doctorId
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // MEDICAL RECORD SERVICE - Hồ sơ bệnh án
    // ============================================
    .factory('MedicalRecordService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/medicalrecord';
            var service = {};
            
            service.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: baseUrl,
                    params: params || {}
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.getById = function(id) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.create = function(recordData) {
                return $http({
                    method: 'POST',
                    url: baseUrl,
                    data: recordData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.update = function(id, recordData) {
                return $http({
                    method: 'PUT',
                    url: baseUrl + '/' + id,
                    data: recordData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy hồ sơ bệnh án của bệnh nhân
             * @param {number} patientId
             * @returns {Promise}
             */
            service.getByPatient = function(patientId) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/patient/' + patientId
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // DOCTOR SERVICE - Quản lý bác sĩ
    // ============================================
    .factory('DoctorService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/bacsi';
            var service = {};
            
            service.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: baseUrl,
                    params: params || {}
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.getById = function(id) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.create = function(doctorData) {
                return $http({
                    method: 'POST',
                    url: baseUrl,
                    data: doctorData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.update = function(id, doctorData) {
                return $http({
                    method: 'PUT',
                    url: baseUrl + '/' + id,
                    data: doctorData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy bác sĩ theo khoa
             * @param {number} departmentId
             * @returns {Promise}
             */
            service.getByDepartment = function(departmentId) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/by-department/' + departmentId
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // REPORT SERVICE - Báo cáo thống kê
    // ============================================
    .factory('ReportService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/report';
            var service = {};
            
            /**
             * Báo cáo công suất giường
             * @param {Object} params - fromDate, toDate
             * @returns {Promise}
             */
            service.getBedCapacityReport = function(params) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/bed-capacity',
                    data: params
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Báo cáo chi phí điều trị
             * @param {Object} params - fromDate, toDate, departmentId
             * @returns {Promise}
             */
            service.getTreatmentCostReport = function(params) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/treatment-cost',
                    data: params
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Export báo cáo ra Excel
             * @param {string} reportType
             * @param {Object} params
             * @returns {Promise}
             */
            service.exportExcel = function(reportType, params) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/export/excel/' + reportType,
                    data: params,
                    responseType: 'blob'
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Export báo cáo ra PDF
             * @param {string} reportType
             * @param {Object} params
             * @returns {Promise}
             */
            service.exportPdf = function(reportType, params) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/export/pdf/' + reportType,
                    data: params,
                    responseType: 'blob'
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // AUDIT SERVICE - Audit log
    // ============================================
    .factory('AuditService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/audit';
            var service = {};
            
            /**
             * Lấy danh sách audit log
             * @param {Object} params - page, pageSize, fromDate, toDate, userId, action
             * @returns {Promise}
             */
            service.getLogs = function(params) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/logs',
                    params: params || {}
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Lấy audit log cho hồ sơ bệnh án
             * @param {number} recordId
             * @returns {Promise}
             */
            service.getMedicalRecordAudit = function(recordId) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/medical-record/' + recordId
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // USER MANAGEMENT SERVICE - Quản lý người dùng
    // ============================================
    .factory('UserManagementService', [
        '$http',
        function($http) {
            
            var baseUrl = API_CONFIG.baseUrl + '/api/usermanagement';
            var service = {};
            
            service.getAll = function(params) {
                return $http({
                    method: 'GET',
                    url: baseUrl,
                    params: params || {}
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.getById = function(id) {
                return $http({
                    method: 'GET',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.create = function(userData) {
                return $http({
                    method: 'POST',
                    url: baseUrl,
                    data: userData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.update = function(id, userData) {
                return $http({
                    method: 'PUT',
                    url: baseUrl + '/' + id,
                    data: userData
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            service.delete = function(id) {
                return $http({
                    method: 'DELETE',
                    url: baseUrl + '/' + id
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Reset mật khẩu người dùng
             * @param {number} userId
             * @returns {Promise}
             */
            service.resetPassword = function(userId) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/' + userId + '/reset-password'
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            /**
             * Gán vai trò cho người dùng
             * @param {number} userId
             * @param {string} roleId
             * @returns {Promise}
             */
            service.assignRole = function(userId, roleId) {
                return $http({
                    method: 'POST',
                    url: baseUrl + '/' + userId + '/assign-role',
                    data: { roleId: roleId }
                })
                .then(function(response) {
                    return response.data;
                });
            };
            
            return service;
        }
    ])
    
    // ============================================
    // UTILITY SERVICE - Các hàm tiện ích
    // ============================================
    .factory('UtilityService', [
        '$window',
        function($window) {
            
            var service = {};
            
            /**
             * Download file từ blob
             * @param {Blob} blob
             * @param {string} filename
             */
            service.downloadBlob = function(blob, filename) {
                var url = $window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                $window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            };
            
            /**
             * Format ngày tháng
             * @param {Date|string} date
             * @param {string} format - 'dd/MM/yyyy' hoặc 'yyyy-MM-dd'
             * @returns {string}
             */
            service.formatDate = function(date, format) {
                if (!date) return '';
                
                var d = new Date(date);
                var day = String(d.getDate()).padStart(2, '0');
                var month = String(d.getMonth() + 1).padStart(2, '0');
                var year = d.getFullYear();
                
                if (format === 'yyyy-MM-dd') {
                    return year + '-' + month + '-' + day;
                }
                
                return day + '/' + month + '/' + year;
            };
            
            /**
             * Format tiền tệ VND
             * @param {number} amount
             * @returns {string}
             */
            service.formatCurrency = function(amount) {
                if (!amount && amount !== 0) return '';
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND'
                }).format(amount);
            };
            
            /**
             * Hiển thị thông báo
             * @param {string} message
             * @param {string} type - 'success', 'error', 'warning', 'info'
             */
            service.showNotification = function(message, type) {
                // Có thể tích hợp với thư viện toast notification
                // Tạm thời dùng alert
                if (type === 'error') {
                    alert('Lỗi: ' + message);
                } else {
                    alert(message);
                }
            };
            
            return service;
        }
    ]);
    
})();
