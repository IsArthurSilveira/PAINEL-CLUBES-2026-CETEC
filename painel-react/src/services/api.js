import { API_URL, IS_LOCALHOST } from '../config';

export const TOKEN_STORAGE_KEY = 'painel_token_sessao';
export const AUTH_EXPIRED_EVENT = 'auth:expired';

const PUBLIC_ACTIONS = new Set(['login']);

export class AuthError extends Error {
  constructor(message = 'Sessao expirada ou invalida.') {
    super(message);
    this.name = 'AuthError';
  }
}

export function getSessionToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setSessionToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Ignora falha de storage em ambientes restritos.
  }
}

export function clearSessionToken() {
  setSessionToken('');
}

export async function validateSession() {
  try {
    const data = await apiPost({ acao: 'validar_sessao' });
    return data?.sucesso ? data : null;
  } catch {
    return null;
  }
}

export async function logoutSession() {
  try {
    await apiPost({ acao: 'logout' });
  } catch {
    // Se falhar no backend, ainda limpamos no frontend.
  } finally {
    clearSessionToken();
  }
}

export async function apiGet(params) {
  if (IS_LOCALHOST) {
    return jsonpRequest(params);
  }

  const action = String(params?.acao || '').toLowerCase();
  const requestParams = transformSheetRequest(appendAuthToken(params, action));
  const url = `${API_URL}?${new URLSearchParams(requestParams).toString()}`;
  const response = await fetch(url);
  const result = transformSheetResponse(await response.json(), requestParams?.acao);
  assertAuthorized(result, requestParams?.token);
  return result;
}

export async function apiPost(payload) {
  if (IS_LOCALHOST) {
    return jsonpRequest(payload);
  }

  const action = String(payload?.acao || '').toLowerCase();
  const requestPayload = action === 'login'
    ? payload
    : transformSheetRequest(appendAuthToken(payload, action));

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(requestPayload),
  });

  const result = transformApiResponse(await response.json(), action);
  assertAuthorized(result, requestPayload?.token);
  return result;
}

function jsonpRequest(params) {
  return new Promise((resolve, reject) => {
    const initialAction = String(params?.acao || '').toLowerCase();
    const requestParams = transformSheetRequest(appendAuthToken(params, initialAction));
    const requestToken = requestParams?.token;
    const action = String(requestParams?.acao || '').toLowerCase();
    const callbackName = `jsonp_cb_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const query = new URLSearchParams({ ...requestParams, callback: callbackName }).toString();
    const script = document.createElement('script');
    let settled = false;

    const timeout = setTimeout(() => {
      settled = true;
      // Mantém callback no-op para respostas tardias não gerarem ReferenceError no console.
      window[callbackName] = () => {};
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('Tempo de resposta excedido no JSONP.'));
    }, 30000);

    function cleanupSuccess() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (data) => {
      if (settled) return;
      settled = true;
      cleanupSuccess();
      try {
        const result = transformApiResponse(data, action);
        assertAuthorized(result, requestToken);
        resolve(result);
      } catch (err) {
        reject(err);
      }
    };

    script.onerror = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      window[callbackName] = () => {};
      if (script.parentNode) script.parentNode.removeChild(script);
      reject(new Error('Falha no carregamento JSONP.'));
    };

    script.src = `${API_URL}?${query}`;
    document.head.appendChild(script);
  });
}

function transformSheetRequest(value) {
  return transformDeep(value, (key, currentValue) => {
    if (typeof currentValue !== 'string') return currentValue;
    if (key === 'acao' || key === 'callback' || key === 'token' || isIdField(key)) return currentValue;
    return currentValue.toUpperCase();
  });
}

function transformSheetResponse(value, action = '') {
  const normalizedAction = String(action || '').toLowerCase();
  if (normalizedAction === 'login') return value;

  return transformDeep(value, (_, currentValue) => {
    if (typeof currentValue !== 'string') return currentValue;
    if (isIdField(_)) return currentValue;
    return currentValue.toUpperCase();
  });
}

function transformApiResponse(value, action = '') {
  const normalizedAction = String(action || '').toLowerCase();
  if (normalizedAction === 'login' || normalizedAction === 'validar_sessao' || normalizedAction === 'logout') {
    return transformDeep(value, (key, currentValue) => {
      if (typeof currentValue !== 'string') return currentValue;
      if (key === 'senha' || key === 'email' || key === 'token') return currentValue;
      return currentValue.toUpperCase();
    });
  }

  return transformSheetResponse(value, action);
}

function isIdField(key) {
  const normalized = String(key || '').toLowerCase();
  return normalized === 'id' || normalized.startsWith('id_') || normalized === 'idclube' || normalized === 'idencontro' || normalized === 'idaluno';
}

function transformDeep(value, transformFn, key = '') {
  if (Array.isArray(value)) {
    return value.map((item) => transformDeep(item, transformFn, key));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [currentKey, currentValue]) => {
      acc[currentKey] = transformDeep(currentValue, transformFn, currentKey);
      return acc;
    }, {});
  }

  return transformFn(key, value);
}

function appendAuthToken(payload, action) {
  if (!payload || typeof payload !== 'object') return payload;
  if (PUBLIC_ACTIONS.has(String(action || '').toLowerCase())) return payload;

  const token = getSessionToken();
  if (!token) return payload;

  return { ...payload, token };
}

function assertAuthorized(response, requestToken = '') {
  if (!response || typeof response !== 'object') return;

  const code = String(response.codigo || response.erro || '').toUpperCase();
  const message = String(response.mensagem || response.message || '').toLowerCase();
  const unauthorized =
    code === 'NAO_AUTORIZADO' ||
    code === 'UNAUTHORIZED' ||
    message.includes('nao autorizado') ||
    message.includes('não autorizado') ||
    message.includes('token') && message.includes('inval');

  if (!unauthorized) return;

  // Resposta atrasada de uma requisição antiga (token diferente) não deve derrubar sessão atual.
  const currentToken = getSessionToken();
  const reqToken = String(requestToken || '').trim();
  if (reqToken && currentToken && reqToken !== currentToken) {
    return;
  }

  clearSessionToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
  throw new AuthError();
}
