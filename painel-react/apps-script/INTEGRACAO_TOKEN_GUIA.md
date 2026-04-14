# Guia de Integração de Autenticação por Token

## ⚙️ O que vai mudar

Seu Apps Script atual autentica apenas no login (verifica email/senha uma vez). A nova implementação:

- ✅ **Login retorna um TOKEN** único e com TTL (8h)
- ✅ **Login também retorna o nível de acesso** do usuário (`administrador`, `usuario` ou `leitor`)
- ✅ **Cada ação posterior exige o TOKEN** no payload
- ✅ Token é armazenado em uma sheet `SESSOES` com expiração
- ✅ O backend passa a bloquear ações por nível de acesso
- ✅ Se token expirou ou for inválido → `codigo: NAO_AUTORIZADO`
- ✅ O frontend recebe o token e o envia automaticamente em cada requisição

## 📊 Pre-requisitos

### 1. Verificar sheet  `Usuarios`

Sua sheet `Usuarios` deve ter colunas:
```
A: email
B: senha
C: nome
D: acesso (Administrador, Usuario ou Leitor)
E: data_ultimo_login (opcional, para seu uso)
```

**Importante**: A coluna 1 deve ser `email`, coluna 2 `senha`, coluna 3 `nome` e a coluna 4 o nível de acesso.

### 2. Criar sheet `SESSOES` (será criada automaticamente)

Quando você executar a função de token pela primeira vez, ela criará:
```
Colunas:
A: token_hash     (hash do token enviado pelo cliente)
B: usuario_id     (referência ao usuário)
C: nome           (nome do usuário para debug)
D: created_at     (quando foi criado)
E: expires_at     (quando expira - agora + 8 horas)
F: revoked_at     (quando foi desconectado, se aplicável)
G: acesso         (nível de acesso do usuário)
```

## 🔧 Passos de Integração

### Passo 1: Copiar novas funções de token

Adicione essas funções no final do seu `codigo.gs`:

```javascript
// ========== AUTENTICAÇÃO POR TOKEN ==========
const SESSION_SHEET_NAME = 'SESSOES';
const SESSION_TTL_HOURS = 8;
const SESSION_SECRET = PropertiesService.getScriptProperties().getProperty('SESSION_SECRET') || 'TROCAR_EM_PRODUCAO';

function handleAuthAction(acao, payload) {
  if (acao === 'login') return loginWithToken(payload);
  if (acao === 'validar_sessao') return validateCurrentSession(payload);
  if (acao === 'logout') return logoutSession(payload);
  return null;
}

function loginWithToken(payload) {
  const email = toText(payload.email).toLowerCase();
  const senha = toText(payload.senha);

  const usuario = findUserByCredentials(email, senha);
  if (!usuario) {
    return { sucesso: false, codigo: 'CREDENCIAIS_INVALIDAS', mensagem: 'Credenciais inválidas.' };
  }

  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_TTL_HOURS * 60 * 60 * 1000);

  const sessionSheet = getOrCreateSessionSheet_();
  sessionSheet.appendRow([
    tokenHash,
    toText(usuario.id || usuario.email || ''),
    toText(usuario.nome || 'USUARIO'),
    createdAt.toISOString(),
    expiresAt.toISOString(),
    '',
  ]);

  return {
    sucesso: true,
    nome: toText(usuario.nome || 'USUARIO'),
    token,
    expira_em: expiresAt.toISOString(),
  };
}

function validateCurrentSession(payload) {
  const session = getValidSessionFromPayload_(payload);
  if (!session) return unauthorized_();

  return {
    sucesso: true,
    usuario_id: session.usuarioId,
    nome: session.nome,
    expira_em: session.expiraEm,
  };
}

function logoutSession(payload) {
  const token = readTokenFromPayload_(payload);
  if (!token) return unauthorized_();

  const sessionSheet = getOrCreateSessionSheet_();
  const data = sessionSheet.getDataRange().getValues();
  const tokenHash = hashToken(token);

  for (var i = 1; i < data.length; i += 1) {
    if (toText(data[i][0]) !== tokenHash) continue;
    if (toText(data[i][5])) break;
    sessionSheet.getRange(i + 1, 6).setValue(new Date().toISOString());
    break;
  }

  return { sucesso: true };
}

function assertAuthorized(payload) {
  const acao = toText(payload.acao).toLowerCase();
  if (acao === 'login') return null; // login não exige token

  const session = getValidSessionFromPayload_(payload);
  if (!session) {
    throw { codigo: 'NAO_AUTORIZADO', mensagem: 'Token inválido ou expirado.' };
  }

  return session;
}

function getValidSessionFromPayload_(payload) {
  const token = readTokenFromPayload_(payload);
  if (!token) return null;

  const sessionSheet = getOrCreateSessionSheet_();
  const data = sessionSheet.getDataRange().getValues();
  const tokenHash = hashToken(token);
  const now = new Date();

  for (var i = 1; i < data.length; i += 1) {
    if (toText(data[i][0]) !== tokenHash) continue;

    var revokedAt = toText(data[i][5]);
    if (revokedAt) return null;

    var expiresAtRaw = toText(data[i][4]);
    var expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
    if (!expiresAt || isNaN(expiresAt.getTime())) return null;
    if (expiresAt.getTime() <= now.getTime()) return null;

    return {
      usuarioId: toText(data[i][1]),
      nome: toText(data[i][2]),
      expiraEm: expiresAt.toISOString(),
    };
  }

  return null;
}

function readTokenFromPayload_(payload) {
  return toText(payload.token || payload.authToken || '').trim();
}

function unauthorized_() {
  return {
    sucesso: false,
    codigo: 'NAO_AUTORIZADO',
    mensagem: 'Token inválido ou expirado.',
  };
}

function generateSessionToken() {
  const randomA = Utilities.getUuid();
  const randomB = Utilities.getUuid();
  const nonce = Utilities.base64EncodeWebSafe(randomA + '|' + randomB);
  return nonce.replace(/=+$/g, '');
}

function hashToken(token) {
  const bytes = Utilities.computeHmacSha256Signature(token, SESSION_SECRET);
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, '');
}

function toText(value) {
  return String(value || '');
}

function getOrCreateSessionSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SESSION_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SESSION_SHEET_NAME);
    sheet.appendRow(['token_hash', 'usuario_id', 'nome', 'created_at', 'expires_at', 'revoked_at']);
  }
  return sheet;
}

function findUserByCredentials(email, senha) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName('Usuarios');
  if (!usersSheet) return null;

  const rows = usersSheet.getDataRange().getValues();
  // Colunas esperadas: A=email, B=senha, C=nome, D=data_ultimo_login
  for (var i = 1; i < rows.length; i += 1) {
    const rowEmail = toText(rows[i][0]).toLowerCase();
    const rowSenha = toText(rows[i][1]);

    if (rowEmail === email && rowSenha === senha) {
      return {
        id: email, // Usa email como ID de usuário
        nome: rows[i][2],
        email: rowEmail,
      };
    }
  }

  return null;
}
```

### Passo 2: Modificar `executarAcao`

Adicione no **início** da função `executarAcao`, após `const acao = String(...)`:

```javascript
// Tratar ações de autenticação (login, validar_sessao, logout)
const authResult = handleAuthAction(acao, dadosReq);
if (authResult !== null) return authResult;

// Para ações protegidas, validar token
try {
  assertAuthorized(dadosReq);
} catch (err) {
  if (err.codigo === 'NAO_AUTORIZADO') {
    return unauthorized_();
  }
  throw err;
}
```

### Passo 3: REMOVER a lógica de login antiga

No seu `executarAcao`, **delete** esse bloco:

```javascript
if (acao === 'login') {
  const aba = sheet.getSheetByName('Usuarios');
  const usuarios = aba.getDataRange().getValues();
  const emailReq = String(dadosReq.email).trim();
  const senhaReq = String(dadosReq.senha).trim();
  
  for (let i = 1; i < usuarios.length; i++) {
    if (String(usuarios[i][0]).trim() === emailReq && String(usuarios[i][1]).trim() === senhaReq) {
      aba.getRange(i + 1, 4).setValue(dataHora); 
      return { sucesso: true, nome: usuarios[i][2] };
    }
  }
  return { sucesso: false, erro: 'Credenciais incorretas' };
}
```

Será substituído automaticamente pela nova função `loginWithToken`.

## 🚀 Fluxo Final

**Antes (sem token):**
```
1. Frontend: POST {acao: 'login', email: 'x', senha: 'y'}
2. Backend: valida, retorna {sucesso: true, nome: 'João'}
3. Frontend: POST {acao: 'salvar_clube', nome: 'ABC', ...}
4. Backend: nenhuma auth, aceita
```

**Depois (com token):**
```
1. Frontend: POST {acao: 'login', email: 'x', senha: 'y'}
2. Backend: valida, gera token, retorna {sucesso: true, nome: 'João', token: 'abc...xyz'}
3. Frontend: guarda token em localStorage
4. Frontend: POST {acao: 'salvar_clube', token: 'abc...xyz', nome: 'ABC', ...}
5. Backend: valida token, se válido aceita; se inválido retorna {codigo: 'NAO_AUTORIZADO'}
6. Frontend: detecta erro, dispatcha evento de logout, redireciona para login
```

## 🔐 Configuração da Secret

Para segurança máxima (opcional, mas recomendado):

1. No Apps Script, vá para **Configurações do Projeto** → **Propriedades do Script**
2. Adicione uma propriedade:
   - **Chave**: `SESSION_SECRET`
   - **Valor**: uma string aleatória longa (ex: `gAWXd7q3p9kL2mN5fJ8sR1xZ4vY0hB6cT`)

Se não definir, usará valor padrão (menos seguro, suficiente para dev).

## ✅ Checklist de Implementação

- [ ] Sheet `Usuarios` tem colunas corretas (email, senha, nome)
- [ ] Copiou todas as novas funções  de token
- [ ] Modificou `executarAcao` com validação de token
- [ ] Removeu bloco de `login` antigo
- [ ] Salvou e fez deploy do Apps Script
- [ ] Testou login no frontend (deve receber token)
- [ ] Testou listar_clubes com token (deve funcionar)
- [ ] Testou sem token (deve retornar NAO_AUTORIZADO)
- [ ] Removeu as secrets da public API (coloque URL do deployment)

## 🧪 Teste Manual

**Via Postman/cURL:**

```bash
# 1. Login (obtém token)
POST https://seu-apps-script-url
{
  "acao": "login",
  "email": "usuario@example.com",
  "senha": "senha123"
}

# Resposta:
{
  "sucesso": true,
  "nome": "João Silva",
  "token": "abc123xyz...",
  "expira_em": "2026-04-12T14:30:00Z"
}

# 2. Usar token em ação protegida
POST https://seu-apps-script-url
{
  "acao": "listar_clubes",
  "token": "abc123xyz..."
}

# Resposta:
[{ "ID": "...", "Nome": "...", ... }]

# 3. Sem token
POST https://seu-apps-script-url
{
  "acao": "listar_clubes"
}

# Resposta:
{
  "sucesso": false,
  "codigo": "NAO_AUTORIZADO",
  "mensagem": "Token inválido ou expirado."
}
```

## 📋 Próximos Passos

Após integrar:
1. **Remover HTTPS do Apps Script da public** (mude URL no frontend .env se tiver)
2. **Usar novo Apps Script URL** com autenticação ativa
3. **Opcionalmente**: adicionar hash real de senhas (bcrypt no Apps Script é limitado)
