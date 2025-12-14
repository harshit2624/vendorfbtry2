document.getElementById('login-button').addEventListener('click', () => {
    const storeCode = document.getElementById('store-code-input').value;
    if (storeCode) {
        localStorage.setItem('storeCode', storeCode);
        window.location.href = 'dashboard.html';
    } else {
        alert('Please enter a store code.');
    }
});
