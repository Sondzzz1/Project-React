/* ============================
   MEDICAL RECORD SERVICE - medicalrecord.service.js
   Frontend service for EHR (Electronic Health Records)
   =============================== */

angular.module('hospitalApp')
.factory('MedicalRecordService', ['$http', function($http) {
    var service = {};
    var API_URL = 'http://localhost:5076/gateway/api/medicalrecord';
    
    /**
     * Lấy tất cả hồ sơ bệnh án
     * GET /api/medicalrecord/get-all-medical
     */
    service.getAll = function() {
        return $http.get(API_URL + '/get-all-medical')
            .then(function(response) {
                return response.data;
            });
    };
    
    /**
     * Tìm kiếm hồ sơ bệnh án
     * POST /api/medicalrecord/search
     */
    service.search = function(searchTerm, pageNumber, pageSize) {
        return $http.post(API_URL + '/search', {
            searchTerm: searchTerm || '',
            pageNumber: pageNumber || 1,
            pageSize: pageSize || 20
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Tạo hồ sơ bệnh án mới
     * POST /api/medicalrecord
     */
    service.create = function(dto) {
        return $http.post(API_URL, dto)
            .then(function(response) {
                return response.data;
            });
    };
    
    /**
     * Cập nhật hồ sơ bệnh án
     * PUT /api/medicalrecord/{id}
     */
    service.update = function(id, dto) {
        return $http.put(API_URL + '/' + id, dto)
            .then(function(response) {
                return response.data;
            });
    };
    
    /**
     * Xóa hồ sơ bệnh án
     * DELETE /api/medicalrecord/{id}
     */
    service.delete = function(id) {
        return $http.delete(API_URL + '/' + id)
            .then(function(response) {
                return response.data;
            });
    };
    
    return service;
}]);
