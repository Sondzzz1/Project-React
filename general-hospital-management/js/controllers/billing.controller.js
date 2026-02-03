/* ============================
   BILLING CONTROLLER - billing.controller.js
   Controller for Billing/Invoice section
=============================== */

(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .controller('BillingController', BillingController);

    BillingController.$inject = ['$scope', 'BillingService'];

    function BillingController($scope, BillingService) {
        // Data
        $scope.invoices = [];
        $scope.loading = { invoices: false };
        $scope.errors = { invoices: null };
        
        // Stats
        $scope.stats = {
            tongThu: 0,
            daThu: 0,
            bhytThanhToan: 0,
            congNo: 0
        };
        
        // Pagination
        $scope.currentPage = 1;
        $scope.pageSize = 10;
        $scope.totalRecords = 0;
        $scope.totalPages = 0;

        // Initialize
        $scope.$on('$viewContentLoaded', function() {
            $scope.loadInvoices();
        });
        
        // Load on controller init
        $scope.loadInvoices = function() {
            $scope.loading.invoices = true;
            $scope.errors.invoices = null;
            
            BillingService.getAll()
                .then(function(data) {
                    $scope.invoices = data || [];
                    $scope.totalRecords = $scope.invoices.length;
                    $scope.totalPages = Math.ceil($scope.totalRecords / $scope.pageSize);
                    
                    // Calculate stats
                    calculateStats();
                })
                .catch(function(err) {
                    console.error('Load invoices error:', err);
                    $scope.errors.invoices = 'Không thể tải danh sách hóa đơn';
                })
                .finally(function() {
                    $scope.loading.invoices = false;
                });
        };
        
        // Calculate stats from invoices
        function calculateStats() {
            var tongThu = 0;
            var daThu = 0;
            var bhyt = 0;
            var congNo = 0;
            
            $scope.invoices.forEach(function(inv) {
                var total = inv.tongTien || 0;
                var bhytChiTra = inv.baoHiemChiTra || 0;
                var bnThanhToan = inv.benhNhanThanhToan || 0;
                
                tongThu += total;
                bhyt += bhytChiTra;
                
                if (inv.trangThai === 'DaThanhToan' || inv.trangThai === 'Đã thanh toán') {
                    daThu += total;
                } else {
                    congNo += (total - bhytChiTra - bnThanhToan);
                }
            });
            
            $scope.stats.tongThu = tongThu;
            $scope.stats.daThu = daThu;
            $scope.stats.bhytThanhToan = bhyt;
            $scope.stats.congNo = congNo;
        }
        
        // Format money
        $scope.formatMoney = function(value) {
            if (!value) return '0';
            return new Intl.NumberFormat('vi-VN').format(value);
        };
        
        // Format money short (e.g., 1.5 Tr)
        $scope.formatMoneyShort = function(value) {
            if (!value) return '0';
            if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + ' Tr';
            }
            return new Intl.NumberFormat('vi-VN').format(value);
        };
        
        // Get status badge
        $scope.getStatusBadge = function(status) {
            if (status === 'DaThanhToan' || status === 'Đã thanh toán') {
                return { class: 'badge-success', text: 'Đã thanh toán' };
            } else if (status === 'ChuaThanhToan' || status === 'Chưa thanh toán') {
                return { class: 'badge-warning', text: 'Chưa thanh toán' };
            } else if (status === 'CongNo') {
                return { class: 'badge-danger', text: 'Công nợ' };
            }
            return { class: 'badge-primary', text: status || 'N/A' };
        };
        
        // Export PDF
        $scope.exportPdf = function(invoice) {
            BillingService.exportPdf(invoice.id)
                .then(function() {
                    console.log('PDF exported successfully');
                })
                .catch(function(err) {
                    alert('Lỗi xuất PDF: ' + (err.data?.message || 'Unknown error'));
                });
        };
        
        // Delete invoice
        $scope.deleteInvoice = function(invoice) {
            if (!confirm('Bạn có chắc chắn muốn xóa hóa đơn này?')) return;
            
            BillingService.delete(invoice.id)
                .then(function() {
                    alert('Xóa hóa đơn thành công');
                    $scope.loadInvoices();
                })
                .catch(function(err) {
                    alert('Lỗi xóa hóa đơn: ' + (err.data?.message || 'Unknown error'));
                });
        };
        
        // Pagination
        $scope.changePage = function(page) {
            if (page < 1 || page > $scope.totalPages) return;
            $scope.currentPage = page;
        };
        
        // Get paginated invoices
        $scope.getPagedInvoices = function() {
            var start = ($scope.currentPage - 1) * $scope.pageSize;
            var end = start + $scope.pageSize;
            return $scope.invoices.slice(start, end);
        };
        
        // Auto-load
        $scope.loadInvoices();
    }
})();
