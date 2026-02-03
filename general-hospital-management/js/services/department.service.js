/* ============================
   DEPARTMENT SERVICE - department.service.js
   Service cho quản lý Khoa phòng
   API: /gateway/api/khoaphong
=============================== */

angular.module('hospitalApp')
.factory('DepartmentService', ['$http', function($http) {
    var service = {};
    var API_URL = 'http://localhost:5076/gateway/api/khoaphong';
    
    /**
     * Lấy tất cả khoa phòng
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
     * Lấy khoa phòng theo ID
     * @param {string} id - ID khoa
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
     * Tìm kiếm khoa phòng
     * @param {string} keyword - Từ khóa tìm kiếm
     * @returns {Promise}
     */
    service.search = function(keyword) {
        return $http({
            method: 'GET',
            url: API_URL + '/search',
            params: { keyword: keyword || '' }
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Thêm khoa phòng mới
     * @param {Object} department - Thông tin khoa
     * @returns {Promise}
     */
    service.create = function(department) {
        var requestData = {
            tenKhoa: department.tenKhoa || '',
            loaiKhoa: department.loaiKhoa || '',
            soGiuongTieuChuan: parseInt(department.soGiuongTieuChuan) || 10
        };
        
        console.log('Creating department with data:', requestData);
        
        return $http({
            method: 'POST',
            url: API_URL + '/create',
            data: requestData
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Cập nhật khoa phòng
     * @param {Object} department - Thông tin khoa cần cập nhật
     * @returns {Promise}
     */
    service.update = function(department) {
        var requestData = {
            id: department.id,
            tenKhoa: department.tenKhoa || '',
            loaiKhoa: department.loaiKhoa || '',
            soGiuongTieuChuan: parseInt(department.soGiuongTieuChuan) || 10
        };
        
        console.log('Updating department with data:', requestData);
        
        return $http({
            method: 'PUT',
            url: API_URL + '/update',
            data: requestData
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Xóa khoa phòng
     * @param {string} id - ID khoa cần xóa
     * @returns {Promise}
     */
    service.delete = function(id) {
        return $http({
            method: 'DELETE',
            url: API_URL + '/delete/' + id
        }).then(function(response) {
            return response.data;
        });
    };
    
    return service;
}]);
