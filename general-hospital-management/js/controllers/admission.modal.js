/* ============================
   ADMISSION MODAL - admission.modal.js
   Modal cho việc Nhập viện (Gán bệnh nhân vào giường)
   =============================== */

var AdmissionModal = {
    isOpen: false,
    selectedBed: null,
    onSaveCallback: null,
    patients: [], // List for dropdown search
    
    /**
     * Mở modal nhập viện
     * @param {Object} bed - Giường được chọn
     * @param {Function} onSave - Callback khi save thành công
     */
    open: function(bed, onSave) {
        console.log('AdmissionModal.open called for bed:', bed);
        if (!bed) {
            alert('Vui lòng chọn một giường!');
            return;
        }
        
        this.isOpen = true;
        this.selectedBed = bed;
        this.onSaveCallback = onSave || null;
        
        // Show modal
        var overlay = document.getElementById('admissionModalOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        // Update info display
        var bedInfo = document.getElementById('admitBedInfo');
        if (bedInfo) {
            bedInfo.textContent = `${bed.tenGiuong} - ${this.getKhoaName(bed.khoaId)}`;
        }
        
        // Load patients if empty
        if (this.patients.length === 0) {
            this.loadPatients();
        }
        
        this.clearForm();
        this.clearError();
    },
    
    close: function() {
        this.isOpen = false;
        this.selectedBed = null;
        var overlay = document.getElementById('admissionModalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },
    
    // Helper to get Department Name (needs access to BedController scope or similar)
    getKhoaName: function(khoaId) {
        // Try to access scope to get Department Name
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        if (scope && scope.getDepartmentName) {
            return scope.getDepartmentName(khoaId);
        }
        // Fallback: finding in scope.departments directly
        if (scope && scope.departments) {
             var dept = scope.departments.find(d => d.id === khoaId);
             return dept ? dept.tenKhoa : khoaId;
        }
        return khoaId;
    },

    loadPatients: function() {
        var self = this;
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        
        if (scope && scope.PatientService) {
            // Load all patients (optimized for search usually, but simple list for now)
            scope.PatientService.getAll().then(function(response) {
                if (Array.isArray(response)) {
                    self.patients = response;
                } else if (response.data) {
                    self.patients = response.data;
                }
                self.renderPatientOptions();
            });
        }
    },
    
    renderPatientOptions: function() {
        var select = document.getElementById('admitPatientSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Chọn Bệnh nhân --</option>';
        this.patients.forEach(function(p) {
            var opt = document.createElement('option');
            opt.value = p.id || p.maBenhNhan;
            
            var phone = p.soDienThoai || p.SoDienThoai;
            var name = p.hoTen || p.HoTen || 'Không tên';
            var displayText = name;
            
            if (phone) {
                displayText += ` - ${phone}`;
            }
            
            opt.textContent = displayText;
            select.appendChild(opt);
        });
    },
    
    clearForm: function() {
        var pSelect = document.getElementById('admitPatientSelect');
        var reason = document.getElementById('admitReason');
        if (pSelect) pSelect.value = "";
        if (reason) reason.value = "";
    },
    
    showError: function(msg) {
        var errDiv = document.getElementById('admissionModalError');
        if (errDiv) {
            errDiv.innerHTML = '<i class="ti-alert"></i> ' + msg;
            errDiv.style.display = 'block';
        }
    },
    
    clearError: function() {
        var errDiv = document.getElementById('admissionModalError');
        if (errDiv) {
            errDiv.style.display = 'none';
            errDiv.textContent = '';
        }
    },
    
    save: function() {
        var self = this;
        var patientId = document.getElementById('admitPatientSelect').value;
        var reason = document.getElementById('admitReason').value;
        
        if (!patientId) {
            this.showError('Vui lòng chọn bệnh nhân');
            return;
        }
        
        if (!this.selectedBed) {
            this.showError('Lỗi: Không xác định được giường.');
            return;
        }

        var admissionData = {
            benhNhanId: patientId,
            khoaId: this.selectedBed.khoaId,
            giuongId: this.selectedBed.id || this.selectedBed.maGiuong, // Check ID field mapping
            lyDoNhap: reason || 'Nhập viện điều trị',
            ngayNhap: new Date() // Sending Date object, service/http will serialize
        };
        
        console.log('Saving admission:', admissionData);
        
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        if (scope && scope.AdmissionService) {
            scope.AdmissionService.create(admissionData)
                .then(function(response) {
                    console.log('Admission Success:', response);
                    alert('Tiếp nhận bệnh nhân thành công!');
                    self.close();
                    if (self.onSaveCallback) self.onSaveCallback();
                })
                .catch(function(error) {
                    console.error('Admission Error:', error);
                    var msg = error.data?.message || 'Có lỗi xảy ra khi nhập viện.';
                    // Check specifically for "Giường bận" error
                    if (msg.includes('bận')) msg = 'Giường này đã có người (kiểm tra lại trạng thái)!';
                    self.showError(msg);
                });
        }
    }
};

// Global Exposure
window.AdmissionModal = AdmissionModal;

function closeAdmissionModalJS() {
    AdmissionModal.close();
}

function saveAdmissionModalJS() {
    AdmissionModal.save();
}
