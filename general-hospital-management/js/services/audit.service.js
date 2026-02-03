(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .factory('AuditService', AuditService);

    AuditService.$inject = ['$http'];

    function AuditService($http) {
        var API_BASE = 'http://localhost:5076/gateway/api/audit';

        var service = {
            getSystemLogs: getSystemLogs,
            getMedicalRecordLogs: getMedicalRecordLogs
        };

        return service;

        function getSystemLogs(search) {
            // search: { tuNgay, denNgay, nguoiDungId, hanhDong, pageNumber, pageSize }
            return $http.post(API_BASE + '/system-logs', search)
                .then(function(response) { return response.data; });
        }

        function getMedicalRecordLogs(search) {
            // search: { tuNgay, denNgay, hoSoBenhAnId, hanhDong, pageNumber, pageSize }
            return $http.post(API_BASE + '/medical-record-logs', search)
                .then(function(response) { return response.data; });
        }
    }
})();
