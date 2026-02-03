/* ============================
   SURGERY MODAL - surgery.modal.js
   Modal Đặt lịch mổ
   =============================== */

var SurgeryModal = {
    isOpen: false,
    mode: 'create', // create | edit
    currentData: null,
    doctors: [],
    inpatients: [],
    onSaveCallback: null,

    open: function(mode, data, doctors, onSave) {
        this.isOpen = true;
        this.mode = mode || 'create';
        this.currentData = data || {};
        this.doctors = doctors || [];
        this.onSaveCallback = onSave;
        
        // Show Modal
        var overlay = document.getElementById('surgeryModalOverlay');
        if (overlay) overlay.style.display = 'flex';
        
        var title = document.getElementById('surgeryModalTitle');
        if (title) title.textContent = (mode === 'edit') ? 'Cập nhật Lịch mổ' : 'Đặt lịch mổ Mới';

        this.loadInpatients();
        this.renderDoctors();
        
        if (mode === 'edit' && data) {
            this.fillForm(data);
        } else {
            this.clearForm();
        }
        this.clearError();
    },

    close: function() {
        this.isOpen = false;
        var overlay = document.getElementById('surgeryModalOverlay');
        if (overlay) overlay.style.display = 'none';
        
        // Clear references
        this.currentData = null;
    },

    loadInpatients: function() {
        var self = this;
        // Access existing AdmissionService from AdminController scope or create new injection? 
        // Better to access via scope if possible, as services are registered in app.
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        
        if (scope && scope.AdmissionService) {
            // Load inpatients
            scope.AdmissionService.getInpatientList().then(function(data) {
                // If API returns wrapped object
                var list = Array.isArray(data) ? data : (data.data || []);
                self.inpatients = list;
                self.renderInpatientSelect();
                
                // If edit mode, set value after rendering
                if (self.mode === 'edit' && self.currentData) {
                   document.getElementById('surgeryPatientSelect').value = self.currentData.nhapVienId;
                   // Disable patient select in edit mode usually? Or allow change?
                }
            });
        }
    },

    renderInpatientSelect: function() {
        var select = document.getElementById('surgeryPatientSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Chọn Bệnh nhân (Đang nằm viện) --</option>';
        this.inpatients.forEach(function(item) {
            // item is an Inpatient DTO (NhapVienViewModel)
            // Expecting: id (NhapVienId), tenBenhNhan, maBenhNhan, tenKhoa, tenGiuong
            var opt = document.createElement('option');
            opt.value = item.id; // NhapVienId
            opt.textContent = `${item.tenBenhNhan} (${item.tenGiuong} - ${item.tenKhoa})`;
            // Store data attributes for auto-fill
            opt.dataset.benhNhanId = item.benhNhanId;
            opt.dataset.maBenhNhan = item.maBenhNhan;
            select.appendChild(opt);
        });
        
        // Add Change Event Listener to populate info
        select.onchange = function() {
            var selectedOpt = select.options[select.selectedIndex];
            // Could display specific info if needed
        };
    },

    renderDoctors: function() {
         var select = document.getElementById('surgeryDoctorSelect');
         if (!select) return;
         select.innerHTML = '<option value="">-- Chọn Bác sĩ --</option>';
         
         this.doctors.forEach(function(doc) {
             var opt = document.createElement('option');
             opt.value = doc.id;
             opt.textContent = doc.hoTen + (doc.chuyenKhoa ? ' - ' + doc.chuyenKhoa : '');
             select.appendChild(opt);
         });
    },

    fillForm: function(data) {
        this.setValue('surgeryPatientSelect', data.nhapVienId);
        this.setValue('surgeryDoctorSelect', data.bacSiChinhId);  // Fixed: was bacSiPhuTrachId
        this.setValue('surgeryType', data.loaiPhauThuat);
        this.setValue('surgeryRoom', data.phongMo);
        // Date formatting
        if (data.ngay) {  // Fixed: was thoiGianBatDau
            var d = new Date(data.ngay);
            var iso = d.toISOString().slice(0, 16);
            this.setValue('surgeryDateTime', iso);
        }
        this.setValue('surgeryStatus', this.getStatusValue(data.trangThai));
        this.setValue('surgeryChiPhi', data.chiPhi || 0);
    },

    clearForm: function() {
        this.setValue('surgeryPatientSelect', '');
        this.setValue('surgeryDoctorSelect', '');
        this.setValue('surgeryType', '');
        this.setValue('surgeryRoom', '');
        this.setValue('surgeryDateTime', '');
        this.setValue('surgeryChiPhi', '0');
        this.setValue('surgeryStatus', '0');
    },

    setValue: function(id, val) {
        var el = document.getElementById(id);
        if (el) el.value = val || '';
    },
    
    getValue: function(id) {
        var el = document.getElementById(id);
        return el ? el.value : null;
    },
    
    // Convert status dropdown value to string for backend
    getStatusString: function(val) {
        switch(String(val)) {
            case '0': return 'ChoThucHien';
            case '1': return 'DangThucHien';
            case '2': return 'HoanThanh';
            default: return val || 'ChoThucHien';
        }
    },
    
    // Convert backend status string to dropdown value
    getStatusValue: function(status) {
        if (!status) return '0';
        var s = String(status).toLowerCase();
        if (s.indexOf('hoan') >= 0) return '2';
        if (s.indexOf('dang') >= 0) return '1';
        return '0';
    },

    showError: function(msg) {
        var el = document.getElementById('surgeryModalError');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    },
    
    clearError: function() {
        var el = document.getElementById('surgeryModalError');
        if (el) {
            el.style.display = 'none';
        }
    },

    save: function() {
        var self = this;
        var nhapVienId = this.getValue('surgeryPatientSelect');
        var bacSiId = this.getValue('surgeryDoctorSelect');
        var loaiPT = this.getValue('surgeryType');
        var phongMo = this.getValue('surgeryRoom');
        var thoiGian = this.getValue('surgeryDateTime');
        var chiPhi = this.getValue('surgeryChiPhi');
        var status = this.getValue('surgeryStatus');

        if (!nhapVienId || !bacSiId || !thoiGian) {
            this.showError('Vui lòng điền đầy đủ thông tin bắt buộc (*)');
            return;
        }

        var payload = {
            nhapVienId: nhapVienId,
            bacSiChinhId: bacSiId,  // Fixed: was bacSiPhuTrachId
            loaiPhauThuat: loaiPT,
            ekip: '',  // Optional team info
            phongMo: phongMo,
            ngay: new Date(thoiGian).toISOString(),
            chiPhi: parseFloat(chiPhi) || 0,
            trangThai: this.getStatusString(status)
        };

        // If Create Mode
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        var service = scope.SurgeryService;

        var promise;
        if (this.mode === 'create') {
            promise = service.create(payload);
        } else {
             // In edit, payload might need ID
             // payload.id = this.currentData.id;
             promise = service.update(this.currentData.id, payload);
        }

        promise.then(function(res) {
            alert('Lưu lịch phẫu thuật thành công!');
            self.close();
            if (self.onSaveCallback) self.onSaveCallback();
        }).catch(function(err) {
            console.error('Surgery Save Error:', err);
            self.showError(err.data?.message || 'Có lỗi xảy ra.');
        });
    }
};

window.SurgeryModal = SurgeryModal;

function closeSurgeryModalJS() { SurgeryModal.close(); }
function saveSurgeryModalJS() { SurgeryModal.save(); }
