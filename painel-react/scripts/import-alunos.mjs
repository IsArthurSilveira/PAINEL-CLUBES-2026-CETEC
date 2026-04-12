import fs from 'node:fs/promises';
import path from 'node:path';

const DEFAULT_API_URL = 'https://script.google.com/macros/s/AKfycbz3PlOFnjV3ZosqpRWhmVAnnSAKVp3AmR6z1SvRlI2lMIvtp8DAJwCccod9rfn2-mNa0Q/exec';
const API_URL = process.env.VITE_API_URL || DEFAULT_API_URL;
const inputPath = process.argv[2];
const tokenFromArg = process.argv[3];
const AUTH_TOKEN = tokenFromArg || process.env.PAINEL_TOKEN || process.env.TOKEN || '';

console.log(`[import:alunos] API_URL ativa: ${API_URL}`);

if (!inputPath) {
  console.error('Uso: npm run import:alunos -- caminho/para/alunos.json [token_opcional]');
  process.exit(1);
}

const absolutePath = path.resolve(process.cwd(), inputPath);
const raw = await fs.readFile(absolutePath, 'utf8');
const alunos = JSON.parse(raw);

if (!Array.isArray(alunos)) {
  console.error('O arquivo precisa conter um array JSON de alunos.');
  process.exit(1);
}

let imported = 0;
let failed = 0;

for (const [index, aluno] of alunos.entries()) {
  const idClube = readClubId(aluno);

  if (!idClube) {
    failed += 1;
    console.error(`[${index + 1}] Falhou: aluno sem id_clube`);
    continue;
  }

  const payload = {
    acao: 'salvar_aluno',
    id_clube: String(idClube).trim(),
    matricula: upper(aluno.matricula || aluno.matr || 'S/ MATRICULA'),
    nome: upper(aluno.nome || 'ALUNO SEM NOME'),
  };

  if (AUTH_TOKEN) {
    payload.token = AUTH_TOKEN;
  }

  if (aluno.genero !== undefined && aluno.genero !== null) {
    payload.genero = upper(aluno.genero);
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data?.sucesso) {
      failed += 1;
      const detalhe = data?.mensagem || data?.erro || data?.codigo || 'sem detalhe';
      console.error(`[${index + 1}] Falhou: ${payload.nome} (clube ${payload.id_clube}) -> ${detalhe}`);
      continue;
    }

    imported += 1;
    console.log(`[${index + 1}] Inserido: ${payload.nome} (clube ${payload.id_clube})`);
  } catch (error) {
    failed += 1;
    console.error(`[${index + 1}] Erro em ${payload.nome}: ${error.message}`);
  }
}

console.log(`\nImportacao concluida. Sucesso: ${imported}. Falhas: ${failed}.`);

if (!AUTH_TOKEN) {
  console.log('\nAviso: token nao informado. Se sua API exigir autenticacao, use o 3o argumento ou a variavel PAINEL_TOKEN.');
}

function upper(value) {
  return String(value ?? '').trim().toUpperCase();
}

function readClubId(aluno) {
  return aluno.id_clube ?? aluno.idClube ?? aluno.clube_id ?? aluno.clubeId ?? '';
}
