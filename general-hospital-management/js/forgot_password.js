function handleForgotPassword(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
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
    const API_URL = 'http://localhost:5076/gateway/api/auth/forgot-password';

    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tenDangNhap: username })
    })
    .then(response => response.json())
    .then(data => {
        messageArea.style.display = 'block';
        if (data.success) {
            messageArea.style.backgroundColor = '#dff0d8';
            messageArea.style.color = '#3c763d';
            messageArea.style.border = '1px solid #d6e9c6';
            
            // Generate link with query params
            const resetUrl = `reset_password.html?username=${encodeURIComponent(username)}&token=${encodeURIComponent(data.resetToken)}`;
            
            let msg = data.message;
            if (data.resetToken) {
                msg += `<br><br><strong>Mã Token của bạn:</strong> ${data.resetToken}`;
                msg += `<br><br><a href="${resetUrl}" class="btn-login" style="text-decoration:none; display:inline-block; width:auto; padding: 5px 15px; margin-top:5px;">Đặt lại mật khẩu ngay</a>`;
            }
            messageArea.innerHTML = msg;
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
    })
    .finally(() => {
        btn.disabled = false;
        btnText.textContent = 'Gửi yêu cầu';
    });
}
