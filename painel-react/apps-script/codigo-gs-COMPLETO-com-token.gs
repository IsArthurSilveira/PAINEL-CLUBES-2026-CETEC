const SHEET_ID = '1K3hdyrBGIsVTI_K1RJXO63qvX6cfIO7vLZf4wU1HL6E'; 

// ========== CONFIGURAÇÃO DE SESSÕES ==========
const SESSION_SHEET_NAME = 'SESSOES';
const SESSION_TTL_HOURS = 8;
const SESSION_SECRET = PropertiesService.getScriptProperties().getProperty('SESSION_SECRET') || 'TROCAR_EM_PRODUCAO';
const AUDIT_SHEET_NAME = 'AUDITORIA';
const DAILY_BACKUP_TRIGGER_HANDLER = 'runDailyBackup';
const DAILY_BACKUP_HOUR = 2;
const BACKUP_RETENTION_DAYS = 30;

function getDataHoraAtual() {
  return Utilities.formatDate(new Date(), "America/Recife", "dd/MM/yyyy HH:mm:ss");
}

function doGet(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const callback = e && e.parameter ? e.parameter.callback : '';
  const resultado = executarAcao(sheet, e.parameter || {});
  return responder(resultado, callback);
}

function doPost(e) {
  const sheet = SpreadsheetApp.openById(SHEET_ID);
  const dadosReq = JSON.parse(e.postData.contents);
  const resultado = executarAcao(sheet, dadosReq);
  return responder(resultado);
}

function executarAcao(sheet, dadosReq) {
  const dataHora = getDataHoraAtual();
  const acao = String(dadosReq.acao || '').trim().toLowerCase();
  let session = null;

  // ========== AUTENTICAÇÃO ==========
  // Tratar ações de autenticação (login, validar_sessao, logout)
  const authResult = handleAuthAction(acao, dadosReq);
  if (authResult !== null) return authResult;

  // Para ações protegidas, validar token
  try {
    session = assertAuthorized(dadosReq);
    if (!hasPermission(session.acesso, acao)) {
      return forbidden_();
    }
  } catch (err) {
    if (err.codigo === 'NAO_AUTORIZADO') {
      return unauthorized_();
    }
    throw err;
  }

  // ========== AÇÕES PROTEGIDAS ==========
  if (acao === 'listar_clubes') {
    return buscarAbaComoObjeto(sheet, 'Clubes');
  }

  if (acao === 'listar_encontros') {
    const idClube = String(dadosReq.id_clube || '').trim();
    const todosEncontros = buscarAbaComoObjeto(sheet, 'Encontros');
    if (!idClube) return todosEncontros;
    return todosEncontros.filter(enc => {
      const idEncontroClube = String(obterCampoPorAlias(enc, ['ID_Clube', 'ID Clube', 'id_clube', 'id clube']) || '').trim();
      return idEncontroClube === idClube;
    });
  }

  if (acao === 'listar_alunos') {
    const idClube = String(dadosReq.id_clube || '').trim();
    const todosAlunos = buscarAbaComoObjeto(sheet, 'Alunos');
    if (!idClube) return todosAlunos;
    return todosAlunos.filter(aluno => {
      const idAlunoClube = String(obterCampoPorAlias(aluno, ['ID_Clube', 'ID Clube', 'id_clube', 'id clube']) || '').trim();
      return idAlunoClube === idClube;
    });
  }
  
  if (acao === 'salvar_clube') {
    const aba = sheet.getSheetByName('Clubes');
    const novoId = Utilities.getUuid();
    aba.appendRow([novoId, dadosReq.nome, dadosReq.escola, dadosReq.utec, dadosReq.prof, dadosReq.estag, dadosReq.dias, dadosReq.horario, dadosReq.categoria, dadosReq.status || 'PENDENTE', dataHora, dataHora]);
    return auditAndReturn_(session, acao, 'CLUBE', novoId, dadosReq, { sucesso: true, id: novoId });
  }

  if (acao === 'atualizar_clube') {
    const aba = sheet.getSheetByName('Clubes');
    const dados = aba.getDataRange().getValues();
    const headers = dados.length ? dados[0] : [];
    const idBusca = String(dadosReq.id_clube || dadosReq.id || '').trim();
    const idxId = findHeaderIndex(headers, ['ID', 'id', 'ID_Clube', 'ID Clube', 'id_clube', 'id clube']);
    const idxNome = findHeaderIndex(headers, ['Nome', 'nome']);
    const idxEscola = findHeaderIndex(headers, ['Escola', 'escola']);
    const idxUtec = findHeaderIndex(headers, ['UTEC', 'utec']);
    const idxProf = findHeaderIndex(headers, ['Prof', 'prof', 'Professor', 'professor']);
    const idxEstag = findHeaderIndex(headers, ['Estag', 'estag', 'Estagiario', 'Estagiário', 'estagiario', 'estagiário']);
    const idxDias = findHeaderIndex(headers, ['Dias', 'dias']);
    const idxHorario = findHeaderIndex(headers, ['Horario', 'Horário', 'horario', 'horário']);
    const idxCategoria = findHeaderIndex(headers, ['Categoria', 'categoria']);
    const idxStatus = findHeaderIndex(headers, ['Status', 'status']);
    const idxAtualizadoEm = findHeaderIndex(headers, ['Atualizado_em', 'Atualizado em', 'updated_at', 'updated at', 'Data_Modificacao', 'Data de Modificação']);

    const idCol = idxId >= 0 ? idxId : 0;

    for (let i = 1; i < dados.length; i++) {
      if (String(dados[i][idCol] || '').trim() !== idBusca) continue;

      if (idxNome >= 0) aba.getRange(i + 1, idxNome + 1).setValue(dadosReq.nome || dados[i][idxNome]);
      if (idxEscola >= 0) aba.getRange(i + 1, idxEscola + 1).setValue(dadosReq.escola || dados[i][idxEscola]);
      if (idxUtec >= 0) aba.getRange(i + 1, idxUtec + 1).setValue(dadosReq.utec || dados[i][idxUtec]);
      if (idxProf >= 0) aba.getRange(i + 1, idxProf + 1).setValue(dadosReq.prof || dados[i][idxProf]);
      if (idxEstag >= 0) aba.getRange(i + 1, idxEstag + 1).setValue(dadosReq.estag || dados[i][idxEstag]);
      if (idxDias >= 0) aba.getRange(i + 1, idxDias + 1).setValue(dadosReq.dias || dados[i][idxDias]);
      if (idxHorario >= 0) aba.getRange(i + 1, idxHorario + 1).setValue(dadosReq.horario || dados[i][idxHorario]);
      if (idxCategoria >= 0) aba.getRange(i + 1, idxCategoria + 1).setValue(dadosReq.categoria || dados[i][idxCategoria]);
      if (idxStatus >= 0 && dadosReq.status) aba.getRange(i + 1, idxStatus + 1).setValue(dadosReq.status);
      if (idxAtualizadoEm >= 0) aba.getRange(i + 1, idxAtualizadoEm + 1).setValue(dataHora);

      return auditAndReturn_(session, acao, 'CLUBE', idBusca, dadosReq, { sucesso: true, id: idBusca });
    }

    return auditAndReturn_(session, acao, 'CLUBE', idBusca, dadosReq, { sucesso: false, codigo: 'NAO_ENCONTRADO', erro: 'Clube não encontrado' });
  }

  if (acao === 'salvar_encontro') {
    const aba = sheet.getSheetByName('Encontros');
    const novoId = Utilities.getUuid();
    aba.appendRow([novoId, dadosReq.id_clube, dadosReq.modulo, dadosReq.assunto, dadosReq.data, 'A FAZER', dataHora, dataHora]);
    return auditAndReturn_(session, acao, 'ENCONTRO', novoId, dadosReq, { sucesso: true, id: novoId });
  }

  if (acao === 'salvar_aluno') {
    const aba = sheet.getSheetByName('Alunos');
    const novoId = Utilities.getUuid();
    aba.appendRow([novoId, dadosReq.id_clube, dadosReq.matricula, dadosReq.nome, dataHora]);
    return auditAndReturn_(session, acao, 'ALUNO', novoId, dadosReq, { sucesso: true, id: novoId });
  }

  if (acao === 'atualizar_status_clube') {
    const aba = sheet.getSheetByName('Clubes');
    const dados = aba.getDataRange().getValues();
    const idBusca = String(dadosReq.id_clube).trim();
    
    for (let i = 1; i < dados.length; i++) {
      if (String(dados[i][0]).trim() === idBusca) {
        aba.getRange(i + 1, 10).setValue(dadosReq.status); // Atualiza o Status
        aba.getRange(i + 1, 12).setValue(dataHora); // Atualiza Data de Modificação
        return auditAndReturn_(session, acao, 'CLUBE', idBusca, dadosReq, { sucesso: true });
      }
    }
    return auditAndReturn_(session, acao, 'CLUBE', idBusca, dadosReq, { sucesso: false, codigo: 'NAO_ENCONTRADO', erro: 'Clube não encontrado' });
  }

  if (acao === 'atualizar_status_encontro') {
    const aba = sheet.getSheetByName('Encontros');
    const dados = aba.getDataRange().getValues();
    const idBusca = String(dadosReq.id_encontro).trim();
    
    for (let i = 1; i < dados.length; i++) {
      if (String(dados[i][0]).trim() === idBusca) {
        aba.getRange(i + 1, 6).setValue(dadosReq.status); // Atualiza o Status
        aba.getRange(i + 1, 8).setValue(dataHora); // Atualiza Data de Modificação
        return auditAndReturn_(session, acao, 'ENCONTRO', idBusca, dadosReq, { sucesso: true });
      }
    }
    return auditAndReturn_(session, acao, 'ENCONTRO', idBusca, dadosReq, { sucesso: false, codigo: 'NAO_ENCONTRADO', erro: 'Encontro não encontrado' });
  }

  if (acao === 'remover_encontro' || acao === 'excluir_encontro') {
    const aba = sheet.getSheetByName('Encontros');
    const dados = aba.getDataRange().getValues();
    const idBusca = String(dadosReq.id_encontro || dadosReq.id || '').trim();
    const headers = dados.length ? dados[0] : [];
    const idxId = findHeaderIndex(headers, ['ID_Encontro', 'ID Encontro', 'id_encontro', 'id encontro', 'ID', 'id']);
    const idCol = idxId >= 0 ? idxId : 0;

    for (let i = 1; i < dados.length; i++) {
      if (String(dados[i][idCol] || '').trim() === idBusca) {
        aba.deleteRow(i + 1);
        return auditAndReturn_(session, acao, 'ENCONTRO', idBusca, dadosReq, { sucesso: true });
      }
    }

    return auditAndReturn_(session, acao, 'ENCONTRO', idBusca, dadosReq, { sucesso: false, codigo: 'NAO_ENCONTRADO', erro: 'Encontro não encontrado' });
  }

  if (acao === 'remover_aluno' || acao === 'excluir_aluno') {
    const aba = sheet.getSheetByName('Alunos');
    const dados = aba.getDataRange().getValues();
    const idBusca = String(dadosReq.id_aluno || dadosReq.idAluno || dadosReq.id || '').trim();
    const headers = dados.length ? dados[0] : [];
    const idxId = findHeaderIndex(headers, ['ID_Aluno', 'ID Aluno', 'id_aluno', 'id aluno', 'ID', 'id']);
    const idxIdClube = findHeaderIndex(headers, ['ID_Clube', 'ID Clube', 'id_clube', 'id clube']);
    const idxMatricula = findHeaderIndex(headers, ['Matricula', 'Matrícula', 'matricula']);
    const idxNome = findHeaderIndex(headers, ['Nome', 'nome']);
    const idCol = idxId >= 0 ? idxId : 0;
    const idClubeCol = idxIdClube >= 0 ? idxIdClube : 1;
    const matriculaCol = idxMatricula >= 0 ? idxMatricula : 2;
    const nomeCol = idxNome >= 0 ? idxNome : 3;

    for (let i = 1; i < dados.length; i++) {
      if (idBusca && String(dados[i][idCol] || '').trim() === idBusca) {
        aba.deleteRow(i + 1);
        return auditAndReturn_(session, acao, 'ALUNO', idBusca, dadosReq, { sucesso: true });
      }
    }

    // Fallback para planilhas antigas sem ID consistente no frontend:
    // tenta remover por chave composta (id_clube + matricula + nome).
    const idClubeBusca = String(dadosReq.id_clube || '').trim();
    const matriculaBusca = String(dadosReq.matricula || '').trim();
    const nomeBusca = String(dadosReq.nome || '').trim().toUpperCase();

    if (idClubeBusca && (matriculaBusca || nomeBusca)) {
      for (let i = 1; i < dados.length; i++) {
        const idClubeLinha = String(dados[i][idClubeCol] || '').trim();
        const matriculaLinha = String(dados[i][matriculaCol] || '').trim();
        const nomeLinha = String(dados[i][nomeCol] || '').trim().toUpperCase();

        const clubeOk = idClubeLinha === idClubeBusca;
        const matriculaOk = matriculaBusca ? matriculaLinha === matriculaBusca : true;
        const nomeOk = nomeBusca ? nomeLinha === nomeBusca : true;

        if (clubeOk && matriculaOk && nomeOk) {
          aba.deleteRow(i + 1);
          return auditAndReturn_(session, acao, 'ALUNO', idBusca || (idClubeBusca + '|' + matriculaBusca + '|' + nomeBusca), dadosReq, { sucesso: true });
        }
      }
    }

    return auditAndReturn_(session, acao, 'ALUNO', idBusca || (idClubeBusca + '|' + matriculaBusca + '|' + nomeBusca), dadosReq, { sucesso: false, codigo: 'NAO_ENCONTRADO', erro: 'Aluno não encontrado' });
  }

  return { sucesso: false, codigo: 'ACAO_INVALIDA', erro: 'Ação inválida' };
}

function responder(objeto, callback) {
  const callbackSeguro = sanitizarCallback(callback);
  if (callbackSeguro) {
    return ContentService
      .createTextOutput(callbackSeguro + '(' + JSON.stringify(objeto) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

function buscarAbaComoObjeto(sheet, nomeAba) {
  const aba = sheet.getSheetByName(nomeAba);
  const dados = aba.getDataRange().getValues();
  if (dados.length <= 1) return []; 
  const cabecalhos = dados.shift(); 
  return dados.map(linha => {
    let obj = {};
    cabecalhos.forEach((cabecalho, index) => { obj[cabecalho] = linha[index]; });
    return obj;
  });
}

function obterCampoPorAlias(objeto, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    const alias = aliases[i];
    if (Object.prototype.hasOwnProperty.call(objeto, alias)) {
      return objeto[alias];
    }
  }

  const normalizado = {};
  Object.keys(objeto).forEach(chave => {
    normalizado[normalizarChave(chave)] = objeto[chave];
  });

  for (let i = 0; i < aliases.length; i++) {
    const valor = normalizado[normalizarChave(aliases[i])];
    if (valor !== undefined) return valor;
  }

  return undefined;
}

function normalizarChave(valor) {
  return String(valor || '').toLowerCase().replace(/[\s_\-]/g, '');
}

function findHeaderIndex(headers, aliases) {
  if (!Array.isArray(headers) || headers.length === 0) return -1;

  const normalizedAliases = aliases.map(normalizarChave);
  for (let i = 0; i < headers.length; i++) {
    const key = normalizarChave(headers[i]);
    if (normalizedAliases.includes(key)) return i;
  }

  return -1;
}

function sanitizarCallback(callback) {
  const valor = String(callback || '').trim();
  if (!valor) return '';
  if (/^[a-zA-Z_$][0-9a-zA-Z_$\.]*$/.test(valor)) return valor;
  return '';
}

function setupOperationalGuards() {
  ensureDailyBackupTrigger_();
  return { sucesso: true, mensagem: 'Backup diário configurado.' };
}

function runDailyBackup() {
  const now = new Date();
  const tz = Session.getScriptTimeZone() || 'America/Recife';
  const timestamp = Utilities.formatDate(now, tz, 'yyyyMMdd_HHmmss');
  const sourceFile = DriveApp.getFileById(SHEET_ID);
  const backupName = sourceFile.getName() + ' - backup_' + timestamp;

  const backupFolderId = PropertiesService.getScriptProperties().getProperty('BACKUP_FOLDER_ID') || '';
  if (backupFolderId) {
    const folder = DriveApp.getFolderById(backupFolderId);
    sourceFile.makeCopy(backupName, folder);
  } else {
    sourceFile.makeCopy(backupName);
  }

  pruneOldBackups_();
}

function ensureDailyBackupTrigger_() {
  const triggers = ScriptApp.getProjectTriggers();
  const exists = triggers.some(t => t.getHandlerFunction && t.getHandlerFunction() === DAILY_BACKUP_TRIGGER_HANDLER);
  if (exists) return;

  ScriptApp.newTrigger(DAILY_BACKUP_TRIGGER_HANDLER)
    .timeBased()
    .everyDays(1)
    .atHour(DAILY_BACKUP_HOUR)
    .create();
}

function pruneOldBackups_() {
  const backupFolderId = PropertiesService.getScriptProperties().getProperty('BACKUP_FOLDER_ID') || '';
  if (!backupFolderId) return;

  const folder = DriveApp.getFolderById(backupFolderId);
  const files = folder.getFiles();
  const sourceName = DriveApp.getFileById(SHEET_ID).getName();
  const threshold = Date.now() - (BACKUP_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  while (files.hasNext()) {
    const file = files.next();
    const name = String(file.getName() || '');
    if (!name.startsWith(sourceName + ' - backup_')) continue;
    if (file.getDateCreated().getTime() < threshold) {
      file.setTrashed(true);
    }
  }
}

function getOrCreateAuditSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let auditSheet = ss.getSheetByName(AUDIT_SHEET_NAME);
  if (!auditSheet) {
    auditSheet = ss.insertSheet(AUDIT_SHEET_NAME);
    auditSheet.appendRow([
      'data_hora',
      'acao',
      'entidade',
      'entidade_id',
      'sucesso',
      'codigo',
      'usuario_id',
      'usuario_nome',
      'usuario_acesso',
      'payload',
    ]);
  }
  return auditSheet;
}

function sanitizePayloadForAudit_(payload) {
  const input = payload && typeof payload === 'object' ? payload : {};
  const out = {};
  Object.keys(input).forEach((key) => {
    const lower = String(key || '').toLowerCase();
    if (lower === 'senha' || lower === 'token' || lower === 'authtoken') return;
    out[key] = input[key];
  });
  return out;
}

function writeAuditEvent_(session, acao, entidade, entidadeId, payload, response) {
  try {
    const sheet = getOrCreateAuditSheet_();
    const success = !!(response && (response.sucesso === true || response.SUCESSO === true));
    const code = response && (response.codigo || response.erro || response.mensagem || response.message) || '';
    const safePayload = sanitizePayloadForAudit_(payload);
    sheet.appendRow([
      new Date().toISOString(),
      acao,
      entidade,
      entidadeId || '',
      success,
      String(code || ''),
      toText(session && session.usuarioId || ''),
      toText(session && session.nome || ''),
      toText(session && session.acesso || ''),
      JSON.stringify(safePayload),
    ]);
  } catch (err) {
    console.error('Falha ao registrar auditoria:', err);
  }
}

function auditAndReturn_(session, acao, entidade, entidadeId, payload, response) {
  writeAuditEvent_(session, acao, entidade, entidadeId, payload, response);
  return response;
}

// ========== AUTENTICAÇÃO POR TOKEN ==========

function handleAuthAction(acao, payload) {
  if (acao === 'login') return loginWithToken(payload);
  if (acao === 'validar_sessao') return validateCurrentSession(payload);
  if (acao === 'logout') return logoutSession(payload);
  return null;
}

function loginWithToken(payload) {
  const email = toText(payload.email).toLowerCase().trim();
  const senha = toText(payload.senha).trim();

  // DEBUG: Log do que estamos recebendo
  console.log('[LOGIN DEBUG] Email recebido:', email);
  console.log('[LOGIN DEBUG] Senha recebida:', senha);

  const usuario = findUserByCredentials(email, senha);
  
  // DEBUG: Log do resultado da busca
  console.log('[LOGIN DEBUG] Usuario encontrado:', usuario);
  
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
    toText(usuario.acesso || 'usuario'),
  ]);

  return {
    sucesso: true,
    nome: toText(usuario.nome || 'USUARIO'),
    acesso: toText(usuario.acesso || 'usuario'),
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
    acesso: session.acesso,
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
      acesso: normalizarNivelAcesso(data[i][6] || encontrarAcessoUsuario_(toText(data[i][1])) || 'usuario'),
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

function forbidden_() {
  return {
    sucesso: false,
    codigo: 'SEM_PERMISSAO',
    mensagem: 'Você não tem permissão para esta ação.',
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

function normalizarNivelAcesso(valor) {
  const texto = toText(valor).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (texto.includes('admin')) return 'administrador';
  if (texto.includes('leit') || texto.includes('read') || texto.includes('view')) return 'leitor';
  if (texto.includes('usu') || texto.includes('user')) return 'usuario';
  if (!texto) return 'usuario';
  return texto;
}

function hasPermission(acesso, acao) {
  const nivel = normalizarNivelAcesso(acesso);
  if (nivel === 'administrador') return true;

  const leitura = ['listar_clubes', 'listar_encontros', 'listar_alunos', 'validar_sessao'];
  if (leitura.includes(acao)) return true;

  if (nivel === 'usuario') {
    return ['salvar_clube', 'salvar_encontro', 'salvar_aluno'].includes(acao);
  }

  return false;
}

function encontrarAcessoUsuario_(email) {
  const usuario = findUserByEmail(email);
  return usuario ? usuario.acesso : '';
}

function getOrCreateSessionSheet_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SESSION_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SESSION_SHEET_NAME);
    sheet.appendRow(['token_hash', 'usuario_id', 'nome', 'created_at', 'expires_at', 'revoked_at', 'acesso']);
  }
  return sheet;
}

function findUserByCredentials(email, senha) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName('Usuarios') || ss.getSheetByName('USUARIOS');
  if (!usersSheet) {
    console.log('[USUARIO DEBUG] Sheet "Usuarios" não encontrada');
    return null;
  }

  const rows = usersSheet.getDataRange().getValues();
  console.log('[USUARIO DEBUG] Total de linhas lidas:', rows.length);

  const headers = rows.length ? rows[0] : [];
  const idxEmail = findHeaderIndex(headers, ['EMAIL', 'E-MAIL', 'email', 'e-mail']);
  const idxSenha = findHeaderIndex(headers, ['SENHA', 'senha', 'PASSWORD', 'password']);
  const idxNome = findHeaderIndex(headers, ['NOME', 'nome', 'USUARIO', 'usuário', 'USUARIO_NOME']);
  const idxAcesso = findHeaderIndex(headers, ['ACESSO', 'acesso', 'PERFIL', 'perfil', 'ROLE', 'role']);

  for (var i = 1; i < rows.length; i += 1) {
    const rowEmail = toText(rows[i][idxEmail >= 0 ? idxEmail : 0]).toLowerCase().trim();
    const rowSenha = toText(rows[i][idxSenha >= 0 ? idxSenha : 1]).trim();
    const rowNome = toText(rows[i][idxNome >= 0 ? idxNome : 2]);
    const rowAcesso = normalizarNivelAcesso(rows[i][idxAcesso >= 0 ? idxAcesso : 3]);

    console.log(`[USUARIO DEBUG] Linha ${i}: email="${rowEmail}", senha="${rowSenha}", nome="${rowNome}", acesso="${rowAcesso}"`);
    console.log(`[USUARIO DEBUG] Comparação: ${rowEmail} === ${email} && ${rowSenha} === ${senha}`);

    if (rowEmail === email && rowSenha === senha) {
      console.log('[USUARIO DEBUG] ✅ USUARIO ENCONTRADO!');
      return {
        id: email,
        nome: rowNome || 'USUARIO',
        email: rowEmail,
        acesso: rowAcesso,
      };
    }
  }

  console.log('[USUARIO DEBUG] ❌ Nenhum usuario encontrado com essas credenciais');
  return null;
}

function findUserByEmail(email) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const usersSheet = ss.getSheetByName('Usuarios') || ss.getSheetByName('USUARIOS');
  if (!usersSheet) return null;

  const rows = usersSheet.getDataRange().getValues();
  const headers = rows.length ? rows[0] : [];
  const idxEmail = findHeaderIndex(headers, ['EMAIL', 'E-MAIL', 'email', 'e-mail']);
  const idxNome = findHeaderIndex(headers, ['NOME', 'nome', 'USUARIO', 'usuário', 'USUARIO_NOME']);
  const idxAcesso = findHeaderIndex(headers, ['ACESSO', 'acesso', 'PERFIL', 'perfil', 'ROLE', 'role']);

  for (var i = 1; i < rows.length; i += 1) {
    const rowEmail = toText(rows[i][idxEmail >= 0 ? idxEmail : 0]).toLowerCase().trim();
    if (rowEmail !== toText(email).toLowerCase().trim()) continue;

    return {
      id: rowEmail,
      nome: toText(rows[i][idxNome >= 0 ? idxNome : 2]) || 'USUARIO',
      email: rowEmail,
      acesso: normalizarNivelAcesso(rows[i][idxAcesso >= 0 ? idxAcesso : 3]),
    };
  }

  return null;
}
