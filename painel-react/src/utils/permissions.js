export const ACCESS_LEVELS = {
  ADMIN: 'administrador',
  USER: 'usuario',
  VIEWER: 'leitor',
};

export const USER_ROLE_STORAGE_KEY = 'usuarioPerfil';

export function normalizeAccessLevel(value) {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized.includes('admin')) return ACCESS_LEVELS.ADMIN;
  if (normalized.includes('leit') || normalized.includes('view') || normalized.includes('read')) return ACCESS_LEVELS.VIEWER;
  if (normalized.includes('usu') || normalized.includes('user')) return ACCESS_LEVELS.USER;
  if (!normalized) return ACCESS_LEVELS.USER;
  return normalized;
}

export function accessLabel(value) {
  const level = normalizeAccessLevel(value);
  if (level === ACCESS_LEVELS.ADMIN) return 'Administrador';
  if (level === ACCESS_LEVELS.VIEWER) return 'Leitor';
  return 'Usuário';
}

export function canCreateClub(value) {
  const level = normalizeAccessLevel(value);
  return level === ACCESS_LEVELS.ADMIN || level === ACCESS_LEVELS.USER;
}

export function canEditClub(value) {
  return normalizeAccessLevel(value) === ACCESS_LEVELS.ADMIN;
}

export function canCreateAluno(value) {
  const level = normalizeAccessLevel(value);
  return level === ACCESS_LEVELS.ADMIN || level === ACCESS_LEVELS.USER;
}

export function canCreateEncontro(value) {
  const level = normalizeAccessLevel(value);
  return level === ACCESS_LEVELS.ADMIN || level === ACCESS_LEVELS.USER;
}

export function canUpdateStatus(value) {
  return normalizeAccessLevel(value) === ACCESS_LEVELS.ADMIN;
}

export function canDeleteAluno(value) {
  return normalizeAccessLevel(value) === ACCESS_LEVELS.ADMIN;
}

export function canDeleteEncontro(value) {
  return normalizeAccessLevel(value) === ACCESS_LEVELS.ADMIN;
}
