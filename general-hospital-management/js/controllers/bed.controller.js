/* ============================
   BED CONTROLLER - bed.controller.js
   Controller cho quản lý Giường bệnh & Khoa phòng
=============================== */

// Extend AdminController with bed functions
angular.module('hospitalApp')
.run(['$rootScope', function($rootScope) {
    
    // Add bed controller functions to scope when admin controller is ready
    $rootScope.$on('adminControllerReady', function(event, scope) {
        initBedController(scope);
    });
    
}]);

/**
 * Initialize bed controller
 * @param {Object} $scope - Angular scope
 */
function initBedController($scope) {
    console.log('Initializing BedController');
    
    // Bed state
    $scope.beds = [];
    $scope.bedLoading = false;
    $scope.bedError = null;
    
    // Department state
    $scope.departments = [];
    $scope.departmentLoading = false;
    
    // Inpatient state (danh sách nội trú)
    $scope.inpatients = [];
    
    // Search state
    $scope.bedSearchKeyword = '';
    
    // Pagination
    $scope.bedCurrentPage = 1;
    $scope.bedPageSize = 10;
    $scope.bedTotalRecords = 0;
    $scope.bedTotalPages = 0;
    
    /**
     * Tìm kiếm giường theo keyword
     */
    $scope.searchBeds = function() {
        console.log('Searching beds with keyword:', $scope.bedSearchKeyword);
        // Search được thực hiện trong getFilteredBeds() dựa trên bedSearchKeyword
        // Trigger re-render bằng cách force digest nếu cần
    };
    
    /**
     * Load tất cả khoa phòng (dùng cho dropdown)
     */
    $scope.loadDepartments = function() {
        console.log('Loading departments...');
        $scope.departmentLoading = true;
        
        $scope.DepartmentService.getAll()
            .then(function(response) {
                $scope.departmentLoading = false;
                if (Array.isArray(response)) {
                    $scope.departments = response;
                } else {
                    $scope.departments = [];
                }
                console.log('Loaded departments:', $scope.departments.length);
            })
            .catch(function(error) {
                $scope.departmentLoading = false;
                console.error('Error loading departments:', error);
            });
    };
    
    /**
     * Load danh sách nội trú (bệnh nhân đang nằm viện)
     */
    $scope.loadInpatients = function() {
        console.log('Loading inpatients...');
        
        if (!$scope.AdmissionService) {
            console.warn('AdmissionService not available');
            return;
        }
        
        $scope.AdmissionService.getInpatientList()
            .then(function(response) {
                if (Array.isArray(response)) {
                    $scope.inpatients = response;
                    // Merge inpatient info into beds
                    $scope.mergeInpatientsWithBeds();
                } else {
                    $scope.inpatients = [];
                }
                console.log('Loaded inpatients:', $scope.inpatients.length);
            })
            .catch(function(error) {
                console.error('Error loading inpatients:', error);
            });
    };
    
    /**
     * Merge thông tin bệnh nhân vào danh sách giường
     * VÀ cập nhật trạng thái giường dựa trên có BN hay không
     */
    $scope.mergeInpatientsWithBeds = function() {
        // Tạo map giuongId -> inpatient info
        var inpatientMap = {};
        $scope.inpatients.forEach(function(ip) {
            if (ip.giuongId) {
                inpatientMap[ip.giuongId] = ip;
            }
        });
        
        // Merge vào beds VÀ cập nhật trạng thái
        $scope.beds.forEach(function(bed) {
            var inpatient = inpatientMap[bed.id];
            if (inpatient) {
                bed.tenBenhNhan = inpatient.tenBenhNhan || (inpatient.benhNhan && inpatient.benhNhan.hoTen);
                bed.maBenhNhan = inpatient.maBenhNhan || (inpatient.benhNhan && inpatient.benhNhan.id);
                bed.ngayNhapVien = inpatient.ngayNhap || inpatient.ngayNhapVien;
                bed.nhapVienId = inpatient.id;
                // CẬP NHẬT TRẠNG THÁI: Có BN = Đang sử dụng
                bed.trangThai = 1;
                bed.trangThaiText = 'Đang sử dụng';
            } else {
                bed.tenBenhNhan = null;
                bed.maBenhNhan = null;
                bed.ngayNhapVien = null;
                bed.nhapVienId = null;
                // Trống
                bed.trangThai = 0;
                bed.trangThaiText = 'Trống';
            }
        });
        
        // Tính toán thống kê theo khoa
        $scope.calculateDepartmentStats();
        
        console.log('Merged inpatients with beds');
    };
    
    // ========== FILTER LOGIC ==========
    
    // Filter state
    $scope.selectedDepartmentFilter = '';
    $scope.selectedStatusFilter = 'all'; // 'all', 'available', 'occupied'
    
    /**
     * Filter giường theo trạng thái
     * @param {string} status - 'all', 'available', 'occupied'
     */
    $scope.filterByStatus = function(status) {
        $scope.selectedStatusFilter = status;
    };
    
    /**
     * Lấy danh sách giường đã filter
     * @returns {Array} Danh sách giường đã lọc
     */
    $scope.getFilteredBeds = function() {
        var filtered = $scope.beds;
        
        // Filter theo keyword (tìm kiếm)
        if ($scope.bedSearchKeyword && $scope.bedSearchKeyword.trim() !== '') {
            var keyword = $scope.bedSearchKeyword.toLowerCase().trim();
            filtered = filtered.filter(function(bed) {
                var tenGiuong = (bed.tenGiuong || '').toLowerCase();
                var id = (bed.id || '').toLowerCase();
                var tenBenhNhan = (bed.tenBenhNhan || '').toLowerCase();
                return tenGiuong.indexOf(keyword) !== -1 || 
                       id.indexOf(keyword) !== -1 ||
                       tenBenhNhan.indexOf(keyword) !== -1;
            });
        }
        
        // Filter theo khoa
        if ($scope.selectedDepartmentFilter) {
            filtered = filtered.filter(function(bed) {
                return bed.khoaId === $scope.selectedDepartmentFilter;
            });
        }
        
        // Filter theo trạng thái
        if ($scope.selectedStatusFilter === 'available') {
            filtered = filtered.filter(function(bed) {
                return bed.trangThai === 0 || !bed.tenBenhNhan;
            });
        } else if ($scope.selectedStatusFilter === 'occupied') {
            filtered = filtered.filter(function(bed) {
                return bed.trangThai === 1 || bed.tenBenhNhan;
            });
        }
        
        return filtered;
    };
    
    // ========== THỐNG KÊ THEO KHOA ==========
    
    $scope.departmentStats = [];
    
    /**
     * Tính toán thống kê giường theo từng khoa
     */
    $scope.calculateDepartmentStats = function() {
        var statsMap = {};
        
        // Nhóm giường theo khoa
        $scope.beds.forEach(function(bed) {
            var khoaId = bed.khoaId;
            if (!statsMap[khoaId]) {
                statsMap[khoaId] = {
                    khoaId: khoaId,
                    tenKhoa: $scope.getDepartmentName(khoaId),
                    total: 0,
                    occupied: 0,
                    available: 0
                };
            }
            statsMap[khoaId].total++;
            if (bed.tenBenhNhan || bed.trangThai === 1) {
                statsMap[khoaId].occupied++;
            } else {
                statsMap[khoaId].available++;
            }
        });
        
        // Chuyển map thành array và tính %
        $scope.departmentStats = Object.values(statsMap).map(function(stat) {
            stat.percentage = stat.total > 0 ? Math.round((stat.occupied / stat.total) * 100) : 0;
            return stat;
        });
        
        console.log('Department stats calculated:', $scope.departmentStats);
    };
    
    /**
     * Load tất cả giường bệnh
     */
    $scope.loadBeds = function() {
        console.log('Loading beds...');
        $scope.bedLoading = true;
        $scope.bedError = null;
        
        $scope.BedService.getAll()
            .then(function(response) {
                $scope.bedLoading = false;
                if (Array.isArray(response)) {
                    $scope.beds = response;
                    $scope.bedTotalRecords = response.length;
                    $scope.bedTotalPages = Math.ceil($scope.bedTotalRecords / $scope.bedPageSize);
                    
                    // Also load inpatients to get patient info
                    $scope.loadInpatients();
                } else {
                    $scope.beds = [];
                }
                console.log('Loaded beds:', $scope.beds.length);
            })
            .catch(function(error) {
                $scope.bedLoading = false;
                $scope.bedError = 'Không thể tải danh sách giường bệnh';
                console.error('Error loading beds:', error);
            });
    };
    
    /**
     * Lấy tên khoa từ ID
     */
    $scope.getDepartmentName = function(khoaId) {
        var dept = $scope.departments.find(function(d) {
            return d.id === khoaId;
        });
        return dept ? dept.tenKhoa : 'Không xác định';
    };
    
    /**
     * Mở modal thêm giường mới
     */
    $scope.openAddBed = function() {
        if (window.BedModal) {
            BedModal.open(null, $scope.departments, function() {
                $scope.loadBeds();
            });
        }
    };
    
    /**
     * Mở modal sửa giường
     * @param {Object} bed - Giường cần sửa
     */
    $scope.editBed = function(bed) {
        console.log('Edit bed:', bed);
        if (window.BedModal) {
            BedModal.open(bed, $scope.departments, function() {
                $scope.loadBeds();
            });
        }
    };
    
    /**
     * Xem chi tiết giường
     * @param {Object} bed - Giường
     */
    $scope.viewBed = function(bed) {
        console.log('View bed:', bed);
        if (window.BedModal) {
            BedModal.open(bed, $scope.departments, null, true); // viewOnly
        }
    };

    /**
     * Mở modal Nhập viện cho giường này
     */
    $scope.openAdmitModal = function(bed) {
        console.log('Open Admit Modal for bed:', bed);
        if (window.AdmissionModal) {
            AdmissionModal.open(bed, function() {
                // Refresh list on success
                $scope.loadBeds();
            });
        } else {
            console.error('AdmissionModal not loaded!');
        }
    };
    
    /**
     * Xóa giường
     * @param {Object} bed - Giường cần xóa
     */
    $scope.deleteBed = function(bed) {
        if (!confirm('Bạn có chắc muốn xóa giường "' + bed.tenGiuong + '"?')) {
            return;
        }
        
        console.log('Deleting bed:', bed.id);
        
        $scope.BedService.delete(bed.id)
            .then(function(response) {
                console.log('Delete success:', response);
                // Remove from list
                var index = $scope.beds.indexOf(bed);
                if (index > -1) {
                    $scope.beds.splice(index, 1);
                }
                alert('Đã xóa giường thành công!');
            })
            .catch(function(error) {
                console.error('Delete error:', error);
                alert('Không thể xóa giường. Vui lòng thử lại.');
            });
    };
    
    /**
     * Format giá tiền
     * @param {number} price - Giá
     * @returns {string} Giá đã format
     */
    $scope.formatPrice = function(price) {
        if (!price) return '0 đ';
        return price.toLocaleString('vi-VN') + ' đ';
    };
    
    /**
     * Lấy class badge theo trạng thái
     * @param {number} status - Trạng thái (0: Trống, 1: Đang sử dụng)
     * @returns {string} CSS class
     */
    $scope.getBedStatusClass = function(status) {
        return status === 1 ? 'badge-danger' : 'badge-success';
    };
    
    /**
     * Lấy text trạng thái
     * @param {number} status - Trạng thái
     * @returns {string} Text
     */
    $scope.getBedStatusText = function(status) {
        return status === 1 ? 'Đang sử dụng' : 'Trống';
    };
    
    console.log('BedController initialized');
}

// Expose to window for debugging
window.initBedController = initBedController;
