/* ============================
   DEPARTMENT CONTROLLER - department.controller.js
   Controller cho quản lý Khoa phòng
=============================== */

// Extend AdminController with department functions
angular.module('hospitalApp')
.run(['$rootScope', function($rootScope) {
    
    // Add department controller functions to scope when admin controller is ready
    $rootScope.$on('adminControllerReady', function(event, scope) {
        initDepartmentController(scope);
    });
    
}]);

/**
 * Initialize department controller
 * @param {Object} $scope - Angular scope
 */
function initDepartmentController($scope) {
    console.log('Initializing DepartmentController');
    
    // Department list state
    $scope.departmentList = [];
    $scope.departmentLoading = false;
    $scope.departmentError = null;
    
    // Search state
    $scope.departmentSearchKeyword = '';
    
    // Pagination
    $scope.deptCurrentPage = 1;
    $scope.deptPageSize = 10;
    $scope.deptTotalRecords = 0;
    
    /**
     * Load danh sách khoa phòng
     */
    $scope.loadDepartmentList = function() {
        console.log('Loading department list...');
        $scope.departmentLoading = true;
        $scope.departmentError = null;
        
        $scope.DepartmentService.getAll()
            .then(function(response) {
                $scope.departmentLoading = false;
                if (Array.isArray(response)) {
                    $scope.departmentList = response;
                    $scope.deptTotalRecords = response.length;
                    
                    // Tính số giường hiện có cho mỗi khoa
                    $scope.calculateBedCountPerDepartment();
                } else {
                    $scope.departmentList = [];
                }
                console.log('Loaded departments:', $scope.departmentList.length);
            })
            .catch(function(error) {
                $scope.departmentLoading = false;
                $scope.departmentError = 'Không thể tải danh sách khoa phòng';
                console.error('Error loading departments:', error);
            });
    };
    
    /**
     * Tính số giường hiện có cho mỗi khoa (từ danh sách beds đã load)
     */
    $scope.calculateBedCountPerDepartment = function() {
        // Đếm giường mỗi khoa từ $scope.beds (đã load từ bed controller)
        var bedCountMap = {};
        var occupiedCountMap = {};
        
        if ($scope.beds && $scope.beds.length > 0) {
            $scope.beds.forEach(function(bed) {
                var khoaId = bed.khoaId;
                if (khoaId) {
                    bedCountMap[khoaId] = (bedCountMap[khoaId] || 0) + 1;
                    if (bed.tenBenhNhan || bed.trangThai === 1) {
                        occupiedCountMap[khoaId] = (occupiedCountMap[khoaId] || 0) + 1;
                    }
                }
            });
        }
        
        // Gán vào departmentList
        $scope.departmentList.forEach(function(dept) {
            dept.soGiuongHienCo = bedCountMap[dept.id] || 0;
            dept.soGiuongDangDung = occupiedCountMap[dept.id] || 0;
        });
    };
    
    /**
     * Tìm kiếm khoa phòng
     */
    $scope.searchDepartments = function() {
        console.log('Searching departments:', $scope.departmentSearchKeyword);
        // Search thực hiện qua getFilteredDepartments
    };
    
    /**
     * Lấy danh sách khoa đã filter
     */
    $scope.getFilteredDepartments = function() {
        var filtered = $scope.departmentList;
        
        if ($scope.departmentSearchKeyword && $scope.departmentSearchKeyword.trim() !== '') {
            var keyword = $scope.departmentSearchKeyword.toLowerCase().trim();
            filtered = filtered.filter(function(dept) {
                var tenKhoa = (dept.tenKhoa || '').toLowerCase();
                var loaiKhoa = (dept.loaiKhoa || '').toLowerCase();
                var id = (dept.id || '').toLowerCase();
                return tenKhoa.indexOf(keyword) !== -1 || 
                       loaiKhoa.indexOf(keyword) !== -1 ||
                       id.indexOf(keyword) !== -1;
            });
        }
        
        return filtered;
    };
    
    /**
     * Mở modal thêm khoa mới
     */
    $scope.openAddDepartment = function() {
        if (window.DepartmentModal) {
            DepartmentModal.open(null, function() {
                $scope.loadDepartmentList();
            });
        }
    };
    
    /**
     * Mở modal sửa khoa
     */
    $scope.editDepartment = function(dept) {
        console.log('Edit department:', dept);
        if (window.DepartmentModal) {
            DepartmentModal.open(dept, function() {
                $scope.loadDepartmentList();
            });
        }
    };
    
    /**
     * Xem chi tiết khoa
     */
    $scope.viewDepartment = function(dept) {
        console.log('View department:', dept);
        if (window.DepartmentModal) {
            DepartmentModal.open(dept, null, true); // viewOnly
        }
    };
    
    /**
     * Xóa khoa
     */
    $scope.deleteDepartment = function(dept) {
        if (!confirm('Bạn có chắc muốn xóa khoa "' + dept.tenKhoa + '"?\n\nLưu ý: Không thể xóa khoa đang có giường bệnh!')) {
            return;
        }
        
        console.log('Deleting department:', dept.id);
        
        $scope.DepartmentService.delete(dept.id)
            .then(function(response) {
                console.log('Delete success:', response);
                // Remove from list
                var index = $scope.departmentList.indexOf(dept);
                if (index > -1) {
                    $scope.departmentList.splice(index, 1);
                }
                alert('Đã xóa khoa thành công!');
            })
            .catch(function(error) {
                console.error('Delete error:', error);
                var msg = error.data?.message || 'Không thể xóa khoa. Vui lòng thử lại.';
                alert(msg);
            });
    };
    
    console.log('DepartmentController initialized');
}

// Expose to window for debugging
window.initDepartmentController = initDepartmentController;

// Global function for onclick
function openDepartmentModalJS() {
    var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
    if (scope && scope.openAddDepartment) {
        scope.openAddDepartment();
    } else if (window.DepartmentModal) {
        DepartmentModal.open(null);
    }
}
