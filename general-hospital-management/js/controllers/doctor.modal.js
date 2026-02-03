/* ============================
   DOCTOR MODAL - doctor.modal.js
   Modal controller for Doctor CRUD
=============================== */

var DoctorModal = {
    isOpen: false,
    isEditing: false,
    currentData: null,
    onSaveCallback: null,
    departments: [],

    // Find Angular scope or injector
    getAngularContext: function() {
        // Try DoctorController first
        var doctorEl = document.querySelector('[ng-controller="DoctorController"]');
        if (doctorEl) {
            var scope = angular.element(doctorEl).scope();
            if (scope) return { scope: scope, injector: angular.element(doctorEl).injector() };
        }
        
        // Fallback to AdminController
        var adminEl = document.querySelector('[ng-controller="AdminController"]') || document.querySelector('.admin-wrapper');
        if (adminEl) {
            var scope = angular.element(adminEl).scope();
            if (scope) return { scope: scope, injector: angular.element(adminEl).injector() };
        }
        
        return { scope: null, injector: null };
    },

    open: function(data, onSave) {
        this.isOpen = true;
        this.currentData = data || null;
        this.isEditing = !!data;
        this.onSaveCallback = onSave || null;
        
        // Load departments from any available scope
        var ctx = this.getAngularContext();
        if (ctx.scope && ctx.scope.departments) {
            this.departments = ctx.scope.departments;
        } else if (ctx.injector) {
            // Try to load departments if not available
            try {
                var DeptService = ctx.injector.get('DepartmentService');
                var self = this;
                DeptService.getAll().then(function(data) {
                    self.departments = data || [];
                    self.renderDepartments();
                });
            } catch(e) { console.error('Could not load departments:', e); }
        }

        // UI Setup
        var overlay = document.getElementById('doctorModalOverlay');
        if (overlay) overlay.style.display = 'flex';
        
        var title = document.getElementById('doctorModalTitle');
        if (title) title.textContent = this.isEditing ? 'Cập nhật Thông tin Bác sĩ' : 'Thêm Bác sĩ Mới';

        this.renderDepartments();
        this.clearForm();
        this.clearError();
        
        if (this.isEditing && this.currentData) {
            this.fillForm(this.currentData);
        }
    },

    close: function() {
        this.isOpen = false;
        var overlay = document.getElementById('doctorModalOverlay');
        if (overlay) overlay.style.display = 'none';
        this.currentData = null;
    },

    renderDepartments: function() {
        var select = document.getElementById('docKhoaSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Chọn Khoa --</option>';
        this.departments.forEach(function(d) {
            var opt = document.createElement('option');
            opt.value = d.id;
            opt.textContent = d.tenKhoa;
            select.appendChild(opt);
        });
    },

    clearForm: function() {
        this.setValue('docHoTen', '');
        this.setValue('docChuyenKhoa', '');
        this.setValue('docLienHe', '');
        this.setValue('docKhoaSelect', '');
    },

    fillForm: function(data) {
        this.setValue('docHoTen', data.hoTen);
        this.setValue('docChuyenKhoa', data.chuyenKhoa);
        this.setValue('docLienHe', data.thongTinLienHe);
        this.setValue('docKhoaSelect', data.khoaId);
    },

    setValue: function(id, val) {
        var el = document.getElementById(id);
        if (el) el.value = val || '';
    },
    
    getValue: function(id) {
        var el = document.getElementById(id);
        return el ? el.value : '';
    },

    showError: function(msg) {
        var el = document.getElementById('doctorModalError');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    },

    clearError: function() {
        var el = document.getElementById('doctorModalError');
        if (el) el.style.display = 'none';
    },

    save: function() {
        var hoTen = this.getValue('docHoTen');
        var chuyenKhoa = this.getValue('docChuyenKhoa');
        var lienHe = this.getValue('docLienHe');
        var khoaId = this.getValue('docKhoaSelect');

        if (!hoTen) {
            this.showError('Vui lòng nhập họ tên bác sĩ');
            return;
        }

        var payload = {
            hoTen: hoTen,
            chuyenKhoa: chuyenKhoa,
            thongTinLienHe: lienHe,
            khoaId: khoaId || null 
        };

        var ctx = this.getAngularContext();
        if (!ctx.injector) {
            this.showError('Lỗi: Không tìm thấy Angular context');
            return;
        }
        
        var DoctorService = ctx.injector.get('DoctorService');
        var $timeout = ctx.injector.get('$timeout');
        var self = this;
        var p;
        
        if (this.isEditing) {
            payload.id = this.currentData.id;
            p = DoctorService.update(this.currentData.id, payload);
        } else {
            p = DoctorService.create(payload);
        }

        p.then(function(res) {
            // Success - close modal first
            self.close();
            alert(self.isEditing ? 'Cập nhật thành công' : 'Thêm mới thành công');
            
            // Try to reload doctor list - wrap in try-catch to prevent errors 
            try {
                var doctorEl = document.querySelector('[ng-controller="DoctorController"]');
                if (doctorEl) {
                    var doctorScope = angular.element(doctorEl).scope();
                    if (doctorScope && doctorScope.loadDoctors) {
                        $timeout(function() {
                            try {
                                doctorScope.loadDoctors(doctorScope.currentPage || 1);
                            } catch(e) { console.warn('Reload error:', e); }
                        }, 100);
                    }
                }
                
                if (self.onSaveCallback) {
                    $timeout(function() {
                        try { self.onSaveCallback(); } catch(e) { console.warn('Callback error:', e); }
                    }, 100);
                }
            } catch(e) {
                console.warn('Post-save reload error:', e);
            }
        }).catch(function(err) {
            console.error('Doctor save error:', err);
            var msg = 'Có lỗi xảy ra';
            if (err && err.data && err.data.message) {
                msg = err.data.message;
            } else if (err && err.status) {
                msg = 'Lỗi HTTP ' + err.status;
            }
            self.showError(msg);
        });
    }
};

window.DoctorModal = DoctorModal;
function openDoctorModalJS(data, onSave) { DoctorModal.open(data, onSave); }
function closeDoctorModalJS() { DoctorModal.close(); }
function saveDoctorModalJS() { DoctorModal.save(); }
