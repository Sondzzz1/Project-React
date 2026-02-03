/* ============================
   DOCTOR CONTROLLER - doctor.controller.js
   Controller for Doctor management
=============================== */

angular.module('hospitalApp')
.controller('DoctorController', ['$scope', 'DoctorService', 'DepartmentService', '$timeout', function($scope, DoctorService, DepartmentService, $timeout) {
    
    // --- State Variables ---
    $scope.doctors = [];
    $scope.departments = []; 
    $scope.loading = { doctors: false };
    $scope.errors = { doctors: null };
    $scope.doctorSearchKeyword = '';
    
    // Pagination
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $scope.totalRecords = 0;
    $scope.totalPages = 0;

    // --- Init ---
    $scope.init = function() {
        console.log('DoctorController initialized');
        $scope.loadDepartments();
        $scope.loadDoctors();
    };

    // --- Load Departments for Filter/Modal ---
    $scope.loadDepartments = function() {
        DepartmentService.getAll().then(function(data) {
            $scope.departments = data || [];
        }).catch(function(err) {
            console.error('Failed to load departments:', err);
        });
    };

    // --- Load Doctors (with Search/Pagination) ---
    $scope.loadDoctors = function(page) {
        page = page || 1;
        $scope.loading.doctors = true;
        $scope.errors.doctors = null;
        
        var searchPayload = {
            keyword: $scope.doctorSearchKeyword || '',
            pageNumber: page,
            pageSize: $scope.pageSize
        };

        // Use Search endpoint for everything to support pagination transparently
        DoctorService.search(searchPayload).then(function(result) {
            // result format from API: { data: [...], pageNumber, pageSize, totalRecords, ... }
            if (result) {
                $scope.doctors = result.data || [];
                $scope.totalRecords = result.totalRecords || 0;
                $scope.totalPages = result.totalPages || 0;
                $scope.currentPage = result.pageNumber || page;
            } else {
                $scope.doctors = [];
            }
        }).catch(function(err) {
            console.error('Error loading doctors:', err);
            $scope.errors.doctors = 'Không thể tải danh sách bác sĩ.';
        }).finally(function() {
            $scope.loading.doctors = false;
        });
    };

    // --- Actions ---
    $scope.searchDoctors = function() {
        // If search is empty, reset and load all
        if (!$scope.doctorSearchKeyword || $scope.doctorSearchKeyword.trim() === '') {
            $scope.doctorSearchKeyword = '';
        }
        $scope.loadDoctors(1);
    };

    $scope.changePage = function(page) {
        if (page < 1 || page > $scope.totalPages) return;
        $scope.loadDoctors(page);
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
    $scope.editDoctor = function(doctor) {
        // Open Modal (we will create openDoctorModalJS soon)
        if (window.openDoctorModalJS) {
            window.openDoctorModalJS(doctor, function() {
                $scope.loadDoctors($scope.currentPage);
            });
        }
    };

    $scope.deleteDoctor = function(doctor) {
        if (!confirm('Bạn có chắc chắn muốn xóa bác sĩ: ' + doctor.hoTen + '?')) return;
        
        DoctorService.delete(doctor.id).then(function(res) {
            alert('Đã xóa bác sĩ thành công');
            // Reload without showing errors (silently)
            try {
                $scope.loadDoctors($scope.currentPage);
            } catch(e) {
                console.warn('Reload after delete failed:', e);
            }
        }).catch(function(err) {
            console.error('Delete error:', err);
            var msg = 'Có lỗi khi xóa.';
            if (err && err.data && err.data.message) {
                msg = err.data.message;
            }
            alert('Lỗi xóa bác sĩ:\n' + msg);
        });
    };

    // --- Helper to get Department Name ---
    $scope.getDepartmentName = function(khoaId) {
        if (!khoaId) return '';
        var dept = $scope.departments.find(function(d) { return d.id === khoaId; });
        return dept ? dept.tenKhoa : '---';
    };

    // Init on load if main controller is ready
    $timeout(function() {
        $scope.init();
    });

}]);
