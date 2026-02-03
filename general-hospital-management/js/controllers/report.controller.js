
(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .controller('ReportController', ReportController);

    ReportController.$inject = ['$scope', 'ReportService'];

    function ReportController($scope, ReportService) {
        $scope.reportTab = 'bed'; // 'bed' or 'cost'
        
        // Initial filters
        var now = new Date();
        var firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        
        $scope.filter = {
            tuNgay: firstDay,
            denNgay: now,
            khoaId: null
        };

        $scope.loading = { bed: false, cost: false };
        $scope.errors = { bed: null, cost: null };
        
        $scope.bedReport = null;
        $scope.costReport = null;

        // --- Init ---
        $scope.$watch('currentSection', function(newVal) {
            if (newVal === 'report') {
                loadCurrentTab();
            }
        });

        $scope.switchReportTab = function(tab) {
            $scope.reportTab = tab;
            loadCurrentTab();
        };

        $scope.applyFilter = function() {
            loadCurrentTab();
        };

        function loadCurrentTab() {
            if ($scope.reportTab === 'bed') {
                loadBedReport();
            } else {
                loadCostReport();
            }
        }

        // --- Bed Report ---
        function loadBedReport() {
            $scope.loading.bed = true;
            $scope.errors.bed = null;

            ReportService.getBedCapacityReport($scope.filter)
                .then(function(response) {
                    $scope.bedReport = response.data; // Assuming API returns data directly or wrapped
                    $scope.loading.bed = false;
                })
                .catch(function(err) {
                    $scope.errors.bed = err.data ? err.data.message : 'Lỗi tải báo cáo công suất giường';
                    $scope.loading.bed = false;
                });
        }

        $scope.exportBedExcel = function() {
            ReportService.exportBedExcel($scope.filter)
                .then(function(response) {
                    downloadFile(response.data, 'BaoCao_CongSuatGiuong.xlsx');
                })
                .catch(function(err) {
                    alert('Lỗi xuất Excel: ' + (err.data ? err.data.message : 'Không xác định'));
                });
        };

        $scope.exportBedPdf = function() {
            ReportService.exportBedPdf($scope.filter)
                .then(function(response) {
                    downloadFile(response.data, 'BaoCao_CongSuatGiuong.pdf');
                })
                .catch(function(err) {
                    alert('Lỗi xuất PDF: ' + (err.data ? err.data.message : 'Không xác định'));
                });
        };

        // --- Cost Report ---
        function loadCostReport() {
            $scope.loading.cost = true;
            $scope.errors.cost = null;

            ReportService.getTreatmentCostReport($scope.filter)
                .then(function(response) {
                    $scope.costReport = response.data;
                    $scope.loading.cost = false;
                })
                .catch(function(err) {
                    $scope.errors.cost = err.data ? err.data.message : 'Lỗi tải báo cáo chi phí';
                    $scope.loading.cost = false;
                });
        }

        $scope.exportCostExcel = function() {
            ReportService.exportCostExcel($scope.filter)
                .then(function(response) {
                    downloadFile(response.data, 'BaoCao_ChiPhi.xlsx');
                })
                .catch(function(err) {
                    alert('Lỗi xuất Excel: ' + err.statusText);
                });
        };
        
        $scope.exportCostPdf = function() {
            ReportService.exportCostPdf($scope.filter)
                .then(function(response) {
                    downloadFile(response.data, 'BaoCao_ChiPhi.pdf');
                })
                .catch(function(err) {
                    alert('Lỗi xuất PDF: ' + err.statusText);
                });
        };

        // Helper to trigger download
        function downloadFile(data, filename) {
            var blob = new Blob([data], { type: 'application/octet-stream' });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
        
        $scope.formatMoney = function(amount) {
            if (!amount) return '0';
            return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        };
    }
})();
