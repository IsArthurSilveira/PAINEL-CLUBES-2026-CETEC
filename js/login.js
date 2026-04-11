const API_URL = 'https://script.google.com/macros/s/AKfycbwDWyu-3ChcUMAXjdgNV1raEQ9idC7W5mcS2RJASQVwOMp57CeuOSzE9bh7tekheDW8Yg/exec';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const btnSubmit = loginForm ? loginForm.querySelector('button[type="submit"]') : null;

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const textoOriginal = btnSubmit.innerText;
        btnSubmit.innerText = 'A CARREGAR...';
        btnSubmit.disabled = true;
        loginError.classList.add('hidden');

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    acao: 'login',
                    email: email,
                    senha: password
                })
            });
            
            const data = await response.json();
            
            if (data.sucesso) {
                localStorage.setItem('usuarioLogado', data.nome);
                window.location.href = 'painel.html';
            } else {
                loginError.innerText = 'Credenciais incorretas.';
                loginError.classList.remove('hidden');
            }
        } catch (erro) {
            console.error('Erro de ligação:', erro);
            loginError.innerText = 'Erro ao ligar ao servidor.';
            loginError.classList.remove('hidden');
        } finally {
            btnSubmit.innerText = textoOriginal;
            btnSubmit.disabled = false;
        }
    });
});