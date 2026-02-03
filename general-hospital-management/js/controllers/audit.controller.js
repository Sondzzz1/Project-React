
(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .controller('AuditController', AuditController);

    AuditController.$inject = ['$scope', 'AuditService'];

    function AuditController($scope, AuditService) {
        $scope.auditTab = 'system'; // 'system' or 'medical'

        var now = new Date();
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);

        // Search models
        $scope.search = {
            tuNgay: oneWeekAgo,
            denNgay: now,
            hanhDong: '',
            pageNumber: 1,
            pageSize: 10
        };

        $scope.pagination = {
            system: { totalPages: 0, totalRecords: 0 },
            medical: { totalPages: 0, totalRecords: 0 }
        };

        $scope.systemLogs = [];
        $scope.medicalLogs = [];
        
        $scope.loading = { system: false, medical: false };
        $scope.errors = { system: null, medical: null };

        // --- Init ---
        $scope.$watch('currentSection', function(newVal) {
            if (newVal === 'settings') { // Mapped to 'settings' ID in HTML
                loadCurrentTab();
            }
        });

        $scope.switchAuditTab = function(tab) {
            $scope.auditTab = tab;
            $scope.search.pageNumber = 1; // Reset page
            loadCurrentTab();
        };

        $scope.applySearch = function() {
            $scope.search.pageNumber = 1;
            loadCurrentTab();
        };
        
        $scope.changePage = function(p) {
            $scope.search.pageNumber = p;
            loadCurrentTab();
        };

        $scope.resetSearch = function() {
            $scope.search.hanhDong = '';
            $scope.search.tuNgay = oneWeekAgo;
            $scope.search.denNgay = now;
            $scope.applySearch();
        };

        function loadCurrentTab() {
            if ($scope.auditTab === 'system') {
                loadSystemLogs();
            } else {
                loadMedicalLogs();
            }
        }

        function loadSystemLogs() {
            $scope.loading.system = true;
            $scope.errors.system = null;
            
            AuditService.getSystemLogs($scope.search)
                .then(function(response) {
                    // response.data = { success: true, data: PagedResult }
                    if (response.data && response.data.success) {
                        var pagedResult = response.data.data;
                        var rawItems = pagedResult.data || pagedResult.Data || [];
                        
                        // Map to ensure camelCase for HTML
                        $scope.systemLogs = rawItems.map(function(item) {
                            return {
                                id: item.id || item.Id,
                                tenNguoiDung: item.tenNguoiDung || item.TenNguoiDung,
                                hanhDong: item.hanhDong || item.HanhDong,
                                moTa: item.moTa || item.MoTa,
                                thoiGian: item.thoiGian || item.ThoiGian
                            };
                        });
                        
                        $scope.pagination.system.totalRecords = pagedResult.totalRecords || pagedResult.TotalRecords || 0;
                        $scope.pagination.system.totalPages = pagedResult.totalPages || pagedResult.TotalPages || 1;
                    } else {
                        var rawItems = response.data.items || response.data || [];
                        $scope.systemLogs = rawItems.map(function(item) {
                            return {
                                id: item.id || item.Id,
                                tenNguoiDung: item.tenNguoiDung || item.TenNguoiDung,
                                hanhDong: item.hanhDong || item.HanhDong,
                                moTa: item.moTa || item.MoTa,
                                thoiGian: item.thoiGian || item.ThoiGian
                            };
                        });
                    }
                    $scope.loading.system = false;
                })
                .catch(function(err) {
                    $scope.errors.system = err.data ? err.data.message : 'Lỗi tải nhật ký hệ thống';
                    $scope.loading.system = false;
                });
        }

        function loadMedicalLogs() {
            $scope.loading.medical = true;
            $scope.errors.medical = null;

            AuditService.getMedicalRecordLogs($scope.search)
                .then(function(response) {
                    if (response.data && response.data.success) {
                        var pagedResult = response.data.data;
                        var rawItems = pagedResult.data || pagedResult.Data || [];
                        
                        $scope.medicalLogs = rawItems.map(function(item) {
                            return {
                                id: item.id || item.Id,
                                hoSoBenhAnId: item.hoSoBenhAnId || item.HoSoBenhAnId,
                                hanhDong: item.hanhDong || item.HanhDong,
                                chanDoanCu: item.chanDoanCu || item.ChanDoanCu,
                                tenNguoiSua: item.tenNguoiSua || item.TenNguoiSua,
                                thoiGianSua: item.thoiGianSua || item.ThoiGianSua
                            };
                        });

                        $scope.pagination.medical.totalRecords = pagedResult.totalRecords || pagedResult.TotalRecords || 0;
                        $scope.pagination.medical.totalPages = pagedResult.totalPages || pagedResult.TotalPages || 1;
                    } else {
                        var rawItems = response.data.items || response.data || [];
                        $scope.medicalLogs = rawItems.map(function(item) {
                            return {
                                id: item.id || item.Id,
                                hoSoBenhAnId: item.hoSoBenhAnId || item.HoSoBenhAnId,
                                hanhDong: item.hanhDong || item.HanhDong,
                                chanDoanCu: item.chanDoanCu || item.ChanDoanCu,
                                tenNguoiSua: item.tenNguoiSua || item.TenNguoiSua,
                                thoiGianSua: item.thoiGianSua || item.ThoiGianSua
                            };
                        });
                    }
                    $scope.loading.medical = false;
                })
                .catch(function(err) {
                    $scope.errors.medical = err.data ? err.data.message : 'Lỗi tải audit hồ sơ';
                    $scope.loading.medical = false;
                });
        }
        
        $scope.formatDate = function(dateStr) {
            if (!dateStr) return '-';
            return new Date(dateStr).toLocaleString('vi-VN');
        };
    }
})();
