/* ============================
   ADMISSION SERVICE - admission.service.js
   Service cho quản lý Nhập viện (NhapVien)
   API: /gateway/api/nhapvien
=============================== */

angular.module('hospitalApp')
.factory('AdmissionService', ['$http', function($http) {
    var service = {};
    var API_URL = 'http://localhost:5076/gateway/api/nhapvien';
    
    /**
     * Lấy danh sách nội trú (bệnh nhân đang nằm viện)
     * @returns {Promise}
     */
    service.getInpatientList = function() {
        return $http({
            method: 'GET',
            url: API_URL + '/danh-sach'
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Lấy chi tiết nhập viện
     * @param {string} id - ID nhập viện
     * @returns {Promise}
     */
    service.getById = function(id) {
        return $http({
            method: 'GET',
            url: API_URL + '/chi-tiet/' + id
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Nhập viện mới
     * @param {Object} admission - Thông tin nhập viện
     * @returns {Promise}
     */
    service.create = function(admission) {
        return $http({
            method: 'POST',
            url: API_URL + '/nhap-vien-moi',
            data: admission
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Cập nhật nhập viện
     * @param {Object} admission - Thông tin cập nhật
     * @returns {Promise}
     */
    service.update = function(admission) {
        return $http({
            method: 'PUT',
            url: API_URL + '/cap-nhat',
            data: admission
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Xóa nhập viện
     * @param {string} id - ID nhập viện
     * @returns {Promise}
     */
    service.delete = function(id) {
        return $http({
            method: 'DELETE',
            url: API_URL + '/xoa/' + id
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Chuyển giường
     * @param {Object} data - {nhapVienId, giuongMoiId}
     * @returns {Promise}
     */
    service.transferBed = function(data) {
        return $http({
            method: 'PUT',
            url: API_URL + '/chuyen-giuong',
            data: data
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Tìm kiếm nhập viện
     * @param {Object} searchParams - Tham số tìm kiếm
     * @returns {Promise}
     */
    service.search = function(searchParams) {
        return $http({
            method: 'POST',
            url: API_URL + '/tim-kiem',
            data: searchParams
        }).then(function(response) {
            return response.data;
        });
    };
    
    var XUATVIEN_API_URL = 'http://localhost:5076/gateway/api/xuatvien';

    /**
     * Xuất viện
     * @param {Object} data - { id, ngayXuat, chanDoanXuatVien, ... }
     * @returns {Promise}
     */
    service.discharge = function(data) {
        return $http({
            method: 'PUT',
            url: XUATVIEN_API_URL + '/xac-nhan',
            data: data
        }).then(function(response) {
            return response.data;
        });
    };
    
    return service;
}]);
