/* ============================
   BED SERVICE - bed.service.js
   Service cho quản lý Giường bệnh
   API: /gateway/api/giuongbenh
=============================== */

angular.module('hospitalApp')
.factory('BedService', ['$http', function($http) {
    var service = {};
    var API_URL = 'http://localhost:5076/gateway/api/giuongbenh';
    
    /**
     * Lấy tất cả giường bệnh
     * @returns {Promise}
     */
    service.getAll = function() {
        return $http({
            method: 'GET',
            url: API_URL + '/get-all'
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Lấy giường theo ID
     * @param {string} id - ID giường
     * @returns {Promise}
     */
    service.getById = function(id) {
        return $http({
            method: 'GET',
            url: API_URL + '/get-by-id/' + id
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Thêm giường mới
     * @param {Object} bed - Thông tin giường
     * @returns {Promise}
     */
    service.create = function(bed) {
        var requestData = {
            khoaId: bed.khoaId,
            tenGiuong: bed.tenGiuong || '',
            loaiGiuong: bed.loaiGiuong || 'Thường',
            giaTien: parseFloat(bed.giaTien) || 0
        };
        
        console.log('Creating bed with data:', requestData);
        
        return $http({
            method: 'POST',
            url: API_URL + '/create',
            data: requestData
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Cập nhật giường
     * @param {Object} bed - Thông tin giường cần cập nhật
     * @returns {Promise}
     */
    service.update = function(bed) {
        // TrangThai phải là string theo backend DTO
        var trangThaiString = 'Trống';
        if (bed.trangThai === 1 || bed.trangThai === '1' || bed.trangThai === 'Đang sử dụng') {
            trangThaiString = 'Đang sử dụng';
        }
        
        var requestData = {
            id: bed.id,
            khoaId: bed.khoaId,
            tenGiuong: bed.tenGiuong || '',
            loaiGiuong: bed.loaiGiuong || 'Thường',
            giaTien: parseFloat(bed.giaTien) || 0,
            trangThai: trangThaiString
        };
        
        console.log('Updating bed with data:', requestData);
        
        return $http({
            method: 'PUT',
            url: API_URL + '/update-giuong',
            data: requestData
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Xóa giường
     * @param {string} id - ID giường cần xóa
     * @returns {Promise}
     */
    service.delete = function(id) {
        return $http({
            method: 'DELETE',
            url: API_URL + '/delete-giuong/' + id
        }).then(function(response) {
            return response.data;
        });
    };
    
    return service;
}]);
