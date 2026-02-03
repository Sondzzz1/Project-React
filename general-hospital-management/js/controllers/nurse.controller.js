/* ============================
   NURSE CONTROLLER - nurse.controller.js
   Controller for Nurse/YTa management
=============================== */

angular.module('hospitalApp')
.controller('NurseController', ['$scope', 'NurseService', 'DepartmentService', '$timeout', function($scope, NurseService, DepartmentService, $timeout) {
    
    // --- State Variables ---
    $scope.nurses = [];
    $scope.departments = []; 
    $scope.loading = { nurses: false };
    $scope.errors = { nurses: null };
    $scope.nurseSearchKeyword = '';
    
    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalRecords = 0;
    $scope.totalPages = 0;

    // --- Init ---
    $scope.init = function() {
        console.log('NurseController initialized');
        $scope.loadDepartments();
        $scope.loadNurses();
    };

    // --- Load Departments for Filter/Modal ---
    $scope.loadDepartments = function() {
        DepartmentService.getAll().then(function(data) {
            $scope.departments = data || [];
        }).catch(function(err) {
            console.error('Failed to load departments:', err);
        });
    };

    // --- Load Nurses (with Search/Pagination) ---
    $scope.loadNurses = function(page) {
        page = page || 1;
        $scope.loading.nurses = true;
        $scope.errors.nurses = null;
        
        var keyword = $scope.nurseSearchKeyword || '';
        var searchPayload = {
            pageIndex: page,
            pageSize: $scope.pageSize,
            hoTen: null,
            soDienThoai: null
        };
        
        // Smart Search: Check if keyword is numeric
        if (keyword) {
             if (/^\d+$/.test(keyword)) {
                 searchPayload.soDienThoai = keyword;
             } else {
                 searchPayload.hoTen = keyword;
             }
        }

        NurseService.search(searchPayload).then(function(result) {
            // result is PagedResult<YTaViewDTO>
            if (result) {
                $scope.nurses = result.items || [];
                $scope.totalRecords = result.totalRecords || 0;
                $scope.totalPages = Math.ceil($scope.totalRecords / $scope.pageSize);
                $scope.currentPage = result.pageIndex || page;
            } else {
                $scope.nurses = [];
            }
        }).catch(function(err) {
            console.error('Error loading nurses:', err);
            $scope.errors.nurses = 'Không thể tải danh sách y tá.';
        }).finally(function() {
            $scope.loading.nurses = false;
        });
    };

    // --- Actions ---
    $scope.searchNurses = function() {
        // If search is empty, reset and load all
        if (!$scope.nurseSearchKeyword || $scope.nurseSearchKeyword.trim() === '') {
            $scope.nurseSearchKeyword = '';
        }
        $scope.loadNurses(1);
    };

    $scope.changePage = function(page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.loadNurses(page);
    };

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

    // --- CRUD Actions (Called from UI) ---
    $scope.editNurse = function(nurse) {
        if (window.openNurseModalJS) {
            window.openNurseModalJS(nurse, function() {
                $scope.loadNurses($scope.currentPage);
            });
        }
    };

    $scope.deleteNurse = function(nurse) {
        if (!confirm('Bạn có chắc chắn muốn xóa y tá: ' + nurse.hoTen + '?')) return;
        
        NurseService.delete(nurse.id).then(function(res) {
            alert('Đã xóa y tá thành công');
            // Reload without showing errors (silently)
            try {
                $scope.loadNurses($scope.currentPage);
            } catch(e) {
                console.warn('Reload after delete failed:', e);
            }
        }).catch(function(err) {
            console.error('Delete error:', err);
            var msg = 'Có lỗi khi xóa.';
            if (err && err.data && err.data.message) {
                msg = err.data.message;
            }
            alert('Lỗi xóa y tá:\n' + msg);
        });
    };

    // --- Helper to get Department Name ---
    $scope.getDepartmentName = function(khoaId) {
        if (!khoaId) return '';
        var dept = $scope.departments.find(function(d) { return d.id === khoaId; });
        return dept ? dept.tenKhoa : '---';
    };

    // Init on load
    $timeout(function() {
        $scope.init();
    });

}]);
