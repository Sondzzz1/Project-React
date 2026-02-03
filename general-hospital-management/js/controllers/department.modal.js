/* ============================
   DEPARTMENT MODAL - department.modal.js
   Modal cho thêm/sửa khoa phòng
=============================== */

var DepartmentModal = {
    isOpen: false,
    currentDepartment: null,
    isEditing: false,
    isViewOnly: false,
    onSaveCallback: null,
    
    /**
     * Mở modal thêm/sửa khoa
     * @param {Object} dept - Khoa cần sửa (null nếu thêm mới)
     * @param {Function} onSave - Callback khi save thành công
     * @param {boolean} viewOnly - Chế độ chỉ xem
     */
    open: function(dept, onSave, viewOnly) {
        console.log('DepartmentModal.open called', dept);
        this.isOpen = true;
        this.currentDepartment = dept || null;
        this.isEditing = !!dept;
        this.isViewOnly = !!viewOnly;
        this.onSaveCallback = onSave || null;
        
        // Show modal
        var overlay = document.getElementById('departmentModalOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
        }
        
        // Update title
        var title = document.getElementById('departmentModalTitle');
        if (title) {
            if (this.isViewOnly) {
                title.textContent = 'Chi tiết Khoa phòng';
            } else {
                title.textContent = this.isEditing ? 'Chỉnh sửa Khoa phòng' : 'Thêm Khoa phòng Mới';
            }
        }
        
        // Hide/Show Save button
        var saveBtn = document.querySelector('#departmentModalOverlay .btn-primary');
        if (saveBtn) {
            saveBtn.style.display = this.isViewOnly ? 'none' : 'inline-block';
        }
        
        // Clear and fill form
        this.clearForm();
        this.clearError();
        
        if (dept) {
            this.fillForm(dept);
        }
        
        // Disable/Enable inputs
        this.setInputsDisabled(this.isViewOnly);
    },
    
    close: function() {
        console.log('DepartmentModal.close called');
        this.isOpen = false;
        this.currentDepartment = null;
        
        var overlay = document.getElementById('departmentModalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },
    
    clearForm: function() {
        var fields = ['deptTenKhoa', 'deptLoaiKhoa', 'deptSoGiuongTieuChuan'];
        fields.forEach(function(fieldId) {
            var field = document.getElementById(fieldId);
            if (field) {
                field.value = '';
            }
        });
        
        // Ẩn dòng ID khi thêm mới
        var idRow = document.getElementById('deptIdRow');
        if (idRow) idRow.style.display = 'none';
    },
    
    fillForm: function(dept) {
        console.log('Filling form with department data:', dept);
        
        // Handle different field name cases
        var deptId = dept.id || dept.Id || '';
        var tenKhoa = dept.tenKhoa || dept.TenKhoa || '';
        var loaiKhoa = dept.loaiKhoa || dept.LoaiKhoa || '';
        var soGiuongTC = dept.soGiuongTieuChuan || dept.SoGiuongTieuChuan || 10;
        
        // Show ID row when editing
        var idRow = document.getElementById('deptIdRow');
        var idDisplay = document.getElementById('deptIdDisplay');
        if (this.isEditing && deptId) {
            if (idRow) idRow.style.display = 'flex';
            if (idDisplay) idDisplay.value = deptId;
        }
        
        this.setFieldValue('deptTenKhoa', tenKhoa);
        
        // Normalize LoaiKhoa if needed (e.g. from DB lacking accents)
        // Log current value to debug
        console.log('Original LoaiKhoa:', loaiKhoa);
        
        var normalizedLoaiKhoa = loaiKhoa;
        if (loaiKhoa) {
            var lower = loaiKhoa.toLowerCase();
            if (lower.includes('lam sang') || lower.includes('lâm sàng')) normalizedLoaiKhoa = 'Lâm sàng';
            else if (lower.includes('can lam') || lower.includes('cận lâm')) normalizedLoaiKhoa = 'Cận lâm sàng';
            else if (lower.includes('hanh chinh') || lower.includes('hành chính')) normalizedLoaiKhoa = 'Hành chính';
        }
        
        // Try setting value, if not found in options, it will default to empty
        this.setFieldValue('deptLoaiKhoa', normalizedLoaiKhoa);
        
        this.setFieldValue('deptSoGiuongTieuChuan', soGiuongTC);
    },
    
    setFieldValue: function(fieldId, value) {
        var field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    },
    
    getFormData: function() {
        var deptId = null;
        if (this.currentDepartment) {
            deptId = this.currentDepartment.id || this.currentDepartment.Id;
        }
        
        return {
            id: deptId,
            tenKhoa: document.getElementById('deptTenKhoa')?.value || '',
            loaiKhoa: document.getElementById('deptLoaiKhoa')?.value || '',
            soGiuongTieuChuan: parseInt(document.getElementById('deptSoGiuongTieuChuan')?.value) || 10
        };
    },
    
    validate: function() {
        var data = this.getFormData();
        var errors = [];
        
        if (!data.tenKhoa || data.tenKhoa.trim() === '') {
            errors.push('Vui lòng nhập tên khoa');
        }
        if (!data.loaiKhoa || data.loaiKhoa.trim() === '') {
            errors.push('Vui lòng chọn loại khoa');
        }
        if (!data.soGiuongTieuChuan || data.soGiuongTieuChuan <= 0) {
            errors.push('Số giường tiêu chuẩn phải lớn hơn 0');
        }
        
        return errors;
    },
    
    showError: function(message) {
        var errorDiv = document.getElementById('departmentModalError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    },
    
    clearError: function() {
        var errorDiv = document.getElementById('departmentModalError');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    },
    
    setInputsDisabled: function(disabled) {
        var inputs = document.querySelectorAll('#departmentModalOverlay input, #departmentModalOverlay select');
        inputs.forEach(function(input) {
            if (input.id !== 'deptIdDisplay') { // ID always readonly
                input.disabled = disabled;
            }
        });
    },
    
    save: function() {
        console.log('DepartmentModal.save called');
        var self = this;
        
        // Validate
        var errors = this.validate();
        if (errors.length > 0) {
            this.showError(errors.join('. '));
            return;
        }
        
        // Get form data
        var formData = this.getFormData();
        console.log('Form data:', formData);
        
        // Get Angular scope and service
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        if (!scope || !scope.DepartmentService) {
            this.showError('Lỗi hệ thống: Không tìm thấy service');
            return;
        }
        
        // Call API
        var savePromise;
        if (this.isEditing) {
            savePromise = scope.DepartmentService.update(formData);
        } else {
            savePromise = scope.DepartmentService.create(formData);
        }
        
        savePromise.then(function(response) {
            console.log('Save success:', response);
            alert(self.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            self.close();
            
            // Reload department list
            setTimeout(function() {
                var appScope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
                if (appScope && appScope.loadDepartmentList) {
                    if (appScope.$$phase || appScope.$root.$$phase) {
                        appScope.loadDepartmentList();
                    } else {
                        appScope.$apply(function() {
                            appScope.loadDepartmentList();
                        });
                    }
                }
            }, 100);
            
            // Call callback if provided
            if (self.onSaveCallback) {
                self.onSaveCallback(response);
            }
        })
        .catch(function(error) {
            console.error('Save error:', error);
            var errorMsg = error.data?.message || error.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.';
            self.showError(errorMsg);
        });
    }
};

// Expose to window
window.DepartmentModal = DepartmentModal;

// Global functions for onclick handlers
function closeDepartmentModalJS() {
    DepartmentModal.close();
}

function saveDepartmentModalJS() {
    DepartmentModal.save();
}
