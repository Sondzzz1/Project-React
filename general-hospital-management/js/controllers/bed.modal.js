/* ============================
   BED MODAL - bed.modal.js
   Modal cho thêm/sửa giường bệnh
=============================== */

var BedModal = {
    isOpen: false,
    currentBed: null,
    isEditing: false,
    isViewOnly: false,
    onSaveCallback: null,
    departments: [],
    
    /**
     * Mở modal thêm/sửa giường
     * @param {Object} bed - Giường cần sửa (null nếu thêm mới)
     * @param {Array} departments - Danh sách khoa phòng
     * @param {Function} onSave - Callback khi save thành công
     * @param {boolean} viewOnly - Chế độ chỉ xem
     */
    open: function(bed, departments, onSave, viewOnly) {
        console.log('BedModal.open called', bed);
        this.isOpen = true;
        this.currentBed = bed || null;
        this.isEditing = !!bed;
        this.isViewOnly = !!viewOnly;
        this.onSaveCallback = onSave || null;
        this.departments = departments || [];
        
        // Show modal
        var overlay = document.getElementById('bedModalOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';
        }
        
        // Update title
        var title = document.getElementById('bedModalTitle');
        if (title) {
            if (this.isViewOnly) {
                title.textContent = 'Chi tiết Giường bệnh';
            } else {
                title.textContent = this.isEditing ? 'Chỉnh sửa Giường bệnh' : 'Thêm Giường bệnh Mới';
            }
        }
        
        // Hide/Show Save button
        var saveBtn = document.querySelector('#bedModalOverlay .btn-primary');
        if (saveBtn) {
            saveBtn.style.display = this.isViewOnly ? 'none' : 'block';
        }
        
        // Fill department dropdown
        this.fillDepartmentDropdown();
        
        // Clear and fill form
        this.clearForm();
        this.clearError();
        
        if (bed) {
            this.fillForm(bed);
        }
        
        // Disable/Enable inputs
        this.setInputsDisabled(this.isViewOnly);
    },
    
    close: function() {
        console.log('BedModal.close called');
        this.isOpen = false;
        this.currentBed = null;
        
        var overlay = document.getElementById('bedModalOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    },
    
    fillDepartmentDropdown: function() {
        var select = document.getElementById('bedKhoaId');
        if (!select) return;
        
        // Clear existing options
        select.innerHTML = '<option value="">-- Chọn khoa --</option>';
        
        // Add department options
        this.departments.forEach(function(dept) {
            var option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.tenKhoa;
            select.appendChild(option);
        });
    },
    
    clearForm: function() {
        var fields = ['bedKhoaId', 'bedTenGiuong', 'bedLoaiGiuong', 'bedGiaTien', 'bedTrangThai'];
        fields.forEach(function(fieldId) {
            var field = document.getElementById(fieldId);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = false;
                } else {
                    field.value = '';
                }
            }
        });
        
        // Ẩn dòng ID khi thêm mới (vì ID tự generate)
        var idRow = document.getElementById('bedIdRow');
        if (idRow) idRow.style.display = 'none';
    },
    
    fillForm: function(bed) {
        console.log('Filling form with bed data:', bed);
        
        // Handle different field name cases from API (camelCase vs PascalCase)
        var bedId = bed.id || bed.Id || '';
        var khoaId = bed.khoaId || bed.KhoaId || '';
        var tenGiuong = bed.tenGiuong || bed.TenGiuong || '';
        var loaiGiuong = bed.loaiGiuong || bed.LoaiGiuong || 'Thường';
        var giaTien = bed.giaTien || bed.GiaTien || 0;
        var trangThai = bed.trangThai || bed.TrangThai || 0;
        
        // Convert trangThai to number if string
        if (typeof trangThai === 'string') {
            trangThai = (trangThai === 'Đang sử dụng' || trangThai === '1') ? 1 : 0;
        }
        
        // Show/Hide ID row based on edit mode
        var idRow = document.getElementById('bedIdRow');
        var idDisplay = document.getElementById('bedIdDisplay');
        if (this.isEditing && bedId) {
            if (idRow) idRow.style.display = 'flex';
            if (idDisplay) idDisplay.value = bedId;
        } else {
            if (idRow) idRow.style.display = 'none';
        }
        
        this.setFieldValue('bedKhoaId', khoaId);
        this.setFieldValue('bedTenGiuong', tenGiuong);
        this.setFieldValue('bedLoaiGiuong', loaiGiuong);
        this.setFieldValue('bedGiaTien', giaTien);
        this.setFieldValue('bedTrangThai', trangThai);
    },
    
    setFieldValue: function(fieldId, value) {
        var field = document.getElementById(fieldId);
        if (field && value !== undefined && value !== null) {
            field.value = value;
        }
    },
    
    getFormData: function() {
        // ID có thể nằm ở nhiều field khác nhau tùy API response
        var bedId = null;
        if (this.currentBed) {
            bedId = this.currentBed.id || this.currentBed.Id || this.currentBed.giuongId || this.currentBed.GiuongId;
        }
        console.log('Getting form data, currentBed:', this.currentBed);
        console.log('Extracted ID:', bedId);
        
        return {
            id: bedId,
            khoaId: document.getElementById('bedKhoaId')?.value || '',
            tenGiuong: document.getElementById('bedTenGiuong')?.value || '',
            loaiGiuong: document.getElementById('bedLoaiGiuong')?.value || 'Thường',
            giaTien: document.getElementById('bedGiaTien')?.value || 0,
            trangThai: parseInt(document.getElementById('bedTrangThai')?.value) || 0
        };
    },
    
    validate: function() {
        var data = this.getFormData();
        var errors = [];
        
        if (!data.khoaId) {
            errors.push('Vui lòng chọn khoa phòng');
        }
        if (!data.tenGiuong || data.tenGiuong.trim() === '') {
            errors.push('Vui lòng nhập tên giường');
        }
        if (!data.giaTien || parseFloat(data.giaTien) <= 0) {
            errors.push('Vui lòng nhập giá tiền hợp lệ');
        }
        
        return errors;
    },
    
    showError: function(message) {
        var errorDiv = document.getElementById('bedModalError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    },
    
    clearError: function() {
        var errorDiv = document.getElementById('bedModalError');
        if (errorDiv) {
            errorDiv.textContent = '';
            errorDiv.style.display = 'none';
        }
    },
    
    setInputsDisabled: function(disabled) {
        var inputs = document.querySelectorAll('#bedModalOverlay input, #bedModalOverlay select');
        inputs.forEach(function(input) {
            input.disabled = disabled;
        });
    },
    
    save: function() {
        console.log('BedModal.save called');
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
        if (!scope || !scope.BedService) {
            this.showError('Lỗi hệ thống: Không tìm thấy service');
            return;
        }
        
        // Call API
        var savePromise;
        if (this.isEditing) {
            savePromise = scope.BedService.update(formData);
        } else {
            savePromise = scope.BedService.create(formData);
        }
        
        savePromise.then(function(response) {
            console.log('Save success:', response);
            alert(self.isEditing ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            self.close();
            
            // Reload beds list
            setTimeout(function() {
                var appScope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
                if (appScope && appScope.loadBeds) {
                    if (appScope.$$phase || appScope.$root.$$phase) {
                        appScope.loadBeds();
                    } else {
                        appScope.$apply(function() {
                            appScope.loadBeds();
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
window.BedModal = BedModal;

// Global functions for onclick handlers
function openBedModalJS() {
    // Get departments from scope first
    var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
    var departments = scope ? scope.departments : [];
    BedModal.open(null, departments);
}

function closeBedModalJS() {
    BedModal.close();
}

function saveBedModalJS() {
    BedModal.save();
}
