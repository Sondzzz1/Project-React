/* ============================
   MEDICAL RECORD MODAL - medicalrecord.modal.js
   Modal for viewing/editing Medical Records in official format (MS: 52/BV2)
   =============================== */

var MedicalRecordModal = {
    isOpen: false,
    mode: 'create', // create | edit | detail
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
        
        var overlay = document.getElementById('medicalRecordModalOverlay');
        if (overlay) overlay.style.display = 'flex';
        
        var title = document.getElementById('medicalRecordModalTitle');
        if (title) {
            if (mode === 'edit') title.textContent = 'Cập nhật Hồ sơ Bệnh án';
            else if (mode === 'detail') title.textContent = 'Chi tiết Hồ sơ Bệnh án';
            else title.textContent = 'Lập Hồ sơ Bệnh án Mới';
        }

        this.loadInpatients();
        this.renderDoctors();
        
        if ((mode === 'edit' || mode === 'detail') && data) {
            this.fillForm(data);
        } else {
            this.clearForm();
        }
        
        // Hide save button in detail mode
        var saveBtn = document.getElementById('medicalRecordSaveBtn');
        if (saveBtn) saveBtn.style.display = (mode === 'detail') ? 'none' : '';
        
        // Make fields readonly in detail mode
        this.setReadonly(mode === 'detail');
        
        this.clearError();
        
        // Show/Hide Discharge button
        var dischargeBtn = document.getElementById('medicalRecordDischargeBtn');
        if (dischargeBtn) {
            var isDischarged = false;
            if (data && data.trangThaiNhapVien) {
                var status = (data.trangThaiNhapVien || '').toLowerCase();
                isDischarged = status.includes('xuatvien') || status.includes('xuất viện');
            }
            // Show if not discharged and viewing/editing existing record AND has nhapVienId
            if (!isDischarged && (mode === 'edit' || mode === 'detail') && data.nhapVienId) {
                dischargeBtn.style.display = 'inline-block';
            } else {
                dischargeBtn.style.display = 'none';
            }
        }
    },
    
    openDetail: function(record) {
        this.open('detail', record, [], null);
    },

    close: function() {
        this.isOpen = false;
        var overlay = document.getElementById('medicalRecordModalOverlay');
        if (overlay) overlay.style.display = 'none';
        this.currentData = null;
    },

    loadInpatients: function() {
        var self = this;
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        
        if (scope && scope.AdmissionService) {
            scope.AdmissionService.getInpatientList().then(function(data) {
                var list = Array.isArray(data) ? data : (data.data || []);
                self.inpatients = list;
                self.renderInpatientSelect();
                
                if ((self.mode === 'edit' || self.mode === 'detail') && self.currentData) {
                    document.getElementById('mrPatientSelect').value = self.currentData.nhapVienId || '';
                }
            });
        }
    },

    renderInpatientSelect: function() {
        var self = this;
        var select = document.getElementById('mrPatientSelect');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Chọn Bệnh nhân đang nằm viện --</option>';
        this.inpatients.forEach(function(item) {
            var opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = item.tenBenhNhan + ' - ' + (item.tenGiuong || '') + ' (' + (item.tenKhoa || '') + ')';
            select.appendChild(opt);
        });

        // Handle selection change to populate details
        select.onchange = function() {
            var val = this.value;
            if (!val) {
                self.setValue('mrDisplayTenBenhNhan', '');
                self.setValue('mrDisplayNgaySinh', '');
                return;
            }
            
            var selected = self.inpatients.find(function(p) { return p.id == val; });
            if (selected) {
                // Populate Name
                self.setValue('mrDisplayTenBenhNhan', selected.tenBenhNhan);
                
                // Populate DOB - Try to find in global patient list
                var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
                if (scope && scope.patients) {
                    var patient = scope.patients.find(function(p) { 
                        return (p.maBenhNhan || p.id) == selected.benhNhanId; 
                    });
                    
                    if (patient && patient.ngaySinh) {
                         var d = new Date(patient.ngaySinh);
                         self.setValue('mrDisplayNgaySinh', d.toLocaleDateString('vi-VN'));
                    } else {
                        self.setValue('mrDisplayNgaySinh', '');
                    }
                }
            }
        };
    },

    renderDoctors: function() {
        var select = document.getElementById('mrDoctorSelect');
        if (!select) return;
        select.innerHTML = '<option value="">-- Chọn Bác sĩ phụ trách --</option>';
        
        this.doctors.forEach(function(doc) {
            var opt = document.createElement('option');
            opt.value = doc.id;
            opt.textContent = doc.hoTen + (doc.chuyenKhoa ? ' - ' + doc.chuyenKhoa : '');
            select.appendChild(opt);
        });
    },

    fillForm: function(data) {
        this.setValue('mrPatientSelect', data.nhapVienId);
        this.setValue('mrDoctorSelect', data.bacSiPhuTrachId);
        this.setValue('mrTienSuBenh', data.tienSuBenh);
        this.setValue('mrChanDoanBanDau', data.chanDoanBanDau);
        this.setValue('mrChanDoanRaVien', data.chanDoanRaVien);
        this.setValue('mrPhuongAnDieuTri', data.phuongAnDieuTri);
        this.setValue('mrKetQuaDieuTri', data.ketQuaDieuTri);
        
        // Display patient info if available
        if (data.tenBenhNhan) {
            this.setValue('mrDisplayTenBenhNhan', data.tenBenhNhan);
        }
        if (data.ngaySinhBenhNhan) {
            var d = new Date(data.ngaySinhBenhNhan);
            this.setValue('mrDisplayNgaySinh', d.toLocaleDateString('vi-VN'));
        }
    },

    clearForm: function() {
        this.setValue('mrPatientSelect', '');
        this.setValue('mrDoctorSelect', '');
        this.setValue('mrTienSuBenh', '');
        this.setValue('mrChanDoanBanDau', '');
        this.setValue('mrChanDoanRaVien', '');
        this.setValue('mrPhuongAnDieuTri', '');
        this.setValue('mrKetQuaDieuTri', '');
        this.setValue('mrDisplayTenBenhNhan', '');
        this.setValue('mrDisplayNgaySinh', '');
    },

    setValue: function(id, val) {
        var el = document.getElementById(id);
        if (el) {
            if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
                el.value = val || '';
            } else {
                el.textContent = val || '';
            }
        }
    },
    
    getValue: function(id) {
        var el = document.getElementById(id);
        return el ? el.value : null;
    },
    
    setReadonly: function(readonly) {
        var fields = ['mrPatientSelect', 'mrDoctorSelect', 'mrTienSuBenh', 'mrChanDoanBanDau', 
                      'mrChanDoanRaVien', 'mrPhuongAnDieuTri', 'mrKetQuaDieuTri'];
        fields.forEach(function(id) {
            var el = document.getElementById(id);
            if (el) {
                el.disabled = readonly;
            }
        });
    },

    showError: function(msg) {
        var el = document.getElementById('medicalRecordModalError');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    },
    
    clearError: function() {
        var el = document.getElementById('medicalRecordModalError');
        if (el) {
            el.style.display = 'none';
        }
    },

    save: function() {
        var self = this;
        var nhapVienId = this.getValue('mrPatientSelect');
        var bacSiId = this.getValue('mrDoctorSelect');
        var tienSuBenh = this.getValue('mrTienSuBenh');
        var chanDoanBanDau = this.getValue('mrChanDoanBanDau');
        var chanDoanRaVien = this.getValue('mrChanDoanRaVien');
        var phuongAnDieuTri = this.getValue('mrPhuongAnDieuTri');
        var ketQuaDieuTri = this.getValue('mrKetQuaDieuTri');

        if (!nhapVienId || !bacSiId) {
            this.showError('Vui lòng chọn Bệnh nhân và Bác sĩ phụ trách.');
            return;
        }

        var payload = {
            nhapVienId: nhapVienId,
            bacSiPhuTrachId: bacSiId,
            tienSuBenh: tienSuBenh,
            chanDoanBanDau: chanDoanBanDau,
            chanDoanRaVien: chanDoanRaVien,
            phuongAnDieuTri: phuongAnDieuTri,
            ketQuaDieuTri: ketQuaDieuTri
        };

        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        var service = scope.MedicalRecordService;

        var promise;
        if (this.mode === 'create') {
            promise = service.create(payload);
        } else {
            promise = service.update(this.currentData.id, payload);
        }

        promise.then(function(res) {
            alert('Lưu hồ sơ bệnh án thành công!');
            self.close();
            if (self.onSaveCallback) self.onSaveCallback();
        }).catch(function(err) {
            console.error('Medical Record Save Error:', err);
            self.showError(err.data?.message || 'Có lỗi xảy ra khi lưu.');
        });
    },
    
    // Print the medical record in official format
    print: function() {
        var printWindow = window.open('', '_blank');
        var data = this.currentData || {};
        
        var html = this.generatePrintHTML(data);
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    },
    
    generatePrintHTML: function(data) {
        var today = new Date().toLocaleDateString('vi-VN');
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Hồ sơ Bệnh án - ${data.tenBenhNhan || ''}</title>
    <style>
        body { font-family: 'Times New Roman', serif; font-size: 13px; line-height: 1.6; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h3 { margin: 5px 0; font-size: 14px; }
        .header h2 { margin: 10px 0; font-size: 16px; font-weight: bold; }
        .form-code { position: absolute; right: 40px; top: 20px; font-size: 12px; }
        .section { margin-bottom: 15px; }
        .section-title { font-weight: bold; margin-bottom: 10px; }
        .row { display: flex; margin-bottom: 8px; }
        .field { flex: 1; }
        .field label { display: inline-block; min-width: 120px; }
        .field-value { border-bottom: 1px dotted #000; display: inline-block; min-width: 150px; padding: 0 5px; }
        .full-width { width: 100%; }
        .textarea-field { border: 1px solid #000; min-height: 60px; padding: 5px; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="form-code">MS: 52/BV2</div>
    
    <div class="header">
        <h3>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h3>
        <p>Độc lập - Tự do - Hạnh phúc</p>
        <h2>BẢN TÓM TẮT HỒ SƠ BỆNH ÁN</h2>
    </div>
    
    <div class="section">
        <div class="section-title">I. HÀNH CHÍNH</div>
        <div class="row">
            <div class="field">
                <label>Họ và tên:</label>
                <span class="field-value">${data.tenBenhNhan || ''}</span>
            </div>
            <div class="field">
                <label>Ngày sinh:</label>
                <span class="field-value">${data.ngaySinhBenhNhan ? new Date(data.ngaySinhBenhNhan).toLocaleDateString('vi-VN') : ''}</span>
            </div>
        </div>
        <div class="row">
            <div class="field">
                <label>Giới tính:</label>
                <span class="field-value">${data.gioiTinh || ''}</span>
            </div>
            <div class="field">
                <label>Số thẻ BHYT:</label>
                <span class="field-value">${data.soTheBaoHiem || ''}</span>
            </div>
        </div>
        <div class="row">
            <div class="field full-width">
                <label>Địa chỉ:</label>
                <span class="field-value" style="min-width: 400px;">${data.diaChi || ''}</span>
            </div>
        </div>
        <div class="row">
            <div class="field">
                <label>Vào viện ngày:</label>
                <span class="field-value">${data.ngayNhap ? new Date(data.ngayNhap).toLocaleDateString('vi-VN') : ''}</span>
            </div>
            <div class="field">
                <label>Ra viện ngày:</label>
                <span class="field-value">${data.ngayXuat ? new Date(data.ngayXuat).toLocaleDateString('vi-VN') : ''}</span>
            </div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">II. CHẨN ĐOÁN</div>
        <div class="row">
            <div class="field full-width">
                <label>Chẩn đoán vào viện:</label>
                <div class="textarea-field">${data.chanDoanBanDau || ''}</div>
            </div>
        </div>
        <div class="row">
            <div class="field full-width">
                <label>Chẩn đoán ra viện:</label>
                <div class="textarea-field">${data.chanDoanRaVien || ''}</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">III. TÓM TẮT QUÁ TRÌNH ĐIỀU TRỊ</div>
        <div class="row">
            <div class="field full-width">
                <label>Tiền sử bệnh:</label>
                <div class="textarea-field">${data.tienSuBenh || ''}</div>
            </div>
        </div>
        <div class="row">
            <div class="field full-width">
                <label>Phương án điều trị:</label>
                <div class="textarea-field">${data.phuongAnDieuTri || ''}</div>
            </div>
        </div>
        <div class="row">
            <div class="field full-width">
                <label>Kết quả điều trị:</label>
                <div class="textarea-field">${data.ketQuaDieuTri || ''}</div>
            </div>
        </div>
    </div>
    
    <div style="margin-top: 40px; text-align: right; padding-right: 40px;">
        <p>Ngày ${today}</p>
        <p><strong>Bác sĩ điều trị</strong></p>
        <p style="margin-top: 60px;">............................</p>
    </div>
</body>
</html>
        `;
    },

    discharge: function() {
        var self = this;
        // If create mode, get from select. If edit/detail, get from currentData
        var nhapVienId = (this.mode === 'create') ? this.getValue('mrPatientSelect') : this.currentData.nhapVienId;
        
        if (!nhapVienId) {
            this.showError('Không tìm thấy thông tin nhập viện.');
            return;
        }
        
        // Open billing modal for payment first
        // After payment complete, the callback will execute actual discharge
        if (window.BillingModal) {
            window.BillingModal.open(nhapVienId, function() {
                // Payment completed - now perform actual discharge
                self.performActualDischarge(nhapVienId);
            });
        } else {
            // Fallback if billing modal not available
            if (confirm('Không thể mở thanh toán. Bạn có muốn xuất viện không thanh toán?')) {
                this.performActualDischarge(nhapVienId);
            }
        }
    },
    
    // Actual discharge logic - called after payment
    performActualDischarge: function(nhapVienId) {
        var self = this;
        
        var scope = angular.element(document.querySelector('[ng-controller="AdminController"]')).scope();
        if (!scope || !scope.AdmissionService) {
            this.showError('Lỗi: Không tìm thấy AdmissionService');
            return;
        }
        
        var payload = {
            id: nhapVienId,
            ngayXuat: new Date(),
            chanDoanXuatVien: this.getValue('mrChanDoanRaVien'),
            loiDanBacSi: this.getValue('mrPhuongAnDieuTri'),
            ghiChu: this.getValue('mrKetQuaDieuTri')
        };
        
        console.log('Discharge Payload:', payload);
        
        scope.AdmissionService.discharge(payload)
            .then(function(res) {
                alert('Xuất viện thành công!');
                self.close();
                // Reload records
                 var mrScope = angular.element(document.querySelector('[ng-controller="MedicalRecordController"]')).scope();
                if (mrScope) mrScope.refreshRecords();
                 
                 // Refresh Bed List if finding scope
                 if (scope.loadBeds) {
                     scope.loadBeds();
                 }
            })
            .catch(function(err) {
                 console.error('Discharge Error Response:', err);
                 var msg = (err.data && err.data.message) ? err.data.message : 'Có lỗi khi xuất viện.';
                 alert('LỖI XUẤT VIỆN:\n' + msg);
                 self.showError(msg);
            });
    }
};

window.MedicalRecordModal = MedicalRecordModal;

function closeMedicalRecordModalJS() { MedicalRecordModal.close(); }
function saveMedicalRecordModalJS() { MedicalRecordModal.save(); }
function printMedicalRecordJS() { MedicalRecordModal.print(); }
function dischargeMedicalRecordJS() { MedicalRecordModal.discharge(); }
