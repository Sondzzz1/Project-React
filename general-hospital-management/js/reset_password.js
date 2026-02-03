document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const token = urlParams.get('token');
    
    if (username) {
        document.getElementById('username').value = username;
    }
    if (token) {
        document.getElementById('token').value = token;
    }
});

function handleResetPassword(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const token = document.getElementById('token').value;
    const newPassword = document.getElementById('newPassword').value;
    
    const btn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const messageArea = document.getElementById('messageArea');
    
    // Reset UI
    btn.disabled = true;
    btnText.textContent = 'Đang xử lý...';
    messageArea.style.display = 'none';
    messageArea.textContent = '';
    messageArea.className = 'form-group'; // reset classes

    // API URL
    const API_URL = 'http://localhost:5076/gateway/api/auth/reset-password';

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            tenDangNhap: username,
            resetToken: token,
            matKhauMoi: newPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        messageArea.style.display = 'block';
        if (data.success) {
            messageArea.style.backgroundColor = '#dff0d8';
            messageArea.style.color = '#3c763d';
            messageArea.style.border = '1px solid #d6e9c6';
            messageArea.innerHTML = 'Đổi mật khẩu thành công! Chuyển hướng về trang đăng nhập...';
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = './login.html';
            }, 2000);
        } else {
            throw new Error(data.message || 'Có lỗi xảy ra');
        }
    })
    .catch(error => {
        messageArea.style.display = 'block';
        messageArea.style.backgroundColor = '#f2dede';
        messageArea.style.color = '#a94442';
        messageArea.style.border = '1px solid #ebccd1';
        messageArea.textContent = error.message;
        
        btn.disabled = false;
        btnText.textContent = 'Đổi mật khẩu';
    })
    .finally(() => {
        // Do not re-enable button immediately on success to prevent double submit during redirect
        // On error, it's re-enabled in catch block
    });
}
