// Register Page JavaScript

// Password strength checker
function checkPasswordStrength(password) {
  const strengthBar = document.getElementById('strengthFill');
  const strengthText = document.getElementById('strengthText');
  const strengthContainer = document.getElementById('passwordStrength');
  
  if (!password) {
    strengthContainer.classList.remove('show');
    return;
  }
  
  strengthContainer.classList.add('show');
  
  let strength = 0;
  let feedback = '';
  
  // Length check
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // Character variety checks
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  
  // Determine strength level
  if (strength <= 2) {
    strengthBar.className = 'strength-fill weak';
    strengthText.textContent = 'Mật khẩu yếu';
    strengthText.style.color = '#f44336';
  } else if (strength <= 4) {
    strengthBar.className = 'strength-fill medium';
    strengthText.textContent = 'Mật khẩu trung bình';
    strengthText.style.color = '#ff9800';
  } else {
    strengthBar.className = 'strength-fill strong';
    strengthText.textContent = 'Mật khẩu mạnh';
    strengthText.style.color = '#4caf50';
  }
}

// Toggle password visibility
function togglePassword(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  const toggleIcon = document.getElementById(
    fieldId === 'password' ? 'togglePasswordIcon' : 'toggleConfirmPasswordIcon'
  );
  
  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.classList.remove('ti-eye');
    toggleIcon.classList.add('ti-eye-close');
  } else {
    passwordInput.type = 'password';
    toggleIcon.classList.remove('ti-eye-close');
    toggleIcon.classList.add('ti-eye');
  }
}

// Show error message
function showError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    
    // Add error class to input
    const input = document.getElementById(fieldId);
    if (input) {
      input.style.borderColor = '#f44336';
    }
  }
}

// Hide error message
function hideError(fieldId) {
  const errorElement = document.getElementById(fieldId + 'Error');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    
    // Remove error class from input
    const input = document.getElementById(fieldId);
    if (input) {
      input.style.borderColor = '';
    }
  }
}

// Validate form fields
function validateField(fieldId, value) {
  switch (fieldId) {
    case 'fullName':
      if (!value.trim()) {
        showError('fullName', 'Vui lòng nhập họ và tên');
        return false;
      }
      if (value.trim().length < 3) {
        showError('fullName', 'Họ và tên phải có ít nhất 3 ký tự');
        return false;
      }
      hideError('fullName');
      return true;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value.trim()) {
        showError('email', 'Vui lòng nhập email');
        return false;
      }
      if (!emailRegex.test(value)) {
        showError('email', 'Email không hợp lệ');
        return false;
      }
      hideError('email');
      return true;
      
    case 'phone':
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!value.trim()) {
        showError('phone', 'Vui lòng nhập số điện thoại');
        return false;
      }
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        showError('phone', 'Số điện thoại phải có 10-11 chữ số');
        return false;
      }
      hideError('phone');
      return true;
      
    case 'birthday':
      if (!value) {
        showError('birthday', 'Vui lòng chọn ngày sinh');
        return false;
      }
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 1 || age > 120) {
        showError('birthday', 'Ngày sinh không hợp lệ');
        return false;
      }
      hideError('birthday');
      return true;
      
    case 'gender':
      if (!value) {
        showError('gender', 'Vui lòng chọn giới tính');
        return false;
      }
      hideError('gender');
      return true;
      
    case 'role':
      if (!value) {
        showError('role', 'Vui lòng chọn vai trò');
        return false;
      }
      hideError('role');
      return true;
      
    case 'password':
      if (!value) {
        showError('password', 'Vui lòng nhập mật khẩu');
        return false;
      }
      if (value.length < 8) {
        showError('password', 'Mật khẩu phải có ít nhất 8 ký tự');
        return false;
      }
      hideError('password');
      return true;
      
    case 'confirmPassword':
      const password = document.getElementById('password').value;
      if (!value) {
        showError('confirmPassword', 'Vui lòng xác nhận mật khẩu');
        return false;
      }
      if (value !== password) {
        showError('confirmPassword', 'Mật khẩu xác nhận không khớp');
        return false;
      }
      hideError('confirmPassword');
      return true;
      
    default:
      return true;
  }
}

// Handle form submission
function handleRegister(event) {
  event.preventDefault();
  
  // Get form values
  const formData = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    birthday: document.getElementById('birthday').value,
    gender: document.getElementById('gender').value,
    role: document.getElementById('role').value,
    password: document.getElementById('password').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    agreeTerms: document.getElementById('agreeTerms').checked
  };
  
  // Validate all fields
  let isValid = true;
  
  isValid = validateField('fullName', formData.fullName) && isValid;
  isValid = validateField('email', formData.email) && isValid;
  isValid = validateField('phone', formData.phone) && isValid;
  isValid = validateField('birthday', formData.birthday) && isValid;
  isValid = validateField('gender', formData.gender) && isValid;
  isValid = validateField('role', formData.role) && isValid;
  isValid = validateField('password', formData.password) && isValid;
  isValid = validateField('confirmPassword', formData.confirmPassword) && isValid;
  
  // Check terms agreement
  if (!formData.agreeTerms) {
    showError('terms', 'Vui lòng đồng ý với điều khoản sử dụng');
    isValid = false;
  } else {
    hideError('terms');
  }
  
  if (!isValid) {
    // Scroll to first error
    const firstError = document.querySelector('.error-message.show');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }
  
  // Disable button and show loading
  const registerBtn = document.getElementById('registerBtn');
  const registerBtnText = document.getElementById('registerBtnText');
  const registerIcon = document.getElementById('registerIcon');
  
  registerBtn.disabled = true;
  registerBtnText.textContent = 'Đang xử lý...';
  registerIcon.classList.remove('ti-check');
  registerIcon.classList.add('ti-reload');
  registerIcon.style.animation = 'spin 1s linear infinite';
  
  // Simulate API call
  // API Call
  // API Call
  // Role mapping: Frontend (English) -> Backend (Vietnamese/PascalCase)
  // Backend Roles: Admin, BacSi, YTa, KeToan, BenhNhan
  const roleMapping = {
      'patient': 'BenhNhan',
      'doctor': 'BacSi',
      'nurse': 'YTa',
      'caregiver': 'YTa', // Mapping caregiver to YTa for now as there is no specific 'DieuDuong' role in backend yet
      'accountant': 'KeToan'
  };

  const backendRole = roleMapping[formData.role] || formData.role;

  const API_URL = 'http://localhost:5076/gateway/api/auth/register';
  
  const payload = {
      tenDangNhap: formData.email, // Using email as username
      matKhau: formData.password,
      vaiTro: backendRole
  };

  fetch(API_URL, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
  })
  .then(response => response.json())
  .then(data => {
      if (data.success) {
        // Show success message
        registerBtnText.textContent = 'Đăng ký thành công!';
        registerIcon.classList.remove('ti-reload');
        registerIcon.classList.add('ti-check');
        registerIcon.style.animation = '';
        registerBtn.classList.add('success-animation');
        registerBtn.style.background = 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)';
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          alert('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
          window.location.href = './login.html';
        }, 2000);
      } else {
        throw new Error(data.message || 'Đăng ký thất bại');
      }
  })
  .catch(error => {
      // Show error
      alert(error.message);
      registerBtn.disabled = false;
      registerBtnText.textContent = 'Đăng ký';
      registerIcon.classList.remove('ti-reload');
      registerIcon.classList.add('ti-check');
      registerIcon.style.animation = '';
  });
}

// Real-time validation
document.addEventListener('DOMContentLoaded', function() {
  // Full name validation
  const fullNameInput = document.getElementById('fullName');
  if (fullNameInput) {
    fullNameInput.addEventListener('blur', function() {
      validateField('fullName', this.value);
    });
    
    fullNameInput.addEventListener('input', function() {
      if (this.value.trim()) {
        hideError('fullName');
      }
    });
  }
  
  // Email validation
  const emailInput = document.getElementById('email');
  if (emailInput) {
    emailInput.addEventListener('blur', function() {
      validateField('email', this.value);
    });
    
    emailInput.addEventListener('input', function() {
      if (this.value.trim()) {
        hideError('email');
      }
    });
  }
  
  // Phone validation
  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('blur', function() {
      validateField('phone', this.value);
    });
    
    phoneInput.addEventListener('input', function() {
      // Remove non-numeric characters
      this.value = this.value.replace(/\D/g, '');
      if (this.value.trim()) {
        hideError('phone');
      }
    });
  }
  
  // Birthday validation
  const birthdayInput = document.getElementById('birthday');
  if (birthdayInput) {
    birthdayInput.addEventListener('change', function() {
      validateField('birthday', this.value);
    });
  }
  
  // Gender validation
  const genderSelect = document.getElementById('gender');
  if (genderSelect) {
    genderSelect.addEventListener('change', function() {
      validateField('gender', this.value);
    });
  }
  
  // Role validation
  const roleSelect = document.getElementById('role');
  if (roleSelect) {
    roleSelect.addEventListener('change', function() {
      validateField('role', this.value);
    });
  }
  
  // Password validation
  const passwordInput = document.getElementById('password');
  if (passwordInput) {
    passwordInput.addEventListener('input', function() {
      checkPasswordStrength(this.value);
      validateField('password', this.value);
      
      // Re-validate confirm password if it has value
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (confirmPassword) {
        validateField('confirmPassword', confirmPassword);
      }
    });
    
    passwordInput.addEventListener('blur', function() {
      validateField('password', this.value);
    });
  }
  
  // Confirm password validation
  const confirmPasswordInput = document.getElementById('confirmPassword');
  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function() {
      validateField('confirmPassword', this.value);
    });
    
    confirmPasswordInput.addEventListener('blur', function() {
      validateField('confirmPassword', this.value);
    });
  }
  
  // Terms checkbox validation
  const agreeTermsCheckbox = document.getElementById('agreeTerms');
  if (agreeTermsCheckbox) {
    agreeTermsCheckbox.addEventListener('change', function() {
      if (this.checked) {
        hideError('terms');
      } else {
        showError('terms', 'Vui lòng đồng ý với điều khoản sử dụng');
      }
    });
  }
  
  // Add smooth scroll behavior
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
  
  // Add animation on scroll for benefit items
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
      }
    });
  }, observerOptions);
  
  const benefitItems = document.querySelectorAll('.benefit-item');
  benefitItems.forEach(item => {
    observer.observe(item);
  });
});

// Add CSS for spin animation
// Add CSS for spin animation
const spinStyle = document.createElement('style');
spinStyle.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(spinStyle);

