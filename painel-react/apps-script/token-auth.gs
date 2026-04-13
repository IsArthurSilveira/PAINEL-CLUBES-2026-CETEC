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
  if (acao === 'login') return null;

  const session = getValidSessionFromPayload_(payload);
  if (!session) {
    throw new Error('NAO_AUTORIZADO');
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SESSION_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SESSION_SHEET_NAME);
    sheet.appendRow(['token_hash', 'usuario_id', 'nome', 'created_at', 'expires_at', 'revoked_at']);
  }
  return sheet;
}

// Substitua por sua fonte de usuarios. A senha deve estar hasheada no mundo ideal.
function findUserByCredentials(email, senha) {
  const usersSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('USUARIOS');
  if (!usersSheet) return null;

  const rows = usersSheet.getDataRange().getValues();
  // Colunas esperadas: A=id, B=nome, C=email, D=senha
  for (var i = 1; i < rows.length; i += 1) {
    const rowEmail = toText(rows[i][2]).toLowerCase();
    const rowSenha = toText(rows[i][3]);

    if (rowEmail === email && rowSenha === senha) {
      return {
        id: rows[i][0],
        nome: rows[i][1],
        email: rowEmail,
      };
    }
  }

  return null;
}

/*
Como integrar no seu doGet/doPost:

1) No inicio do fluxo, trate a acao de auth:
   const authResult = handleAuthAction(acao, payload);
   if (authResult) return json(authResult);

2) Para demais acoes, exija autenticacao:
   try {
     const session = assertAuthorized(payload);
   } catch (err) {
     if (String(err.message) === 'NAO_AUTORIZADO') {
       return json(unauthorized_());
     }
     throw err;
   }

3) Em todo retorno de erro de auth, mantenha codigo = NAO_AUTORIZADO.
*/
