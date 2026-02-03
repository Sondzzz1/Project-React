/* ============================
   BILLING SERVICE - billing.service.js
   Frontend service for Invoice/Billing (HoaDon)
=============================== */

(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .service('BillingService', BillingService);

    BillingService.$inject = ['$http'];

    function BillingService($http) {
        var API_URL = 'http://localhost:5076/gateway/api/hoadon';

        var service = {
            getPreview: getPreview,
            create: create,
            getAll: getAll,
            getList: getList,
            getById: getById,
            pay: pay,
            delete: deleteInvoice,
            exportPdf: exportPdf
        };

        return service;

        /**
         * Xem trước gợi ý hóa đơn cho bệnh nhân đang nằm viện
         * GET /api/hoadon/xem-truoc/{nhapVienId}
         */
        function getPreview(nhapVienId) {
            return $http.get(API_URL + '/xem-truoc/' + nhapVienId)
                .then(handleSuccess)
                .catch(handleError);
        }

        /**
         * Tạo hóa đơn mới
         * POST /api/hoadon/tao-moi
         */
        function create(data) {
            return $http.post(API_URL + '/tao-moi', data)
                .then(handleSuccess)
                .catch(handleError);
        }

        /**
         * Lấy tất cả hóa đơn
         * GET /api/hoadon/lay-tat-ca
         */
        function getAll() {
            return $http.get(API_URL + '/lay-tat-ca')
                .then(handleSuccess)
                .catch(handleError);
        }

        /**
         * Lấy danh sách hóa đơn theo bệnh nhân hoặc nhập viện
         * GET /api/hoadon/danh-sach?benhNhanId=...&nhapVienId=...
         */
        function getList(benhNhanId, nhapVienId) {
            var params = {};
            if (benhNhanId) params.benhNhanId = benhNhanId;
            if (nhapVienId) params.nhapVienId = nhapVienId;
            
            return $http.get(API_URL + '/danh-sach', { params: params })
                .then(handleSuccess)
                .catch(handleError);
        }

        /**
         * Lấy chi tiết hóa đơn
         * GET /api/hoadon/chi-tiet/{id}
         */
        function getById(id) {
            return $http.get(API_URL + '/chi-tiet/' + id)
                .then(handleSuccess)
                .catch(handleError);
        }

        /**
         * Thanh toán hóa đơn
         * PUT /api/hoadon/thanh-toan
         */
        function pay(data) {
            return $http.put(API_URL + '/thanh-toan', data)
                .then(handleSuccess)
                .catch(handleError);
        }

        /**
         * Xóa hóa đơn
         * DELETE /api/hoadon/xoa/{id}
         */
        function deleteInvoice(id) {
            return $http.delete(API_URL + '/xoa/' + id)
                .then(handleSuccess)
                .catch(handleError);
        }

        /**
         * Xuất PDF hóa đơn
         * GET /api/hoadon/export-pdf/{id}
         */
        function exportPdf(id) {
            return $http({
                method: 'GET',
                url: API_URL + '/export-pdf/' + id,
                responseType: 'blob'
            }).then(function(response) {
                // Create blob URL and trigger download
                var blob = new Blob([response.data], { type: 'application/pdf' });
                var url = window.URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = 'HoaDon_' + id + '.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                return true;
            }).catch(handleError);
        }

        // --- Private Helper Functions ---

        function handleSuccess(response) {
            return response.data;
        }

        function handleError(error) {
            console.error('BillingService Error:', error);
            return Promise.reject(error);
        }
    }
})();
