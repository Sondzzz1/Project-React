/* ============================
   PATIENT MODAL - modal.js
   Vanilla JS Modal Controller
=============================== */

// Modal state
var PatientModal = {
    isOpen: false,
    isEditing: false,
    currentPatient: null,
    
    // Open modal for adding new patient
    open: function(patient) {
        console.log('PatientModal.open called', patient);
        this.isOpen = true;
        this.currentPatient = patient || null;
        this.isEditing = !!patient;
        
        // Show modal
        var overlay = document.getElementById('patientModalOverlay');
        console.log('Overlay element found:', overlay);
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
            console.log('Modal display set to:', overlay.style.display);
            console.log('Modal computed display:', window.getComputedStyle(overlay).display);
        } else {
            console.error('ERROR: patientModalOverlay element NOT FOUND!');
        }
        
        // Update title
        var title = document.getElementById('patientModalTitle');
        if (title) {
            title.textContent = this.isEditing ? 'Chỉnh sửa Bệnh nhân' : 'Tiếp nhận Bệnh nhân Mới';
        }
        
        // Clear form
        this.clearForm();
        
        // Fill form if editing
        if (patient) {
            this.fillForm(patient);
        }
    },
    
    // Close modal
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
    
    // Clear form fields
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
    },
    
    // Fill form with patient data
    fillForm: function(patient) {
        var mapping = {
            'hoTen': patient.hoTen || '',
            'ngaySinh': patient.ngaySinh ? patient.ngaySinh.split('T')[0] : '',
            'gioiTinh': patient.gioiTinh || '',
            'soDienThoai': patient.soDienThoai || '',
            'diaChi': patient.diaChi || '',
            'soTheBaoHiem': patient.soTheBaoHiem || '',
            'mucHuong': patient.mucHuong || 80,
            'hanTheBHYT': patient.hanTheBHYT ? patient.hanTheBHYT.split('T')[0] : '',
            'trangThai': patient.trangThai || ''
        };
        
        for (var field in mapping) {
            var input = document.getElementById('patient_' + field);
            if (input) {
                input.value = mapping[field];
            }
        }
    },
    
    // Get form data
    getFormData: function() {
        return {
            hoTen: document.getElementById('patient_hoTen')?.value || '',
            ngaySinh: document.getElementById('patient_ngaySinh')?.value || '',
            gioiTinh: document.getElementById('patient_gioiTinh')?.value || '',
            soDienThoai: document.getElementById('patient_soDienThoai')?.value || '',
            diaChi: document.getElementById('patient_diaChi')?.value || '',
            soTheBaoHiem: document.getElementById('patient_soTheBaoHiem')?.value || '',
            mucHuong: parseInt(document.getElementById('patient_mucHuong')?.value) || 80,
            hanTheBHYT: document.getElementById('patient_hanTheBHYT')?.value || '',
            trangThai: document.getElementById('patient_trangThai')?.value || 'Đang điều trị'
        };
    },
    
    // Show error
    showError: function(message) {
        var errorDiv = document.getElementById('patientFormError');
        if (errorDiv) {
            errorDiv.style.display = 'flex';
            errorDiv.innerHTML = '<i class="ti-alert"></i> ' + message;
        }
    },
    
    // Clear error
    clearError: function() {
        var errorDiv = document.getElementById('patientFormError');
        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.innerHTML = '';
        }
    },
    
    // Validate form
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
    
    // Save patient (calls Angular scope)
    save: function() {
        if (!this.validate()) {
            return;
        }
        
        var data = this.getFormData();
        console.log('Saving patient:', data);
        
        // Get Angular scope and call save
        var scope = angular.element(document.querySelector('.admin-wrapper')).scope();
        if (scope) {
            scope.$apply(function() {
                scope.patientForm = data;
                scope.isEditing = PatientModal.isEditing;
                if (PatientModal.currentPatient) {
                    scope.patientForm.maBenhNhan = PatientModal.currentPatient.maBenhNhan;
                    scope.patientForm.id = PatientModal.currentPatient.id;
                }
                scope.savePatientForm();
            });
        }
        
        // Close modal after save
        this.close();
    }
};

// Global function for button onclick
function openPatientModalJS(patient) {
    PatientModal.open(patient);
}

function closePatientModalJS() {
    PatientModal.close();
}

function savePatientModalJS() {
    PatientModal.save();
}

// Also expose to window
window.PatientModal = PatientModal;
window.openPatientModalJS = openPatientModalJS;
window.closePatientModalJS = closePatientModalJS;
window.savePatientModalJS = savePatientModalJS;
