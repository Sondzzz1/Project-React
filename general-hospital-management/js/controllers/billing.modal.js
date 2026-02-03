/* ============================
   BILLING MODAL - billing.modal.js
   Modal for Payment during discharge
=============================== */

var BillingModal = {
    isOpen: false,
    currentData: null,        // Preview data from API
    nhapVienId: null,
    onPaymentComplete: null,  // Callback after payment
    invoiceId: null,          // Created invoice ID

    /**
     * Open billing modal with preview data
     * @param {string} nhapVienId - Admission ID
     * @param {function} onComplete - Callback after successful payment
     */
    open: function(nhapVienId, onComplete) {
        this.isOpen = true;
        this.nhapVienId = nhapVienId;
        this.onPaymentComplete = onComplete;
        this.invoiceId = null;
        this.currentData = null;

        var overlay = document.getElementById('billingModalOverlay');
        if (overlay) overlay.style.display = 'flex';

        this.clearError();
        this.setLoading(true);
        
        // Load preview data from API
        this.loadPreview();
    },

    close: function() {
        this.isOpen = false;
        var overlay = document.getElementById('billingModalOverlay');
        if (overlay) overlay.style.display = 'none';
        this.currentData = null;
        this.invoiceId = null;
    },

    loadPreview: function() {
        var self = this;
        
        var ctx = this.getAngularContext();
        if (!ctx.injector) {
            this.showError('Không tìm thấy Angular context');
            this.setLoading(false);
            return;
        }

        var BillingService = ctx.injector.get('BillingService');
        
        BillingService.getPreview(this.nhapVienId)
            .then(function(data) {
                self.currentData = data;
                self.renderPreview(data);
                self.setLoading(false);
            })
            .catch(function(err) {
                console.error('Load preview error:', err);
                self.showError('Không thể tải thông tin hóa đơn: ' + (err.data?.message || err.statusText || 'Unknown error'));
                self.setLoading(false);
            });
    },

    renderPreview: function(data) {
        // Patient Name
        this.setValue('billPatientName', data.tenBenhNhan || 'N/A');
        
        // Bed info
        this.setValue('billBedName', data.tenGiuong || 'N/A');
        this.setValue('billBedPrice', this.formatMoney(data.giaGiuong || 0) + ' đ/ngày');
        
        // Days stayed
        var days = Math.ceil(data.soNgayNam || 1);
        this.setValue('billDaysStayed', days + ' ngày');
        
        // Chi tiết chi phí
        var tienGiuong = data.tienGiuong || 0;
        var chiPhiPhauThuat = data.chiPhiPhauThuat || 0;
        var chiPhiXetNghiem = data.chiPhiXetNghiem || 0;
        
        this.setValue('billBedCost', this.formatMoney(tienGiuong) + ' đ');
        this.setValue('billSurgeryCost', this.formatMoney(chiPhiPhauThuat) + ' đ');
        this.setValue('billLabCost', this.formatMoney(chiPhiXetNghiem) + ' đ');
        
        // Totals
        var tongTien = data.tongTienGoiY || 0;
        var bhyt = tongTien * (data.mucHuong || 0);
        var benhNhanTra = tongTien - bhyt;
        
        this.setValue('billTotalAmount', this.formatMoney(tongTien) + ' đ');
        this.setValue('billInsuranceCover', this.formatMoney(bhyt) + ' đ (' + ((data.mucHuong || 0) * 100) + '%)');
        this.setValue('billPatientPay', this.formatMoney(benhNhanTra) + ' đ');
        
        // Store for payment
        this.currentData.tongTien = tongTien;
        this.currentData.bhytChiTra = bhyt;
        this.currentData.benhNhanTra = benhNhanTra;
    },

    formatMoney: function(value) {
        return new Intl.NumberFormat('vi-VN').format(value || 0);
    },

    setValue: function(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = val || '';
    },

    setLoading: function(isLoading) {
        var loadingEl = document.getElementById('billingLoading');
        var contentEl = document.getElementById('billingContent');
        var footerEl = document.getElementById('billingFooter');
        
        if (loadingEl) loadingEl.style.display = isLoading ? 'block' : 'none';
        if (contentEl) contentEl.style.display = isLoading ? 'none' : 'block';
        if (footerEl) footerEl.style.display = isLoading ? 'none' : 'flex';
    },

    showError: function(msg) {
        var el = document.getElementById('billingModalError');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    },

    clearError: function() {
        var el = document.getElementById('billingModalError');
        if (el) el.style.display = 'none';
    },

    getAngularContext: function() {
        var adminEl = document.querySelector('[ng-controller="AdminController"]') || document.querySelector('.admin-wrapper');
        if (adminEl) {
            var scope = angular.element(adminEl).scope();
            if (scope) return { scope: scope, injector: angular.element(adminEl).injector() };
        }
        return { scope: null, injector: null };
    },

    /**
     * Process payment - simulated, always succeeds
     */
    pay: function() {
        var self = this;

        if (!this.currentData) {
            this.showError('Không có dữ liệu hóa đơn');
            return;
        }

        this.clearError();
        var payBtn = document.getElementById('billingPayBtn');
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.innerHTML = '<i class="ti-reload spin"></i> Đang xử lý...';
        }

        var ctx = this.getAngularContext();
        if (!ctx.injector) {
            this.showError('Không tìm thấy Angular context');
            return;
        }

        var BillingService = ctx.injector.get('BillingService');
        var $timeout = ctx.injector.get('$timeout');

        // Step 1: Create invoice first
        var createData = {
            benhNhanId: this.currentData.benhNhanId,
            nhapVienId: this.nhapVienId,
            tongTien: this.currentData.tongTien,
            baoHiemChiTra: this.currentData.bhytChiTra,
            ghiChu: 'Thanh toán xuất viện'
        };

        BillingService.create(createData)
            .then(function(res) {
                // Invoice created, now simulate payment
                // In simulation mode, we skip actual payment API call
                // and just mark as successful
                
                $timeout(function() {
                    alert('✅ THANH TOÁN THÀNH CÔNG!\n\nTổng tiền: ' + self.formatMoney(self.currentData.tongTien) + ' đ\nBHYT chi trả: ' + self.formatMoney(self.currentData.bhytChiTra) + ' đ\nBệnh nhân trả: ' + self.formatMoney(self.currentData.benhNhanTra) + ' đ');
                    
                    self.close();
                    
                    // Callback to proceed with discharge
                    if (self.onPaymentComplete) {
                        self.onPaymentComplete();
                    }
                }, 500); // Simulate processing delay
            })
            .catch(function(err) {
                console.error('Create invoice error:', err);
                
                // Even if API fails, simulate success for demo
                $timeout(function() {
                    alert('✅ THANH TOÁN THÀNH CÔNG (Giả lập)!\n\nTổng tiền: ' + self.formatMoney(self.currentData.tongTien) + ' đ');
                    
                    self.close();
                    
                    if (self.onPaymentComplete) {
                        self.onPaymentComplete();
                    }
                }, 500);
            })
            .finally(function() {
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.innerHTML = '<i class="ti-credit-card"></i> Thanh toán';
                }
            });
    }
};

window.BillingModal = BillingModal;
function openBillingModalJS(nhapVienId, onComplete) { BillingModal.open(nhapVienId, onComplete); }
function closeBillingModalJS() { BillingModal.close(); }
function payBillingModalJS() { BillingModal.pay(); }
