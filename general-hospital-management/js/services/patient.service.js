/* ============================
   PATIENT SERVICE - patient.service.js
   API calls for Patient management
=============================== */

angular.module('hospitalApp')
.factory('PatientService', ['$http', function($http) {
    var service = {};
    // Hardcode base URL (same as in api.service.js)
    var API_URL = 'http://localhost:5076/gateway/api/benhnhan';
    
    /**
     * Lấy tất cả bệnh nhân
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
     * Lấy bệnh nhân theo ID
     * @param {number} id - Mã bệnh nhân
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
     * Tìm kiếm bệnh nhân
     * @param {Object} params - Tham số tìm kiếm (keyword, pageIndex, pageSize, hoTen, soTheBaoHiem...)
     * @returns {Promise}
     */
    service.search = function(params) {
        return $http({
            method: 'POST',
            url: API_URL + '/search',
            data: {
                HoTen: params.hoTen || params.keyword || null,
                DiaChi: params.diaChi || params.keyword || null,
                SoTheBaoHiem: params.soTheBaoHiem || params.keyword || null,
                pageIndex: params.pageIndex || 1,
                pageSize: params.pageSize || 10
            }
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Tạo bệnh nhân mới
     * @param {Object} patient - Thông tin bệnh nhân
     * @returns {Promise}
     */
    service.create = function(patient) {
        // Format data theo sp_BenhNhan_Create
        // NgaySinh cần là DateOnly (YYYY-MM-DD)
        var ngaySinhStr = '';
        if (patient.ngaySinh) {
            var date = new Date(patient.ngaySinh);
            ngaySinhStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        
        var hanBHYTStr = null;
        if (patient.hanTheBHYT) {
            hanBHYTStr = new Date(patient.hanTheBHYT).toISOString();
        }
        
        var requestData = {
            hoTen: patient.hoTen || '',
            ngaySinh: ngaySinhStr,
            gioiTinh: patient.gioiTinh || '',
            diaChi: patient.diaChi || '',
            soTheBaoHiem: patient.soTheBaoHiem || '',
            mucHuong: patient.mucHuong, // Send as-is (Controller handles decimal/int logic)
            hanTheBHYT: hanBHYTStr,
            trangThai: patient.trangThai || 'Đang điều trị'
        };
        
        console.log('Creating patient with data:', requestData);
        
        return $http({
            method: 'POST',
            url: API_URL + '/create',
            data: requestData
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Cập nhật bệnh nhân
     * @param {number} id - Mã bệnh nhân
     * @param {Object} patient - Thông tin cập nhật
     * @returns {Promise}
     */
    service.update = function(id, patient) {
        // Format NgaySinh
        var ngaySinhStr = '';
        if (patient.ngaySinh) {
            var date = new Date(patient.ngaySinh);
            ngaySinhStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
        }
        
        var hanBHYTStr = null;
        if (patient.hanTheBHYT) {
            hanBHYTStr = new Date(patient.hanTheBHYT).toISOString();
        }
        
        var requestData = {
            id: id,
            hoTen: patient.hoTen || '',
            ngaySinh: ngaySinhStr,
            gioiTinh: patient.gioiTinh || '',
            diaChi: patient.diaChi || '',
            soTheBaoHiem: patient.soTheBaoHiem || '',
            mucHuong: patient.mucHuong, // Send as-is
            hanTheBHYT: hanBHYTStr,
            trangThai: patient.trangThai || 'Đang điều trị'
        };
        
        console.log('Updating patient with data:', requestData);
        
        return $http({
            method: 'PUT',
            url: API_URL + '/update',
            data: requestData
        }).then(function(response) {
            return response.data;
        });
    };
    
    /**
     * Xóa bệnh nhân
     * @param {number} id - Mã bệnh nhân
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
