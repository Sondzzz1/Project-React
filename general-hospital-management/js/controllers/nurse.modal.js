/* ============================
   NURSE MODAL - nurse.modal.js
   Modal controller for Nurse CRUD
=============================== */

var NurseModal = {
    isOpen: false,
    isEditing: false,
    currentData: null,
    onSaveCallback: null,
    departments: [],

    // Find Angular scope or injector
    getAngularContext: function() {
        // Try NurseController first
        var nurseEl = document.querySelector('[ng-controller="NurseController"]');
        if (nurseEl) {
            var scope = angular.element(nurseEl).scope();
            if (scope) return { scope: scope, injector: angular.element(nurseEl).injector() };
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
        var overlay = document.getElementById('nurseModalOverlay');
        if (overlay) overlay.style.display = 'flex';
        
        var title = document.getElementById('nurseModalTitle');
        if (title) title.textContent = this.isEditing ? 'Cập nhật Thông tin Y tá' : 'Thêm Y tá Mới';

        this.renderDepartments();
        this.clearForm();
        this.clearError();
        
        if (this.isEditing && this.currentData) {
            this.fillForm(this.currentData);
        }
    },

    close: function() {
        this.isOpen = false;
        var overlay = document.getElementById('nurseModalOverlay');
        if (overlay) overlay.style.display = 'none';
        this.currentData = null;
    },

    renderDepartments: function() {
        var select = document.getElementById('nurseKhoaSelect');
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
        this.setValue('nurseHoTen', '');
        this.setValue('nurseNgaySinh', '');
        this.setValue('nurseGioiTinh', 'Nam');
        this.setValue('nursePhone', '');
        this.setValue('nurseKhoaSelect', '');
        this.setValue('nurseChungChi', '');
    },

    fillForm: function(data) {
        this.setValue('nurseHoTen', data.hoTen);
        this.setValue('nurseNgaySinh', data.ngaySinh ? data.ngaySinh.split('T')[0] : '');
        this.setValue('nurseGioiTinh', data.gioiTinh);
        this.setValue('nursePhone', data.soDienThoai);
        this.setValue('nurseKhoaSelect', data.khoaId);
        this.setValue('nurseChungChi', data.chungChiHanhNghe);
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
        var el = document.getElementById('nurseModalError');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    },

    clearError: function() {
        var el = document.getElementById('nurseModalError');
        if (el) el.style.display = 'none';
    },

    save: function() {
        var hoTen = this.getValue('nurseHoTen');
        var ngaySinhVal = this.getValue('nurseNgaySinh');
        var gioiTinh = this.getValue('nurseGioiTinh');
        var phone = this.getValue('nursePhone');
        var khoaId = this.getValue('nurseKhoaSelect');
        var chungChi = this.getValue('nurseChungChi');

        if (!hoTen) {
            this.showError('Vui lòng nhập họ tên y tá');
            return;
        }

        // Format DateOnly as YYYY-MM-DD string
        var formattedDate = null;
        if (ngaySinhVal) {
            formattedDate = ngaySinhVal; 
        }

        var payload = {
            hoTen: hoTen,
            ngaySinh: formattedDate,
            gioiTinh: gioiTinh,
            soDienThoai: phone,
            khoaId: khoaId && khoaId !== "" ? khoaId : null,
            chungChiHanhNghe: chungChi
        };

        var ctx = this.getAngularContext();
        if (!ctx.injector) {
            this.showError('Lỗi: Không tìm thấy Angular context');
            return;
        }

        var NurseService = ctx.injector.get('NurseService');
        var $timeout = ctx.injector.get('$timeout');
        var self = this;
        var p;
        
        if (this.isEditing) {
            payload.id = this.currentData.id;
            p = NurseService.update(this.currentData.id, payload);
        } else {
            p = NurseService.create(payload);
        }

        p.then(function(res) {
            // Success - close modal first
            self.close();
            alert(self.isEditing ? 'Cập nhật thành công' : 'Thêm mới thành công');
            
            // Try to reload nurse list - wrap in try-catch to prevent errors 
            try {
                var nurseEl = document.querySelector('[ng-controller="NurseController"]');
                if (nurseEl) {
                    var nurseScope = angular.element(nurseEl).scope();
                    if (nurseScope && nurseScope.loadNurses) {
                        $timeout(function() {
                            try {
                                nurseScope.loadNurses(nurseScope.currentPage || 1);
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
            console.error('Nurse save error:', err);
            var msg = 'Có lỗi xảy ra';
            if (err && err.data && err.data.message) {
                msg = err.data.message;
            } else if (err && err.status) {
                msg = 'Lỗi HTTP ' + err.status;
            }
            if (err && err.data && err.data.errors) {
                 msg += ': ' + JSON.stringify(err.data.errors);
            }
            self.showError(msg);
        });
    }
};

window.NurseModal = NurseModal;
function openNurseModalJS(data, onSave) { NurseModal.open(data, onSave); }
function closeNurseModalJS() { NurseModal.close(); }
function saveNurseModalJS() { NurseModal.save(); }
