(function() {
    'use strict';

    angular
        .module('hospitalApp')
        .controller('SurgeryController', SurgeryController);

    SurgeryController.$inject = ['$scope', 'SurgeryService', 'DoctorService', 'AdmissionService'];

    function SurgeryController($scope, SurgeryService, DoctorService, AdmissionService) {
        // --- Variables ---
        $scope.surgeryList = [];
        $scope.doctors = [];
        $scope.loading = { surgery: false };
        $scope.errors = { surgery: null };
        
        $scope.surgeryFilter = {
            date: 'all', // all, today, week - default to 'all' to show everything
            roomId: ''
        };

        // --- Init ---
        // Auto-load data when controller initializes
        loadSurgeries();
        loadDoctors();

        // Also listen for manual refresh event
        $scope.$on('init-surgery', function() {
            console.log('SurgeryController re-initialized via event');
            loadSurgeries();
            loadDoctors();
        });

        // --- Functions ---
        $scope.refreshSurgery = loadSurgeries;

        // Store all surgeries for filtering
        var allSurgeries = [];

        function loadSurgeries() {
            $scope.loading.surgery = true;
            $scope.errors.surgery = null;

            SurgeryService.getAll()
                .then(function(data) {
                    allSurgeries = data || [];
                    applyFilters();
                    $scope.loading.surgery = false;
                    updateDashboardStats();
                })
                .catch(function(err) {
                    $scope.errors.surgery = 'Không thể tải lịch phẫu thuật.';
                    $scope.loading.surgery = false;
                });
        }
        
        // Apply filters based on surgeryFilter
        function applyFilters() {
            var filtered = allSurgeries;
            var now = new Date();
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            // Date filter
            if ($scope.surgeryFilter.date === 'today') {
                filtered = filtered.filter(function(s) {
                    if (!s.ngay) return false;
                    var sDate = new Date(s.ngay);
                    return sDate.toDateString() === today.toDateString();
                });
            } else if ($scope.surgeryFilter.date === 'week') {
                var weekStart = new Date(today);
                weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
                var weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);
                
                filtered = filtered.filter(function(s) {
                    if (!s.ngay) return false;
                    var sDate = new Date(s.ngay);
                    return sDate >= weekStart && sDate < weekEnd;
                });
            }
            // 'all' = no date filter
            
            // Room filter
            if ($scope.surgeryFilter.roomId) {
                filtered = filtered.filter(function(s) {
                    return s.phongMo === $scope.surgeryFilter.roomId;
                });
            }
            
            $scope.surgeryList = filtered;
        }
        
        // Watch for filter changes
        $scope.$watch('surgeryFilter.date', function(newVal, oldVal) {
            if (newVal !== oldVal && allSurgeries.length > 0) {
                applyFilters();
            }
        });
        
        $scope.$watch('surgeryFilter.roomId', function(newVal, oldVal) {
            if (newVal !== oldVal && allSurgeries.length > 0) {
                applyFilters();
            }
        });
        
        function loadDoctors() {
            DoctorService.getAll().then(function(data) {
                $scope.doctors = data || [];
            });
        }
        
        // --- Dashboard Stats ---
        $scope.stats = {
            today: 0,
            completed: 0,
            running: 0,
            pending: 0
        };

        function updateDashboardStats() {
            var list = allSurgeries; // Use all surgeries for stats, not filtered
            var today = new Date().toDateString();
            
            $scope.stats.today = list.filter(function(s) {
                return s.ngay && new Date(s.ngay).toDateString() === today;
            }).length;
            
            $scope.stats.completed = list.filter(function(s) {
                var status = String(s.trangThai || '').toLowerCase();
                return status.indexOf('hoan') >= 0;
            }).length;
            $scope.stats.running = list.filter(function(s) {
                var status = String(s.trangThai || '').toLowerCase();
                return status.indexOf('dang') >= 0;
            }).length;
            $scope.stats.pending = list.filter(function(s) {
                var status = String(s.trangThai || '').toLowerCase();
                return status.indexOf('cho') >= 0;
            }).length;
        }

        // --- Actions ---
        $scope.openSurgeryModal = function(mode, surgery) {
            if (window.SurgeryModal) {
                // Determine Mode (Create vs Edit)
                // Need to pass dependency data (Doctors)
                SurgeryModal.open(mode, surgery, $scope.doctors, function success() {
                     loadSurgeries();
                });
            } else {
                console.error('SurgeryModal not found!');
            }
        };

        $scope.deleteSurgery = function(surgery) {
            if (!confirm('Bạn có chắc muốn xóa lịch phẫu thuật này không?')) return;
            
            SurgeryService.delete(surgery.id)
                .then(function() {
                    alert('Xóa thành công!');
                    loadSurgeries();
                })
                .catch(function(err) {
                    alert('Lỗi khi xóa: ' + (err.data?.message || err.message));
                });
        };
        
        $scope.getDoctorName = function(docId) {
            if (!$scope.doctors || $scope.doctors.length === 0) return docId;
            var doc = $scope.doctors.find(d => d.id === docId);
            return doc ? doc.hoTen : 'Unknown';
        };

        // --- Helper for Status Badge ---
        $scope.getSurgeryStatusBadge = function(status) {
            // Mapping Status String to Badge Class & Text
            // Backend returns string: 'ChoThucHien', 'DangThucHien', 'HoanThanh'
            if (!status) return { class: 'badge-gray', text: 'Chưa xác định' };
            
            var statusStr = String(status).toLowerCase();
            
            if (statusStr.indexOf('hoan') >= 0 || statusStr === '2') {
                return { class: 'badge-success', text: 'Đã hoàn thành' };
            } else if (statusStr.indexOf('dang') >= 0 || statusStr === '1') {
                return { class: 'badge-warning', text: 'Đang thực hiện' };
            } else if (statusStr.indexOf('cho') >= 0 || statusStr === '0') {
                return { class: 'badge-danger', text: 'Chờ thực hiện' };
            }
            
            return { class: 'badge-gray', text: status };
        };
    }
})();
