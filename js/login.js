document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (email === '123@gmail.com' && password === '12345678') {
            window.location.href = 'painel.html';
            return;
        }

        loginError.classList.remove('hidden');
    });
});
