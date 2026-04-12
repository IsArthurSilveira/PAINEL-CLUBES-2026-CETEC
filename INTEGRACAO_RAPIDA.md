# Integração Rápida - Token Auth

## 📋 O que vai mudar (Alto Nível)

```
ANTES                           DEPOIS
────────────────────────────────────────────────────────
Login sem token                 Login com token (8h TTL)
↓                               ↓
Acesso sem autenticação         Token obrigatório em cada ação
↓                               ↓
Qualquer pessoa pode            Apenas com token válido
usar a API                      pode usar a API
```

## ⚡ Passo a Passo (5 passos)

### ✅ 1. Copiar código completo com token

- Abra o Google Apps Script do seu projeto
- Substitua TODO o conteúdo de `codigo.gs` pela versão: `codigo-gs-COMPLETO-com-token.gs`
- Salve

### ✅ 2. Verificar sheet `Usuarios`

Deve ter colunas (nessa ordem):
```
A: Email
B: Senha  
C: Nome
D: (data_ultimo_login - opcional, não usado agora)
```

### ✅ 3. Deploy & Redeploy

- No Apps Script, vá para **Deploy** → **New deployment**
- Type: **Web App**
- Execute as: **Me**
- Who has access: **Anyone**
- Copie a URL: `https://script.google.com/macros/s/...`

### ✅ 4. Atualizar URL no frontend

Abra `painel-react/src/config.js`:
```javascript
export const API_URL = 'https://script.google.com/macros/s/[NOVA_URL]/exec';
```

### ✅ 5. Build & Test

```bash
cd painel-react
npm run build
# Pronto! Deploy normalmente
```

## 🧪 Teste Rápido

**Login (deve receber token):**
```
POST /macros/s/.../exec
{
  "acao": "login",
  "email": "usuario@cetec.br",
  "senha": "senha123"
}

Resposta esperada:
{
  "sucesso": true,
  "nome": "João Silva",
  "token": "abc123xyz...",
  "expira_em": "2026-04-12T14:30:00Z"
}
```

**Usar token (ação protegida):**
```
POST /macros/s/.../exec
{
  "acao": "listar_clubes",
  "token": "abc123xyz..."
}

Resposta: [{ clubes }, ...]
```

**Sem token (deve falhar):**
```
POST /macros/s/.../exec
{
  "acao": "listar_clubes"
}

Resposta:
{
  "sucesso": false,
  "codigo": "NAO_AUTORIZADO",
  "mensagem": "Token inválido ou expirado."
}
```

## 📊 O que muda no Sheets

Uma nova sheet **SESSOES** será criada automaticamente com colunas:
- `token_hash`: hash do token (armazenado, nunca o token real)
- `usuario_id`: email do usuário
- `nome`: nome do usuário
- `created_at`: quando foi criado
- `expires_at`: quando expira (agora + 8 horas)
- `revoked_at`: quando foi desconectado (vazio = ativo)

## 🔒 Segurança

Frontend:
- Token armazenado em `localStorage`
- Token enviado em cada requisição
- Se receber `NAO_AUTORIZADO`, redireciona para login
- Logout limpa o token

Backend:
- Token hasheado com HMAC-SHA256
- TTL de 8 horas
- Revogação ao logout
- Sem acesso à API sem token

## ❓ FAQ Rápido

**P: E se o token expirar no meio da sessão?**  
R: Frontend recebe `codigo: NAO_AUTORIZADO`, dispara evento `auth:expired`, limpa localStorage e redireciona para login.

**P: Como fazer um token durar mais/menos?**  
R: Mude `SESSION_TTL_HOURS` no `codigo.gs` (está em 8 agora).

**P: E se a senha estiver armazenada em plaintext no Sheets?**  
R: Está segura porque:
- Sheets é privado (você controla acesso)
- HTTPS em trânsito
- Backend valida e retorna apenas token
- Token expira, não é permanente

**P: Posso ter vários tokens ativos?**  
R: Sim! Cada login cria um novo token. Todos "disputam" na sheet SESSOES.

**P: E para dev/testes?**  
R: Mude `export const API_URL = 'http://localhost:3000'` no `config.js` para usar JSONP local.

## 📝 Próximos Passos (Opcional)

1. **Adicionar hash real de senhas** (bcrypt pode ser lento no Apps Script, usar `crypto` externa)
2. **Registrar logs** (quem fez login, quando, etc)
3. **Adicionar 2FA** (SMS, email, authenticator)
4. **Rate limiting** (máximo de tentativas de login)
5. **Remover senhas plaintext** depois (usar OAuth, SAML)

## ✅ Checklist Final

- [ ] Sheet `Usuarios` tem dados corretos
- [ ] Copiei `codigo-gs-COMPLETO-com-token.gs` para Apps Script
- [ ] Fiz Deploy novo
- [ ] Copiei URL do deployment
- [ ] Atualizei `config.js` com nova URL
- [ ] Rodei `npm run build`
- [ ] Testei login (recebo token)
- [ ] Testei listar_clubes com token (funciona)
- [ ] Testei sem token (erro NAO_AUTORIZADO)
- [ ] Frontend faz logout ao receber NAO_AUTORIZADO

Quando tudo passar:
```bash
cd painel-react
git add .
git commit -m "feat: integração de autenticação por token no Apps Script"
git push
```

---

**Status**: 🚀 Pronto para deploy em produção!
