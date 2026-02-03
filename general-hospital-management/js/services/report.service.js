(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .factory('ReportService', ReportService);

    ReportService.$inject = ['$http'];

    function ReportService($http) {
        var API_BASE = 'http://localhost:5076/gateway/api/report';
        
        var service = {
            getBedCapacityReport: getBedCapacityReport,
            getTreatmentCostReport: getTreatmentCostReport,
            exportBedExcel: exportBedExcel,
            exportBedPdf: exportBedPdf,
            exportCostExcel: exportCostExcel,
            exportCostPdf: exportCostPdf
        };

        return service;

        function getBedCapacityReport(filter) {
            return $http.post(API_BASE + '/bed-capacity', filter)
                .then(function(response) { return response.data; });
        }

        function getTreatmentCostReport(filter) {
            return $http.post(API_BASE + '/treatment-cost', filter)
                .then(function(response) { return response.data; });
        }

        // Export functions to return Blob for file download
        function exportBedExcel(filter) {
            return _exportFile('/bed-capacity/export-excel', filter);
        }

        function exportBedPdf(filter) {
            return _exportFile('/bed-capacity/export-pdf', filter);
        }

        function exportCostExcel(filter) {
            return _exportFile('/treatment-cost/export-excel', filter);
        }

        function exportCostPdf(filter) {
            return _exportFile('/treatment-cost/export-pdf', filter);
        }

        function _exportFile(endpoint, filter) {
            return $http.post(API_BASE + endpoint, filter, {
                responseType: 'arraybuffer' // Important for binary file download
            }).then(function(response) { return response.data; });
        }
    }
})();
