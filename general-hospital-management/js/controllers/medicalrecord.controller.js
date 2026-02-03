/* ============================
   MEDICAL RECORD CONTROLLER - medicalrecord.controller.js
   Controller for EHR (Electronic Health Records) section
   =============================== */

(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .controller('MedicalRecordController', MedicalRecordController);

    MedicalRecordController.$inject = ['$scope', 'MedicalRecordService', 'DoctorService', 'AdmissionService'];

    function MedicalRecordController($scope, MedicalRecordService, DoctorService, AdmissionService) {
        // --- Variables ---
        $scope.recordList = [];
        $scope.doctors = [];
        $scope.loading = { records: false };
        $scope.errors = { records: null };
        $scope.searchRecordText = '';
        
        // --- Init ---
        loadMedicalRecords();
        loadDoctors();

        // --- Functions ---
        $scope.refreshRecords = loadMedicalRecords;

        function loadMedicalRecords() {
            $scope.loading.records = true;
            $scope.errors.records = null;

            MedicalRecordService.getAll()
                .then(function(data) {
                    // API returns array directly or wrapped
                    $scope.recordList = Array.isArray(data) ? data : (data.data || []);
                    $scope.loading.records = false;
                    console.log('Loaded medical records:', $scope.recordList.length);
                })
                .catch(function(err) {
                    $scope.errors.records = 'Không thể tải hồ sơ bệnh án.';
                    $scope.loading.records = false;
                    console.error('Error loading records:', err);
                });
        }
        
        function loadDoctors() {
            DoctorService.getAll().then(function(data) {
                $scope.doctors = Array.isArray(data) ? data : (data.data || []);
            });
        }
        
        // Get doctor name by ID
        $scope.getDoctorNameById = function(docId) {
            if (!docId || !$scope.doctors.length) return 'N/A';
            var doc = $scope.doctors.find(function(d) { return d.id === docId; });
            return doc ? doc.hoTen : 'N/A';
        };
        
        // Get status badge class and text based on NhapVien.TrangThai
        $scope.getRecordStatusBadge = function(record) {
            // Use TrangThaiNhapVien from the joined data
            var trangThai = (record.trangThaiNhapVien || '').toLowerCase();
            
            if (trangThai.indexOf('xuatvien') >= 0 || trangThai === 'xuất viện') {
                return { class: 'badge-success', text: 'Đã xuất viện' };
            } else if (trangThai.indexOf('theodoi') >= 0 || trangThai === 'theo dõi') {
                return { class: 'badge-warning', text: 'Theo dõi' };
            } else {
                // Default: still in treatment
                return { class: 'badge-danger', text: 'Đang điều trị' };
            }
        };
        
        // Calculate treatment days
        $scope.getTreatmentDays = function(record) {
            if (!record.ngayLap) return '-';
            var start = new Date(record.ngayLap);
            var end = new Date(); // Assuming still in treatment if no discharge
            var days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
            return days + ' ngày';
        };
        
        // --- Actions ---
        $scope.openRecordModal = function(mode, record) {
            if (window.MedicalRecordModal) {
                MedicalRecordModal.open(mode, record, $scope.doctors, function success() {
                    loadMedicalRecords();
                });
            } else {
                console.error('MedicalRecordModal not found!');
                alert('Modal chưa được khởi tạo');
            }
        };
        
        $scope.viewRecordDetail = function(record) {
            // Open detail view modal
            if (window.MedicalRecordModal) {
                MedicalRecordModal.openDetail(record);
            } else {
                alert('Chi tiết: ' + (record.chanDoanBanDau || 'N/A'));
            }
        };
        
        $scope.deleteRecord = function(record) {
            if (!confirm('Bạn có chắc muốn xóa hồ sơ bệnh án này không?')) return;
            
            MedicalRecordService.delete(record.id)
                .then(function() {
                    alert('Xóa thành công!');
                    loadMedicalRecords();
                })
                .catch(function(err) {
                    alert('Lỗi khi xóa: ' + (err.data?.message || err.message));
                });
        };
        
        // Filter function for search
        $scope.recordFilter = function(record) {
            if (!$scope.searchRecordText) return true;
            var term = $scope.searchRecordText.toLowerCase();
            return (record.tenBenhNhan && record.tenBenhNhan.toLowerCase().indexOf(term) >= 0) ||
                   (record.chanDoanBanDau && record.chanDoanBanDau.toLowerCase().indexOf(term) >= 0);
        };
    }
})();
