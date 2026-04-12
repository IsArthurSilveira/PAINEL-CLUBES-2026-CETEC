export function pickField(record, aliases, fallback = '') {
  for (const key of aliases) {
    if (record?.[key] !== undefined && record?.[key] !== null && String(record[key]).trim() !== '') {
      return record[key];
    }
  }
  return fallback;
}

export function toUpperText(value, fallback = '') {
  const text = String(value ?? fallback).trim();
  return text ? text.toUpperCase() : String(fallback || '').toUpperCase();
}

export function statusKey(status) {
  const normalized = String(status || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'em_andamento' || normalized === 'em_andamento.') return 'em_andamento';
  if (normalized === 'concluido' || normalized === 'concluído') return 'concluido';
  return 'pendente';
}

function normalizeId(value) {
  return String(value ?? '').trim();
}

export function normalizeClube(raw) {
  return {
    id: normalizeId(pickField(raw, ['ID', 'id', 'ID_Clube', 'ID Clube'], '')),
    nome: toUpperText(pickField(raw, ['Nome', 'nome'], '-'), '-'),
    escola: toUpperText(pickField(raw, ['Escola', 'escola'], '-'), '-'),
    utec: toUpperText(pickField(raw, ['UTEC', 'utec'], '-'), '-'),
    prof: toUpperText(pickField(raw, ['Prof', 'Professor', 'prof'], '-'), '-'),
    estag: toUpperText(pickField(raw, ['Estag', 'Estagiario', 'estag'], '-'), '-'),
    dias: toUpperText(pickField(raw, ['Dias', 'dias'], '-'), '-'),
    horario: toUpperText(pickField(raw, ['Horario', 'Horário', 'horario'], '-'), '-'),
    categoria: toUpperText(pickField(raw, ['Categoria', 'categoria'], 'CLUBES INICIAIS'), 'CLUBES INICIAIS'),
    status: toUpperText(pickField(raw, ['Status', 'status'], 'PENDENTE'), 'PENDENTE'),
  };
}

export function normalizeAluno(raw) {
  return {
    id: normalizeId(pickField(raw, ['ID_Aluno', 'ID Aluno', 'id', 'ID'], '')),
    idClube: normalizeId(pickField(raw, ['ID_Clube', 'ID Clube', 'id_clube'], '')),
    matricula: toUpperText(pickField(raw, ['Matricula', 'Matrícula', 'matricula'], ''), ''),
    nome: toUpperText(pickField(raw, ['Nome', 'nome'], '-'), '-'),
    dataRegistro: toUpperText(pickField(raw, ['Data_Registro', 'Data Registro', 'data_registro'], ''), ''),
  };
}

export function normalizeEncontro(raw) {
  return {
    id: normalizeId(pickField(raw, ['ID_Encontro', 'ID Encontro', 'id', 'ID'], '')),
    idClube: normalizeId(pickField(raw, ['ID_Clube', 'ID Clube', 'id_clube'], '')),
    modulo: toUpperText(pickField(raw, ['Modulo', 'Módulo', 'modulo', 'Modlulo'], ''), ''),
    assunto: toUpperText(pickField(raw, ['Assunto', 'assunto'], '-'), '-'),
    data: toUpperText(pickField(raw, ['Data', 'data'], ''), ''),
    status: toUpperText(pickField(raw, ['Status', 'status'], 'A FAZER'), 'A FAZER'),
  };
}

export function parseShift(horario) {
  const match = String(horario || '').match(/(\d{1,2})\s*:\s*\d{2}/);
  if (!match) return 'TARDE';
  const hour = Number(match[1]);
  if (Number.isNaN(hour)) return 'TARDE';
  return hour < 12 ? 'MANHÃ' : 'TARDE';
}

export function statusLabel(status) {
  const key = statusKey(status);
  if (key === 'concluido') return 'CONCLUÍDO';
  if (key === 'em_andamento') return 'EM ANDAMENTO';
  return 'PENDENTE';
}

export function encontroStatusLabel(status) {
  return String(status || '').trim().toUpperCase() === 'FEITO' ? 'FEITO' : 'A FAZER';
}

export function formatDateBR(dateValue) {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);
  return new Intl.DateTimeFormat('pt-BR').format(date);
}
