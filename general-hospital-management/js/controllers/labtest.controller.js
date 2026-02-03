(function() {
    'use strict';

    angular.module('hospitalApp')
        .controller('LabTestController', [
            '$scope',
            'LabTestService',
            'UtilityService',
            function($scope, LabTestService, UtilityService) {
                
                // ============================================
                // SCOPE VARIABLES
                // ============================================
                $scope.labTests = [];
                $scope.loading = false;
                $scope.errorMessage = '';
                $scope.searchKeyword = '';
                
                // Pagination
                $scope.pagination = {
                    page: 1,
                    pageSize: 10,
                    total: 0
                };
                
                // Modal
                $scope.showModal = false;
                $scope.isEditing = false;
                $scope.formData = {};
                $scope.formError = null;
                $scope.isSaving = false;

                // ============================================
                // LOAD DATA
                // ============================================
                $scope.loadLabTests = function(page) {
                    $scope.loading = true;
                    $scope.errorMessage = '';
                    
                    if (page) {
                        $scope.pagination.page = page;
                    }

                    // If searching
                    if ($scope.searchKeyword && $scope.searchKeyword.trim() !== '') {
                        var searchRequest = {
                            tenXetNghiem: $scope.searchKeyword,
                            pageIndex: $scope.pagination.page,
                            pageSize: $scope.pagination.pageSize
                        };
                        
                        LabTestService.search(searchRequest)
                            .then(function(response) {
                                $scope.loading = false;
                                if (response && response.data) {
                                    $scope.labTests = response.data.items || response.data;
                                    $scope.pagination.total = response.data.totalCount || $scope.labTests.length;
                                }
                            })
                            .catch(function(error) {
                                $scope.loading = false;
                                console.error('Error searching lab tests:', error);
                                $scope.errorMessage = 'Không thể tìm kiếm xét nghiệm.';
                            });
                    } else {
                        // Load all
                        LabTestService.getAll()
                            .then(function(response) {
                                $scope.loading = false;
                                if (Array.isArray(response)) {
                                    $scope.labTests = response;
                                    $scope.pagination.total = response.length;
                                } else if (response && response.data) {
                                    $scope.labTests = response.data; // Adjust based on actual API response structure
                                }
                            })
                            .catch(function(error) {
                                $scope.loading = false;
                                console.error('Error loading lab tests:', error);
                                $scope.errorMessage = 'Không thể tải danh sách xét nghiệm.';
                            });
                    }
                };

                // Watch for section change in parent controller
                // If the parent switches to 'labtests', load data
                $scope.$watch('currentSection', function(newVal) {
                    if (newVal === 'labtests') {
                        $scope.loadLabTests(1);
                    }
                });

                // ============================================
                // ACTIONS
                // ============================================
                
                $scope.search = function() {
                    $scope.loadLabTests(1);
                };
                
                $scope.refresh = function() {
                    $scope.searchKeyword = '';
                    $scope.loadLabTests(1);
                };

                // Open Modal (Add or Edit)
                $scope.openModal = function(item) {
                    $scope.formError = null;
                    if (item) {
                        $scope.isEditing = true;
                        
                        var dateVal = item.ngay ? new Date(item.ngay) : new Date();
                        // Strip seconds and milliseconds to avoid HTML5 validation errors (step mismatch)
                        dateVal.setSeconds(0);
                        dateVal.setMilliseconds(0);

                        $scope.formData = {
                            id: item.id,
                            nhapVienId: item.nhapVienId,
                            loaiXetNghiem: item.loaiXetNghiem,
                            ketQua: item.ketQua,
                            donGia: item.donGia,
                            ngay: dateVal
                        };
                    } else {
                        $scope.isEditing = false;
                        var now = new Date();
                        now.setSeconds(0);
                        now.setMilliseconds(0);
                        
                        $scope.formData = {
                            loaiXetNghiem: '',
                            ketQua: '',
                            donGia: 0,
                            ngay: now,
                            nhapVienId: ''
                        };
                    }
                    $scope.showModal = true;
                };

                // Close Modal
                $scope.closeModal = function() {
                    $scope.showModal = false;
                    $scope.formData = {};
                    $scope.formError = null;
                };

                // Save Data
                $scope.save = function() {
                    $scope.isSaving = true;
                    $scope.formError = null;

                    // Basic validation
                    if (!$scope.formData.loaiXetNghiem) {
                         $scope.formError = "Vui lòng nhập loại xét nghiệm";
                         $scope.isSaving = false;
                         return;
                    }
                    if (!$scope.formData.donGia && $scope.formData.donGia !== 0) {
                         $scope.formError = "Vui lòng nhập đơn giá";
                         $scope.isSaving = false;
                         return;
                    }

                    var payload = {
                        id: $scope.formData.id,
                        nhapVienId: $scope.formData.nhapVienId || null,
                        loaiXetNghiem: $scope.formData.loaiXetNghiem,
                        ketQua: $scope.formData.ketQua,
                        donGia: $scope.formData.donGia,
                        ngay: $scope.formData.ngay
                    };

                    var promise;
                    if ($scope.isEditing) {
                        promise = LabTestService.update($scope.formData.id, payload);
                    } else {
                        promise = LabTestService.create(payload);
                    }

                    promise.then(function(response) {
                        if (response.success) {
                            $scope.closeModal();
                            $scope.loadLabTests();
                             // Using standard alert until UtilityService is confirmed to have showNotification
                            alert($scope.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                        } else {
                            $scope.formError = response.message || 'Thao tác thất bại';
                        }
                        $scope.isSaving = false;
                    }, function(err) {
                         $scope.formError = 'Lỗi: ' + (err.data ? err.data.message : err.statusText);
                         $scope.isSaving = false;
                    });
                };

                $scope.delete = function(labTest) {
                    if (!confirm('Bạn có chắc chắn muốn xóa xét nghiệm: ' + labTest.tenXetNghiem + '?')) {
                        return;
                    }

                    LabTestService.delete(labTest.maXetNghiem || labTest.id)
                        .then(function() {
                            UtilityService.showNotification('Đã xóa thành công!', 'success');
                            $scope.loadLabTests();
                        })
                        .catch(function(error) {
                            console.error('Error deleting lab test:', error);
                            alert('Không thể xóa. ' + (error.data?.message || 'Có lỗi xảy ra.'));
                        });
                };
            }
        ]);
})();
