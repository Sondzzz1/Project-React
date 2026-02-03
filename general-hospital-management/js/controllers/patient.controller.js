/* ============================
   PATIENT CONTROLLER - patient.controller.js
   Controller for Patient management section
=============================== */

// Extend AdminController with patient functions
angular.module('hospitalApp')
.run(['$rootScope', function($rootScope) {
    
    // Add patient controller functions to scope
    $rootScope.$on('adminControllerReady', function(event, scope) {
        initPatientController(scope);
    });
    
}]);

/**
 * Initialize patient controller
 * @param {Object} $scope - Angular scope
 */
function initPatientController($scope) {
    console.log('Initializing PatientController');
    
    // Patient state
    // Ensure loading object exists (if AdminController didn't init it)
    $scope.loading = $scope.loading || {};
    $scope.errors = $scope.errors || {};
    
    // Use consistent naming with admin.html
    $scope.loading.patients = false;
    $scope.errors.patients = null;
    $scope.patientSearchText = '';
    
    // Pagination state
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalRecords = 0;
    $scope.totalPages = 0;
    
    /**
     * Load bệnh nhân (có phân trang)
     * @param {number} page - Trang cần load (mặc định 1)
     */
    $scope.loadPatients = function(page) {
        console.log('Loading patients page:', page);
        $scope.currentPage = page || 1;
        $scope.searchPatients(true);
    };
    
    /**
     * Tìm kiếm bệnh nhân
     * @param {boolean} keepPage - Giữ nguyên trang hiện tại (true) hay về trang 1 (false/undefined)
     */
    $scope.searchPatients = function(keepPage) {
        if (!keepPage) $scope.currentPage = 1;
        var keyword = $scope.patientSearchText || $scope.searchText || '';
        
        console.log('Searching:', keyword, 'Page:', $scope.currentPage);
        $scope.loading.patients = true;
        $scope.errors.patients = null;
        
        // Simple heuristic: 
        // If keyword starts with "BH" or represents a card number -> SoTheBaoHiem
        // Otherwise -> HoTen
        var searchPayload = {
            pageIndex: $scope.currentPage,
            pageSize: $scope.pageSize,
            hoTen: null,
            soTheBaoHiem: null,
            diaChi: null
        };

        if (keyword) {
            var upper = keyword.toUpperCase();
            if (upper.startsWith('BH') || upper.startsWith('DN') || upper.startsWith('GD') || upper.startsWith('HS')) {
                searchPayload.soTheBaoHiem = keyword;
            } else {
                searchPayload.hoTen = keyword;
            }
        }
        
        $scope.PatientService.search(searchPayload)
        .then(function(response) {
            $scope.loading.patients = false;
            
            // Xử lý response từ API (PagedResult)
            if (response && (response.items || Array.isArray(response.items))) {
                $scope.patients = response.items;
                $scope.totalRecords = response.totalRecords || 0;
                $scope.totalPages = Math.ceil($scope.totalRecords / $scope.pageSize);
            } 
            // Fallback nếu API trả về Array trực tiếp (chưa chuẩn PagedResult)
            else if (Array.isArray(response)) {
                $scope.patients = response;
                $scope.totalRecords = response.length;
                $scope.totalPages = 1;
            }
            
            console.log('Loaded:', $scope.patients.length, 'Total:', $scope.totalRecords);
            // Debug first item
            if ($scope.patients.length > 0) {
                console.log('First patient sample:', $scope.patients[0]);
            }
        })
        .catch(function(error) {
            $scope.loading.patients = false;
            $scope.errors.patients = 'Không thể tải dữ liệu';
            console.error('Error:', error);
            // Local fallback logic could go here
        });
    };

    /**
     * Chuyển trang
     * @param {number} page - Trang đích
     */
    $scope.changePage = function(page) {
        if (page < 1 || page > $scope.totalPages || page === $scope.currentPage) return;
        $scope.loadPatients(page);
    };
    
    /**
     * Lấy danh sách số trang để hiển thị
     * @returns {Array} Mảng các số trang
     */
    $scope.getPages = function() {
        var pages = [];
        var start = Math.max(1, $scope.currentPage - 2);
        var end = Math.min($scope.totalPages, start + 4);
        
        if (end - start < 4) {
            start = Math.max(1, end - 4);
        }
        
        for (var i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };
    
    /**
     * Filter locally if API search fails
     * @param {string} keyword - Từ khóa tìm kiếm
     */
    $scope.filterPatientsLocally = function(keyword) {
        if (!$scope.allPatients) {
            $scope.allPatients = $scope.patients.slice();
        }
        
        var lowerKeyword = keyword.toLowerCase();
        $scope.patients = $scope.allPatients.filter(function(p) {
            return (p.hoTen && p.hoTen.toLowerCase().includes(lowerKeyword)) ||
                   (p.maBenhNhan && p.maBenhNhan.toString().includes(keyword)) ||
                   (p.soDienThoai && p.soDienThoai.includes(keyword)) ||
                   (p.soTheBaoHiem && p.soTheBaoHiem.includes(keyword));
        });
    };
    
    /**
     * Mở modal thêm bệnh nhân mới
     */
    $scope.openAddPatient = function() {
        if (window.PatientModal) {
            PatientModal.open(null, function() {
                $scope.loadPatients();
            });
        }
    };
    
    /**
     * Mở modal sửa bệnh nhân
     * @param {Object} patient - Bệnh nhân cần sửa
     */
    $scope.editPatient = function(patient) {
        console.log('Edit patient:', patient);
        if (window.PatientModal) {
            PatientModal.open(patient, function() {
                $scope.loadPatients();
            });
        }
    };
    
    /**
     * Xem chi tiết bệnh nhân
     * @param {Object} patient - Bệnh nhân
     */
    $scope.viewPatient = function(patient) {
        console.log('View patient:', patient);
        if (window.PatientModal) {
            // Open modal in View Only mode (3rd param = true)
            PatientModal.open(patient, null, true);
        }
    };
    
    /**
     * Xóa bệnh nhân
     * @param {Object} patient - Bệnh nhân cần xóa
     */
    $scope.deletePatient = function(patient) {
        if (!confirm('Bạn có chắc muốn xóa bệnh nhân "' + patient.hoTen + '"?')) {
            return;
        }
        
        var patientId = patient.maBenhNhan || patient.id;
        console.log('Deleting patient:', patientId);
        
        $scope.PatientService.delete(patientId)
            .then(function(response) {
                console.log('Delete success:', response);
                // Remove from list
                var index = $scope.patients.indexOf(patient);
                if (index > -1) {
                    $scope.patients.splice(index, 1);
                }
                alert('Đã xóa bệnh nhân thành công!');
            })
            .catch(function(error) {
                console.error('Delete error:', error);
                alert('Không thể xóa bệnh nhân. Vui lòng thử lại.');
            });
    };
    
    /**
     * Format ngày tháng
     * @param {string} dateStr - Date string
     * @returns {string} Formatted date
     */
    $scope.formatDate = function(dateStr) {
        if (!dateStr) return '';
        try {
            var date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN');
        } catch (e) {
            return dateStr;
        }
    };
    
    console.log('PatientController initialized');
}

// Expose to window for debugging
window.initPatientController = initPatientController;
