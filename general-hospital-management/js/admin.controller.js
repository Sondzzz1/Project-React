/**
 * =============================================
 * ADMIN DASHBOARD CONTROLLER
 * AngularJS Controller for Hospital Admin
 * =============================================
 */

(function() {
    'use strict';

    angular.module('hospitalApp')
    
    // ============================================
    // MAIN ADMIN CONTROLLER
    // ============================================
    .controller('AdminController', [
        '$scope',
        '$window',
        'AuthService',
        'PatientService',
        'BedService',
        'DepartmentService',
        'AdmissionService',
        'SurgeryService',
        'MedicalRecordService',
        'DoctorService',
        'ReportService',
        'AuditService',
        'UtilityService',
        function(
            $scope,
            $window,
            AuthService,
            PatientService,
            BedService,
            DepartmentService,
            AdmissionService,
            SurgeryService,
            MedicalRecordService,
            DoctorService,
            ReportService,
            AuditService,
            UtilityService
        ) {
            
            // ============================================
            // SCOPE VARIABLES
            // ============================================
            
            // Current user
            $scope.currentUser = null;
            $scope.currentSection = 'home';
            
            // Loading states
            $scope.loading = {
                patients: false,
                beds: false,
                surgeries: false,
                records: false,
                doctors: false,
                reports: false
            };
            
            // Error messages
            $scope.errors = {};
            
            // Data collections
            $scope.patients = [];
            $scope.beds = [];
            $scope.surgeries = [];
            $scope.medicalRecords = [];
            $scope.doctors = [];
            
            // Dashboard stats
            $scope.dashboardStats = {
                totalPatients: 0,
                todayAppointments: 0,
                doctorsOnDuty: 0,
                dailyRevenue: 0
            };
            
            // Pagination
            $scope.pagination = {
                patients: { page: 1, pageSize: 10, total: 0 },
                beds: { page: 1, pageSize: 10, total: 0 },
                surgeries: { page: 1, pageSize: 10, total: 0 }
            };
            
            // Search/Filter
            $scope.searchText = '';
            $scope.filters = {};
            
            // Form data for modals
            $scope.formData = {};
            $scope.isEditing = false;
            
            // Patient Modal
            $scope.showPatientModal = false;
            $scope.patientForm = {};
            $scope.patientFormError = null;
            $scope.savingPatient = false;
            
            // Staff Tab (Doctor/Nurse)
            $scope.staffTab = 'doctors';
            
            // Refresh Doctors Tab - clears search and reloads
            $scope.refreshDoctorsTab = function() {
                var doctorEl = document.querySelector('[ng-controller="DoctorController"]');
                if (doctorEl) {
                    var doctorScope = angular.element(doctorEl).scope();
                    if (doctorScope) {
                        doctorScope.doctorSearchKeyword = '';
                        if (doctorScope.loadDoctors) {
                            doctorScope.loadDoctors(1);
                        }
                    }
                }
            };
            
            // Refresh Nurses Tab - clears search and reloads
            $scope.refreshNursesTab = function() {
                var nurseEl = document.querySelector('[ng-controller="NurseController"]');
                if (nurseEl) {
                    var nurseScope = angular.element(nurseEl).scope();
                    if (nurseScope) {
                        nurseScope.nurseSearchKeyword = '';
                        if (nurseScope.loadNurses) {
                            nurseScope.loadNurses(1);
                        }
                    }
                }
            };
            
            // ============================================
            // INITIALIZATION
            // ============================================
            
            function init() {
                console.log('=== ADMIN INIT ===');
                console.log('localStorage jwt_token:', $window.localStorage.getItem('jwt_token'));
                console.log('localStorage current_user:', $window.localStorage.getItem('current_user'));
                console.log('sessionStorage currentUser:', $window.sessionStorage.getItem('currentUser'));
                
                // Get current user
                $scope.currentUser = AuthService.getCurrentUser();
                console.log('AuthService.getCurrentUser():', $scope.currentUser);
                
                if (!$scope.currentUser) {
                    // Try sessionStorage (compatibility)
                    var userStr = $window.sessionStorage.getItem('currentUser');
                    console.log('Trying sessionStorage, got:', userStr);
                    if (userStr) {
                        try {
                            $scope.currentUser = JSON.parse(userStr);
                            console.log('Parsed sessionStorage user:', $scope.currentUser);
                        } catch (e) {
                            console.error('Failed to parse sessionStorage:', e);
                            $window.location.href = 'login.html';
                            return;
                        }
                    } else {
                        console.log('No user found, redirecting to login');
                        $window.location.href = 'login.html';
                        return;
                    }
                }
                
                // Load mock dashboard stats
                loadDashboardStats();
                
                // Expose services to $scope for separate controllers
                $scope.PatientService = PatientService;
                $scope.BedService = BedService;
                $scope.SurgeryService = SurgeryService;
                $scope.DepartmentService = DepartmentService;
                $scope.AdmissionService = AdmissionService;
                $scope.MedicalRecordService = MedicalRecordService;
                
                // Initialize patient controller (from patient.controller.js)
                if (typeof initPatientController === 'function') {
                    initPatientController($scope);
                }
                
                // Initialize bed controller (from bed.controller.js)
                if (typeof initBedController === 'function') {
                    initBedController($scope);
                }
                
                // Initialize department controller (from department.controller.js)
                if (typeof initDepartmentController === 'function') {
                    initDepartmentController($scope);
                }
                
                // Auto-load patients và chuyển section sang patients
                $scope.currentSection = 'patients';
                if ($scope.loadPatients) {
                    $scope.loadPatients();
                }
                
                // Auto-load departments (for bed dropdown)
                if ($scope.loadDepartments) {
                    $scope.loadDepartments();
                }
                
                console.log('Admin initialized for user:', $scope.currentUser);
            }
            
            // ============================================
            // NAVIGATION
            // ============================================
            
            $scope.showSection = function(sectionId) {
                console.log('showSection called:', sectionId);
                $scope.currentSection = sectionId;
                
                // Toggle DOM visibility (CSS uses .hidden class)
                var pages = document.querySelectorAll('.page');
                pages.forEach(function(page) {
                    page.classList.add('hidden');
                });
                
                var selectedPage = document.getElementById(sectionId);
                if (selectedPage) {
                    selectedPage.classList.remove('hidden');
                }
                
                // Load data for section
                switch(sectionId) {
                    case 'patients':
                        $scope.loadPatients();
                        break;
                    case 'beds':
                        $scope.loadBeds();
                        break;
                    case 'departments':
                        if ($scope.loadDepartmentList) {
                            $scope.loadDepartmentList();
                        }
                        break;
                    case 'surgery':
                        $scope.loadSurgeries();
                        break;
                    case 'records':
                        $scope.loadMedicalRecords();
                        break;
                    case 'doctors':
                        $scope.loadDoctors();
                        break;
                    case 'home':
                        loadDashboardStats();
                        break;
                    case 'labtests':
                        // Handled by LabTestController watcher
                        break;
                }
            };
            
            // ============================================
            // DASHBOARD
            // ============================================
            
            function loadDashboardStats() {
                // Chỉ dùng mock data, KHÔNG gọi API
                $scope.dashboardStats = {
                    totalPatients: 126,
                    todayAppointments: 89,
                    doctorsOnDuty: 15,
                    dailyRevenue: '45 Tr'
                };
            }
            
            // ============================================
            // PATIENTS
            // ============================================
            
            $scope.loadPatients = function() {
                console.log('loadPatients() called');
                console.log('Token:', localStorage.getItem('jwt_token'));
                
                $scope.loading.patients = true;
                $scope.errors.patients = null;
                
                // Gọi get-all không cần params (pagination dùng search POST)
                PatientService.getAll()
                    .then(function(response) {
                        $scope.loading.patients = false;
                        
                        if (Array.isArray(response)) {
                            $scope.patients = response;
                            $scope.pagination.patients.total = response.length;
                        } else if (response && response.data) {
                            $scope.patients = response.data;
                            $scope.pagination.patients.total = response.data.length;
                        } else {
                            $scope.patients = [];
                        }
                        
                        console.log('Loaded patients:', $scope.patients.length);
                    })
                    .catch(function(error) {
                        $scope.loading.patients = false;
                        $scope.errors.patients = 'Không thể tải danh sách bệnh nhân. ' + 
                            (error.status === 401 ? 'Phiên đăng nhập hết hạn.' : 'Lỗi kết nối server.');
                        console.error('Error loading patients:', error);
                    });
            };
            
            $scope.viewPatient = function(patient) {
                $scope.patientForm = angular.copy(patient);
                $scope.isEditing = false;
                $scope.showPatientModal = true;
            };
            
            $scope.editPatient = function(patient) {
                $scope.patientForm = angular.copy(patient);
                // Convert date strings to Date objects for date inputs
                if ($scope.patientForm.ngaySinh) {
                    $scope.patientForm.ngaySinh = new Date($scope.patientForm.ngaySinh);
                }
                if ($scope.patientForm.hanTheBHYT) {
                    $scope.patientForm.hanTheBHYT = new Date($scope.patientForm.hanTheBHYT);
                }
                $scope.isEditing = true;
                $scope.showPatientModal = true;
            };
            
            // Search patients
            $scope.searchPatients = function() {
                console.log('Searching patients with:', $scope.searchText);
                $scope.loading.patients = true;
                
                if (!$scope.searchText || $scope.searchText.trim() === '') {
                    // No search text - load all
                    $scope.loadPatients();
                    return;
                }
                
                // Use search API if available, else filter locally
                PatientService.search({ keyword: $scope.searchText })
                    .then(function(response) {
                        $scope.loading.patients = false;
                        if (Array.isArray(response)) {
                            $scope.patients = response;
                        } else if (response && response.data) {
                            $scope.patients = response.data;
                        }
                    })
                    .catch(function(error) {
                        $scope.loading.patients = false;
                        console.error('Search error, filtering locally:', error);
                        // Fallback: filter locally
                        $scope.loadPatients();
                    });
            };
            
            // Open patient modal for adding new patient
            $scope.openPatientModal = function(patient) {
                console.log('openPatientModal called!', patient);
                $scope.patientFormError = null;
                $scope.savingPatient = false;
                
                if (patient) {
                    // Edit mode
                    $scope.patientForm = angular.copy(patient);
                    if ($scope.patientForm.ngaySinh) {
                        $scope.patientForm.ngaySinh = new Date($scope.patientForm.ngaySinh);
                    }
                    $scope.isEditing = true;
                } else {
                    // Add mode
                    $scope.patientForm = {
                        hoTen: '',
                        ngaySinh: null,
                        gioiTinh: '',
                        soDienThoai: '',
                        diaChi: '',
                        soTheBaoHiem: '',
                        mucHuong: 80,
                        hanTheBHYT: null,
                        trangThai: 'Đang điều trị'
                    };
                    $scope.isEditing = false;
                }
                $scope.showPatientModal = true;
                console.log('showPatientModal set to:', $scope.showPatientModal);
            };
            
            // Close patient modal
            $scope.closePatientModal = function() {
                $scope.showPatientModal = false;
                $scope.patientForm = {};
                $scope.patientFormError = null;
            };
            
            // Save patient form (create or update)
            $scope.savePatientForm = function() {
                // Validate
                if (!$scope.patientForm.hoTen || $scope.patientForm.hoTen.trim() === '') {
                    $scope.patientFormError = 'Vui lòng nhập họ tên bệnh nhân';
                    return;
                }
                if (!$scope.patientForm.ngaySinh) {
                    $scope.patientFormError = 'Vui lòng nhập ngày sinh';
                    return;
                }
                if (!$scope.patientForm.gioiTinh) {
                    $scope.patientFormError = 'Vui lòng chọn giới tính';
                    return;
                }
                
                $scope.patientFormError = null;
                $scope.savingPatient = true;
                
                var savePromise;
                if ($scope.isEditing) {
                    savePromise = PatientService.update(
                        $scope.patientForm.maBenhNhan || $scope.patientForm.id,
                        $scope.patientForm
                    );
                } else {
                    savePromise = PatientService.create($scope.patientForm);
                }
                
                savePromise
                    .then(function(response) {
                        $scope.savingPatient = false;
                        $scope.closePatientModal();
                        $scope.loadPatients();
                        alert($scope.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                    })
                    .catch(function(error) {
                        $scope.savingPatient = false;
                        $scope.patientFormError = 'Không thể lưu thông tin bệnh nhân. Vui lòng thử lại.';
                        console.error('Error saving patient:', error);
                    });
            };
            
            $scope.deletePatient = function(patient) {
                if (!confirm('Bạn có chắc muốn xóa bệnh nhân này?')) {
                    return;
                }
                
                PatientService.delete(patient.maBenhNhan || patient.id)
                    .then(function() {
                        // Remove from list
                        var index = $scope.patients.indexOf(patient);
                        if (index > -1) {
                            $scope.patients.splice(index, 1);
                        }
                        UtilityService.showNotification(
                            'Đã xóa bệnh nhân thành công',
                            'success'
                        );
                    })
                    .catch(function(error) {
                        $scope.errors.patients = 'Không thể xóa bệnh nhân';
                        console.error('Error deleting patient:', error);
                    });
            };
            
            $scope.savePatient = function() {
                var savePromise;
                
                if ($scope.isEditing) {
                    savePromise = PatientService.update(
                        $scope.formData.maBenhNhan || $scope.formData.id,
                        $scope.formData
                    );
                } else {
                    savePromise = PatientService.create($scope.formData);
                }
                
                savePromise
                    .then(function(response) {
                        UtilityService.showNotification(
                            $scope.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!',
                            'success'
                        );
                        $scope.loadPatients();
                        $scope.closeModal();
                    })
                    .catch(function(error) {
                        $scope.errors.patients = 'Không thể lưu thông tin bệnh nhân';
                        console.error('Error saving patient:', error);
                    });
            };
            
            // ============================================
            // BEDS
            // ============================================
            
            $scope.loadBeds = function() {
                $scope.loading.beds = true;
                $scope.errors.beds = null;
                
                BedService.getAll()
                    .then(function(response) {
                        $scope.loading.beds = false;
                        
                        if (Array.isArray(response)) {
                            $scope.beds = response;
                        } else if (response && response.data) {
                            $scope.beds = response.data;
                        }
                        console.log('Loaded beds:', $scope.beds.length);
                    })
                    .catch(function(error) {
                        $scope.loading.beds = false;
                        $scope.errors.beds = 'Không thể tải danh sách giường bệnh';
                        console.error('Error loading beds:', error);
                        
                        // Use mock data
                        $scope.beds = getMockBeds();
                    });
            };
            
            $scope.viewBed = function(bed) {
                $scope.formData = angular.copy(bed);
                $scope.isEditing = false;
                $scope.modalType = 'bed-detail';
            };
            
            $scope.editBed = function(bed) {
                $scope.formData = angular.copy(bed);
                $scope.isEditing = true;
                $scope.modalType = 'bed';
            };
            
            $scope.deleteBed = function(bed) {
                if (!confirm('Bạn có chắc muốn xóa giường bệnh này?')) {
                    return;
                }
                
                BedService.delete(bed.maGiuong || bed.id)
                    .then(function() {
                        var index = $scope.beds.indexOf(bed);
                        if (index > -1) {
                            $scope.beds.splice(index, 1);
                        }
                        UtilityService.showNotification('Đã xóa giường bệnh thành công', 'success');
                    })
                    .catch(function(error) {
                        $scope.errors.beds = 'Không thể xóa giường bệnh';
                        console.error('Error deleting bed:', error);
                    });
            };
            
            $scope.saveBed = function() {
                var savePromise;
                
                if ($scope.isEditing) {
                    savePromise = BedService.update($scope.formData.maGiuong || $scope.formData.id, $scope.formData);
                } else {
                    savePromise = BedService.create($scope.formData);
                }
                
                savePromise
                    .then(function() {
                        UtilityService.showNotification(
                            $scope.isEditing ? 'Cập nhật giường bệnh thành công!' : 'Thêm giường bệnh thành công!',
                            'success'
                        );
                        $scope.loadBeds();
                        $scope.closeModal();
                    })
                    .catch(function(error) {
                        $scope.errors.beds = 'Không thể lưu thông tin giường bệnh';
                        console.error('Error saving bed:', error);
                    });
            };
            
            // ============================================
            // SURGERIES
            // ============================================
            
            $scope.loadSurgeries = function() {
                $scope.loading.surgeries = true;
                $scope.errors.surgeries = null;
                
                SurgeryService.getAll()
                    .then(function(response) {
                        $scope.loading.surgeries = false;
                        
                        if (Array.isArray(response)) {
                            $scope.surgeries = response;
                        } else if (response && response.data) {
                            $scope.surgeries = response.data;
                        }
                        console.log('Loaded surgeries:', $scope.surgeries.length);
                    })
                    .catch(function(error) {
                        $scope.loading.surgeries = false;
                        $scope.errors.surgeries = 'Không thể tải danh sách phẫu thuật';
                        console.error('Error loading surgeries:', error);
                        
                        // Use mock data
                        $scope.surgeries = getMockSurgeries();
                    });
            };
            
            $scope.viewSurgery = function(surgery) {
                $scope.formData = angular.copy(surgery);
                $scope.isEditing = false;
                $scope.modalType = 'surgery-detail';
            };
            
            $scope.editSurgery = function(surgery) {
                $scope.formData = angular.copy(surgery);
                $scope.isEditing = true;
                $scope.modalType = 'surgery';
            };
            
            $scope.deleteSurgery = function(surgery) {
                if (!confirm('Bạn có chắc muốn xóa ca phẫu thuật này?')) {
                    return;
                }
                
                SurgeryService.delete(surgery.maPhauThuat || surgery.id)
                    .then(function() {
                        var index = $scope.surgeries.indexOf(surgery);
                        if (index > -1) {
                            $scope.surgeries.splice(index, 1);
                        }
                        UtilityService.showNotification('Đã xóa ca phẫu thuật thành công', 'success');
                    })
                    .catch(function(error) {
                        $scope.errors.surgeries = 'Không thể xóa ca phẫu thuật';
                        console.error('Error deleting surgery:', error);
                    });
            };
            
            $scope.saveSurgery = function() {
                var savePromise;
                
                if ($scope.isEditing) {
                    savePromise = SurgeryService.update($scope.formData.maPhauThuat || $scope.formData.id, $scope.formData);
                } else {
                    savePromise = SurgeryService.create($scope.formData);
                }
                
                savePromise
                    .then(function() {
                        UtilityService.showNotification(
                            $scope.isEditing ? 'Cập nhật phẫu thuật thành công!' : 'Thêm phẫu thuật thành công!',
                            'success'
                        );
                        $scope.loadSurgeries();
                        $scope.closeModal();
                    })
                    .catch(function(error) {
                        $scope.errors.surgeries = 'Không thể lưu thông tin phẫu thuật';
                        console.error('Error saving surgery:', error);
                    });
            };
            
            // ============================================
            // MEDICAL RECORDS
            // ============================================
            
            $scope.loadMedicalRecords = function() {
                $scope.loading.records = true;
                $scope.errors.records = null;
                
                MedicalRecordService.getAll()
                    .then(function(response) {
                        $scope.loading.records = false;
                        
                        if (Array.isArray(response)) {
                            $scope.medicalRecords = response;
                        } else if (response && response.data) {
                            $scope.medicalRecords = response.data;
                        }
                        console.log('Loaded medical records:', $scope.medicalRecords.length);
                    })
                    .catch(function(error) {
                        $scope.loading.records = false;
                        $scope.errors.records = 'Không thể tải hồ sơ bệnh án';
                        console.error('Error loading medical records:', error);
                        
                        // Use mock data
                        $scope.medicalRecords = getMockMedicalRecords();
                    });
            };
            
            $scope.viewMedicalRecord = function(record) {
                $scope.formData = angular.copy(record);
                $scope.isEditing = false;
                $scope.modalType = 'record-detail';
            };
            
            $scope.editMedicalRecord = function(record) {
                $scope.formData = angular.copy(record);
                $scope.isEditing = true;
                $scope.modalType = 'record';
            };
            
            $scope.deleteMedicalRecord = function(record) {
                if (!confirm('Bạn có chắc muốn xóa hồ sơ bệnh án này?')) {
                    return;
                }
                
                MedicalRecordService.delete(record.maHoSo || record.id)
                    .then(function() {
                        var index = $scope.medicalRecords.indexOf(record);
                        if (index > -1) {
                            $scope.medicalRecords.splice(index, 1);
                        }
                        UtilityService.showNotification('Đã xóa hồ sơ bệnh án thành công', 'success');
                    })
                    .catch(function(error) {
                        $scope.errors.records = 'Không thể xóa hồ sơ bệnh án';
                        console.error('Error deleting record:', error);
                    });
            };
            
            $scope.saveMedicalRecord = function() {
                var savePromise;
                
                if ($scope.isEditing) {
                    savePromise = MedicalRecordService.update($scope.formData.maHoSo || $scope.formData.id, $scope.formData);
                } else {
                    savePromise = MedicalRecordService.create($scope.formData);
                }
                
                savePromise
                    .then(function() {
                        UtilityService.showNotification(
                            $scope.isEditing ? 'Cập nhật hồ sơ thành công!' : 'Thêm hồ sơ thành công!',
                            'success'
                        );
                        $scope.loadMedicalRecords();
                        $scope.closeModal();
                    })
                    .catch(function(error) {
                        $scope.errors.records = 'Không thể lưu hồ sơ bệnh án';
                        console.error('Error saving record:', error);
                    });
            };
            
            // ============================================
            // DOCTORS
            // ============================================
            
            $scope.loadDoctors = function() {
                $scope.loading.doctors = true;
                $scope.errors.doctors = null;
                
                DoctorService.getAll()
                    .then(function(response) {
                        $scope.loading.doctors = false;
                        
                        if (Array.isArray(response)) {
                            $scope.doctors = response;
                        } else if (response && response.data) {
                            $scope.doctors = response.data;
                        }
                    })
                    .catch(function(error) {
                        $scope.loading.doctors = false;
                        $scope.errors.doctors = 'Không thể tải danh sách bác sĩ';
                        console.error('Error loading doctors:', error);
                    });
            };
            
            // ============================================
            // REPORTS
            // ============================================
            
            $scope.generateBedCapacityReport = function() {
                $scope.loading.reports = true;
                
                var params = {
                    fromDate: $scope.filters.fromDate,
                    toDate: $scope.filters.toDate
                };
                
                ReportService.getBedCapacityReport(params)
                    .then(function(response) {
                        $scope.loading.reports = false;
                        $scope.bedCapacityReport = response;
                    })
                    .catch(function(error) {
                        $scope.loading.reports = false;
                        console.error('Error generating report:', error);
                    });
            };
            
            $scope.exportReport = function(reportType, format) {
                var params = {
                    fromDate: $scope.filters.fromDate,
                    toDate: $scope.filters.toDate
                };
                
                var exportFn = format === 'excel' 
                    ? ReportService.exportExcel 
                    : ReportService.exportPdf;
                
                exportFn(reportType, params)
                    .then(function(blob) {
                        var filename = reportType + '_' + 
                            new Date().toISOString().split('T')[0] + 
                            (format === 'excel' ? '.xlsx' : '.pdf');
                        UtilityService.downloadBlob(blob, filename);
                    })
                    .catch(function(error) {
                        console.error('Error exporting report:', error);
                    });
            };
            
            // ============================================
            // SEARCH & FILTER
            // ============================================
            
            $scope.search = function() {
                switch($scope.currentSection) {
                    case 'patients':
                        $scope.loadPatients();
                        break;
                    // Add more sections as needed
                }
            };
            
            $scope.clearSearch = function() {
                $scope.searchText = '';
                $scope.search();
            };
            
            // ============================================
            // MODAL HELPERS
            // ============================================
            
            $scope.openModal = function(type, data) {
                $scope.formData = data ? angular.copy(data) : {};
                $scope.isEditing = !!data;
                $scope.modalType = type;
                // In production, show actual modal
            };
            
            $scope.closeModal = function() {
                $scope.formData = {};
                $scope.isEditing = false;
                $scope.modalType = null;
            };
            
            // ============================================
            // LOGOUT
            // ============================================
            
            $scope.logout = function() {
                AuthService.logout();
            };
            
            // ============================================
            // MOCK DATA (Fallback when API unavailable)
            // ============================================
            
            function getMockPatients() {
                // Format theo API backend: BenhNhanViewDTO
                return [
                    {
                        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        hoTen: 'Nguyễn Văn An',
                        ngaySinh: '1990-05-15',
                        gioiTinh: 'Nam',
                        diaChi: '123 Lê Lợi, Q.1, TP.HCM',
                        soTheBaoHiem: 'BH123456789',
                        mucHuong: 80,
                        hanTheBHYT: '2026-12-31',
                        trangThai: 'Nội trú'
                    },
                    {
                        id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
                        hoTen: 'Trần Thị Bưởi',
                        ngaySinh: '1985-08-20',
                        gioiTinh: 'Nữ',
                        diaChi: '456 Nguyễn Huệ, Q.3, TP.HCM',
                        soTheBaoHiem: 'BH987654321',
                        mucHuong: 100,
                        hanTheBHYT: '2026-06-30',
                        trangThai: 'Chờ xét nghiệm'
                    },
                    {
                        id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
                        hoTen: 'Lê Văn Cường',
                        ngaySinh: '2000-01-10',
                        gioiTinh: 'Nam',
                        diaChi: '789 Trần Hưng Đạo, Q.5, TP.HCM',
                        soTheBaoHiem: null,
                        mucHuong: 0,
                        hanTheBHYT: null,
                        trangThai: 'Đã ổn định'
                    }
                ];
            }
            
            function getMockBeds() {
                // Format theo API backend: GiuongBenh
                return [
                    {
                        id: 'g1b2c3d4-e5f6-7890-abcd-ef1234567890',
                        khoaId: 'k1',
                        tenGiuong: 'Giường 01 - Phòng 301',
                        loaiGiuong: 'Giường thường',
                        giaTien: 500000,
                        trangThai: 'Đang sử dụng'
                    },
                    {
                        id: 'g2b2c3d4-e5f6-7890-abcd-ef1234567891',
                        khoaId: 'k1',
                        tenGiuong: 'Giường 02 - Phòng 301',
                        loaiGiuong: 'Giường thường',
                        giaTien: 500000,
                        trangThai: 'Đang sử dụng'
                    },
                    {
                        id: 'g3b2c3d4-e5f6-7890-abcd-ef1234567892',
                        khoaId: 'k1',
                        tenGiuong: 'Giường 03 - Phòng 302',
                        loaiGiuong: 'Giường VIP',
                        giaTien: 1500000,
                        trangThai: 'Trống'
                    }
                ];
            }
            
            function getMockSurgeries() {
                return [
                    {
                        maCaMo: 'CM001',
                        benhNhan: 'Nguyễn Văn An',
                        maBenhNhan: 'BN001',
                        loaiPhauThuat: 'Phẫu thuật nội soi',
                        bacSi: 'BS. Trần Văn Hùng',
                        phongMo: 'Phòng mổ 1',
                        ngayGio: '27/11/2025 08:00',
                        thoiGian: '2 giờ',
                        trangThai: 'Đã hoàn thành'
                    },
                    {
                        maCaMo: 'CM002',
                        benhNhan: 'Trần Thị Bưởi',
                        maBenhNhan: 'BN002',
                        loaiPhauThuat: 'Phẫu thuật mở',
                        bacSi: 'BS. Lê Thị Mai',
                        phongMo: 'Phòng mổ 2',
                        ngayGio: '27/11/2025 10:30',
                        thoiGian: '3 giờ',
                        trangThai: 'Đang thực hiện'
                    }
                ];
            }
            
            function getMockMedicalRecords() {
                return [
                    {
                        maHoSo: 'HS001',
                        benhNhan: 'Nguyễn Văn An',
                        maBenhNhan: 'BN001',
                        namSinh: 1990,
                        chanDoan: 'Viêm phổi cấp',
                        bacSi: 'BS. Trần Văn Hùng',
                        khoa: 'Khoa Nội',
                        ngayNhapVien: '25/11/2025',
                        ngayXuatVien: null,
                        soNgay: 2,
                        trangThai: 'Đang điều trị'
                    },
                    {
                        maHoSo: 'HS002',
                        benhNhan: 'Trần Thị Bưởi',
                        maBenhNhan: 'BN002',
                        namSinh: 1985,
                        chanDoan: 'Sốt xuất huyết',
                        bacSi: 'BS. Lê Thị Mai',
                        khoa: 'Khoa Ngoại',
                        ngayNhapVien: '20/11/2025',
                        ngayXuatVien: '26/11/2025',
                        soNgay: 6,
                        trangThai: 'Đã xuất viện'
                    }
                ];
            }
            
            // ============================================
            // INIT
            // ============================================
            
            init();
        }
    ]);
    
})();
