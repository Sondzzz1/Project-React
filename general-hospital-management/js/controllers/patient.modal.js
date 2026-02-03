/* ============================
   PATIENT MODAL - patient.modal.js
   Modal controller for Patient CRUD
=============================== */

var PatientModal = {
    isOpen: false,
    isEditing: false,
    currentPatient: null,
    onSaveCallback: null,
    
    /**
     * Mở modal thêm/sửa bệnh nhân
     * @param {Object} patient - Bệnh nhân cần sửa (null nếu thêm mới)
     * @param {Function} onSave - Callback khi save thành công
     */
    /**
     * Mở modal thêm/sửa bệnh nhân
     * @param {Object} patient - Bệnh nhân cần sửa (null nếu thêm mới)
     * @param {Function} onSave - Callback khi save thành công
     * @param {boolean} viewOnly - Chế độ chỉ xem
     */
    open: function(patient, onSave, viewOnly) {
        console.log('PatientModal.open called', patient);
        this.isOpen = true;
        this.currentPatient = patient || null;
        this.isEditing = !!patient;
        this.isViewOnly = !!viewOnly;
        this.onSaveCallback = onSave || null;
        
        // Show modal
        var overlay = document.getElementById('patientModalOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
        }
        
        // Update title and buttons
        var title = document.getElementById('patientModalTitle');
        if (title) {
            if (this.isViewOnly) title.textContent = 'Thông tin Chi tiết Bệnh nhân';
            else title.textContent = this.isEditing ? 'Chỉnh sửa Bệnh nhân' : 'Tiếp nhận Bệnh nhân Mới';
        }
        
        // Hide/Show Save button
        var saveBtn = document.querySelector('#patientModalOverlay .btn-primary');
        if (saveBtn) {
            saveBtn.style.display = this.isViewOnly ? 'none' : 'block';
        }
        
        // Clear and fill form
        this.clearForm();
        this.clearError();
        
        if (patient) {
            this.fillForm(patient);
        }
        
        // Disable/Enable inputs
        this.setInputsDisabled(this.isViewOnly);
    },
    
    setInputsDisabled: function(disabled) {
        var inputs = document.querySelectorAll('#patientModalOverlay input, #patientModalOverlay select');
        inputs.forEach(function(input) {
            input.disabled = disabled;
        });
    },
    
    /**
     * Đóng modal
     */
    close: function() {
        console.log('PatientModal.close called');
        this.isOpen = false;
        this.currentPatient = null;
        
        var overlay = document.getElementById('patientModalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        
        this.clearForm();
        this.clearError();
    },
    
    /**
     * Clear tất cả fields trong form
     */
    clearForm: function() {
        var fields = ['hoTen', 'ngaySinh', 'gioiTinh', 'soDienThoai', 'diaChi', 'soTheBaoHiem', 'mucHuong', 'hanTheBHYT', 'trangThai'];
        fields.forEach(function(field) {
            var input = document.getElementById('patient_' + field);
            if (input) {
                if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                } else {
                    input.value = '';
                }
            }
        });
        // Set default mucHuong
        var mucHuong = document.getElementById('patient_mucHuong');
        if (mucHuong) mucHuong.value = '80';
        
        // Set default trangThai
        var trangThai = document.getElementById('patient_trangThai');
        if (trangThai) trangThai.value = 'Đang điều trị';
    },
    
    /**
     * Fill form với dữ liệu bệnh nhân
     * @param {Object} patient - Dữ liệu bệnh nhân
     */
    fillForm: function(patient) {
        var mhValue = patient.mucHuong;
        // If value is small (e.g. 0.8), convert to percentage (80)
        // If value is already large (e.g. 80), keep it
        if (mhValue && mhValue <= 1) {
            mhValue = mhValue * 100;
        }

        var mapping = {
            'hoTen': patient.hoTen || '',
            'ngaySinh': patient.ngaySinh ? patient.ngaySinh.split('T')[0] : '',
            'gioiTinh': patient.gioiTinh || '',
            'soDienThoai': patient.soDienThoai || '',
            'diaChi': patient.diaChi || '',
            'soTheBaoHiem': patient.soTheBaoHiem || '',
            'mucHuong': mhValue || 80,
            'hanTheBHYT': patient.hanTheBHYT ? patient.hanTheBHYT.split('T')[0] : '',
            'trangThai': patient.trangThai || 'Đang điều trị'
        };
        
        for (var field in mapping) {
            var input = document.getElementById('patient_' + field);
            if (input) {
                input.value = mapping[field];
            }
        }
    },
    
    /**
     * Lấy dữ liệu từ form
     * @returns {Object} Form data
     */
    getFormData: function() {
        var mhRaw = parseInt(document.getElementById('patient_mucHuong')?.value) || 80;
        // Convert back to decimal if > 1 (e.g. 80 -> 0.8) for DB
        var mhDecimal = mhRaw;
        if (mhRaw > 1) {
            mhDecimal = mhRaw / 100;
        }

        return {
            hoTen: document.getElementById('patient_hoTen')?.value || '',
            ngaySinh: document.getElementById('patient_ngaySinh')?.value || '',
            gioiTinh: document.getElementById('patient_gioiTinh')?.value || '',
            soDienThoai: document.getElementById('patient_soDienThoai')?.value || '',
            diaChi: document.getElementById('patient_diaChi')?.value || '',
            soTheBaoHiem: document.getElementById('patient_soTheBaoHiem')?.value || '',
            mucHuong: mhDecimal,
            hanTheBHYT: document.getElementById('patient_hanTheBHYT')?.value || '',
            trangThai: document.getElementById('patient_trangThai')?.value || 'Đang điều trị'
        };
    },
    
    /**
     * Hiện thông báo lỗi
     * @param {string} message - Nội dung lỗi
     */
    showError: function(message) {
        var errorDiv = document.getElementById('patientFormError');
        if (errorDiv) {
            errorDiv.style.display = 'flex';
            errorDiv.innerHTML = '<i class="ti-alert"></i> ' + message;
        }
    },
    
    /**
     * Xóa thông báo lỗi
     */
    clearError: function() {
        var errorDiv = document.getElementById('patientFormError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.innerHTML = '';
        }
    },
    
    /**
     * Validate form
     * @returns {boolean} True nếu valid
     */
    validate: function() {
        var data = this.getFormData();
        
        if (!data.hoTen || data.hoTen.trim() === '') {
            this.showError('Vui lòng nhập họ tên bệnh nhân');
            return false;
        }
        if (!data.ngaySinh) {
            this.showError('Vui lòng nhập ngày sinh');
            return false;
        }
        if (!data.gioiTinh) {
            this.showError('Vui lòng chọn giới tính');
            return false;
        }
        
        this.clearError();
        return true;
    },
    
    /**
     * Lưu bệnh nhân (gọi Angular service)
     */
    save: function() {
        if (!this.validate()) {
            return;
        }
        
        var data = this.getFormData();
        console.log('Saving patient:', data);
        
        // Thêm ID nếu đang edit
        if (this.isEditing && this.currentPatient) {
            data.maBenhNhan = this.currentPatient.maBenhNhan || this.currentPatient.id;
        }
        
        // Get Angular scope
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        if (!scope) {
            scope = angular.element(document.querySelector('.admin-wrapper')).scope();
        }
        
        if (scope && scope.PatientService) {
            var self = this;
            var savePromise;
            
            if (this.isEditing) {
                savePromise = scope.PatientService.update(data.maBenhNhan, data);
            } else {
                savePromise = scope.PatientService.create(data);
            }
            
            savePromise.then(function(response) {
                console.log('Save success:', response);
                alert(self.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
                self.close();
                
                // Reload patients list safely
                // Use setTimeout to allow modal to close first and avoid digest conflicts
                setTimeout(function() {
                    var appScope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
                    if (!appScope) appScope = angular.element(document.querySelector('.admin-wrapper')).scope();
                    
                    if (appScope && appScope.loadPatients) {
                        console.log('Reloading patient list via scope...');
                        // Use $applyAsync or $evalAsync checking phase
                        if (appScope.$$phase || appScope.$root.$$phase) {
                            appScope.loadPatients();
                        } else {
                            appScope.$apply(function() {
                                appScope.loadPatients();
                            });
                        }
                    } else {
                        console.warn('Could not find scope.loadPatients to reload list');
                        // Fallback: reload page if absolutely necessary
                        // location.reload();
                    }
                }, 100);
                
                // Call callback if provided
                if (self.onSaveCallback) {
                    self.onSaveCallback(response);
                }
            }).catch(function(error) {
                console.error('Save error:', error);
                self.showError('Không thể lưu. Vui lòng thử lại. ' + (error.data?.message || ''));
            });
        } else {
            console.error('Angular scope or PatientService not found');
            this.showError('Lỗi hệ thống. Vui lòng refresh trang.');
        }
    }
};

// Global functions for onclick handlers
function openPatientModalJS(patient, onSave) {
    PatientModal.open(patient, onSave);
}

function closePatientModalJS() {
    PatientModal.close();
}

function savePatientModalJS() {
    PatientModal.save();
}

// Expose to window
window.PatientModal = PatientModal;
window.openPatientModalJS = openPatientModalJS;
window.closePatientModalJS = closePatientModalJS;
window.savePatientModalJS = savePatientModalJS;
