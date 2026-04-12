# Painel CETEC - Migracao React

Aplicacao React (Vite) criada para migrar o painel atual mantendo integracao com Google Apps Script.

## Stack

- React + Vite
- Chart.js (via react-chartjs-2)
- CSS proprio com variaveis (sem Tailwind)

## Como executar

1. Instalar dependencias:

```bash
npm install
```

2. Subir ambiente de desenvolvimento:

```bash
npm run dev
```

3. Gerar build de producao:

```bash
npm run build
```

## Configuracao da API

Por padrao, a aplicacao usa a URL do Apps Script definida em `src/config.js`.

Se quiser customizar, crie um `.env` com:

```bash
VITE_API_URL=https://script.google.com/macros/s/SEU_DEPLOY/exec
```

## Estrutura principal

- `src/components/LoginPage.jsx`: login na API
- `src/components/PanelPage.jsx`: carregamento de clubes e contagem de alunos
- `src/components/DashboardView.jsx`: KPIs, filtros e graficos
- `src/services/api.js`: camada de `GET/POST` com fallback JSONP para localhost
- `src/styles.css`: design system com variaveis CSS

## Estado atual da migracao

- Login funcional
- Dashboard com filtros por status/categoria
- Grafico por categoria
- Grafico por UTEC com subfiltro local (`Tudo`, `Manha`, `Tarde`)
- Contagem de alunos por clube (somada nos KPIs)

## Proximos passos sugeridos

- Migrar tela de detalhes de clube (encontros e alunos)
- Criar modulo de alunos com graficos de genero, turma e faixa etaria
- Adicionar React Router para separar rotas de Login, Dashboard e Clube
