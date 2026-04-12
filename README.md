# 🎓 Painel de Clubes 2026 - CETEC

Sistema de gerenciamento de clubes de educação tecnológica para o CETEC, com autenticação por token, integração com Google Sheets e interface moderna em React.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Uso](#uso)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Segurança](#segurança)
- [Deployment](#deployment)
- [Documentação Técnica](#documentação-técnica)

---

## 🎯 Visão Geral

O **Painel de Clubes** é uma aplicação web completa para gerenciar clubes de educação tecnológica, alunos, encontros e cronogramas. 

### ✨ Principais Funcionalidades

- 🔐 **Autenticação por Token**: Login seguro com tokens JWT-like armazenados em Google Sheets
- 📊 **Dashboard Intuitivo**: Visualização gráfica com KPIs, filtros e gráficos
- 🏫 **Gerenciamento de Clubes**: Criar, editar, visualizar e filtrar clubes por categoria/UTEC
- 👥 **Gerenciamento de Alunos**: Adicionar e listar alunos por clube
- 📅 **Cronograma de Encontros**: Organizar aulas por módulo (Scratch, EV3, Maker, Python)
- 🔄 **Status Dinâmico**: Acompanhar progresso (Pendente, Em Andamento, Concluído)
- 📈 **Relatórios**: Estatísticas por categoria, UTEC e status
- ⚡ **Importação em Lote**: Script Node para importar múltiplos clubes de uma vez
- 🔒 **Proteção de Dados**: Arquivos sensíveis ignorados pelo Git

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND (React + Vite)                    │
│  ┌──────────┬──────────┬───────────┬──────────────┐              │
│  │ Login    │ Dashboard│ Clubes    │ Detalhes     │              │
│  │ Page     │ View     │ Panel     │ (Encontros)  │              │
│  └──────────┴──────────┴───────────┴──────────────┘              │
│                         ↓ (REST API)                             │
├─────────────────────────────────────────────────────────────────┤
│              BACKEND (Google Apps Script)                        │
│  ┌─────────────────────────────────────────────┐                │
│  │ • Login & Autenticação                      │                │
│  │ • Validação de Token                        │                │
│  │ • CRUD Operações (Clubes, Alunos, Eventos) │                │
│  │ • Session Management                        │                │
│  └─────────────────────────────────────────────┘                │
│                         ↓ (Read/Write)                           │
├─────────────────────────────────────────────────────────────────┤
│              BANCO DE DADOS (Google Sheets)                      │
│  ┌──────────┬──────────┬────────────┬──────────┬─────────┐      │
│  │ Usuarios │ Clubes   │ Alunos     │ Encontros│ SESSOES │      │
│  └──────────┴──────────┴────────────┴──────────┴─────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Chart.js** - Gráficos e visualizações
- **Node.js** - Scripts de importação

### Backend
- **Google Apps Script** - Serverless backend
- **Google Sheets API** - Database
- **HMAC-SHA256** - Token hashing

### DevOps
- **Git** - Version control
- **GitHub** - Repository hosting

---

## 📦 Pré-requisitos

### 1. Ambiente Local
- **Node.js** 16.x ou superior
- **npm** ou **yarn**
- **Git**

### 2. Contas Necessárias
- **Google Account** (para criar Google Sheets e Apps Script)
- **GitHub Account** (opcional, para repositório)

### 3. Google Sheets
- Uma planilha Google com as seguintes sheets:
  - `Usuarios` (email, senha, nome)
  - `Clubes` (id, nome, escola, utec, prof, estag, dias, horario, categoria, status)
  - `Alunos` (id, id_clube, matricula, nome, data_registro)
  - `Encontros` (id, id_clube, modulo, assunto, data, status)
  - `SESSOES` (criada automaticamente pelo Apps Script)

---

## 🚀 Instalação

### 1. Clonar o Repositório

```bash
git clone https://github.com/IsArthurSilveira/PAINEL-CLUBES-2026-CETEC.git
cd PAINEL-CLUBES-2026-CETEC
```

### 2. Instalar Dependências (Frontend)

```bash
cd painel-react
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie `.env.local` em `painel-react/`:

```env
VITE_API_URL=https://script.google.com/macros/s/[SEU_DEPLOYMENT_ID]/exec
```

Substitua `[SEU_DEPLOYMENT_ID]` pela URL do seu Google Apps Script deployment.

---

## ⚙️ Configuração

### No Google Apps Script

1. Abra sua planilha Google
2. Vá para **Extensões** → **Apps Script**
3. Copie todo o conteúdo de `painel-react/apps-script/codigo-gs-COMPLETO-com-token.gs`
4. Abra `codigo.gs` no Apps Script e substitua o conteúdo
5. Salve e faça **Deploy** como **Web App**:
   - Execute como: **You**
   - Quem tem acesso: **Anyone**
6. **Copie a URL do deployment**

### No Frontend

1. Abra `painel-react/src/config.js`
2. Atualize com a URL do Apps Script

```javascript
export const API_URL = 'https://script.google.com/macros/s/[URL_DO_SEU_DEPLOYMENT]/exec';
```

---

## 💻 Uso

### Desenvolvimento Local

```bash
cd painel-react
npm run dev
# Abre em http://localhost:5173
```

### Build para Produção

```bash
cd painel-react
npm run build
# Saída em: dist/
```

### Importar Clubes em Lote

```bash
cd painel-react
npm run import:clubes
# Lê clubes.example.json e insere no Sheets
```

### Validar Dados de Clubes

```bash
cd painel-react
node scripts/validate-clubes.mjs
# Valida clubes.example.json antes de importar
```

---

## 📁 Estrutura do Projeto

```
PAINEL-CLUBES-2026-CETEC/
├── README.md                           # Este arquivo
├── .gitignore                          # Ignora apps-script/ e dados sensíveis
│
├── painel-react/                       # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.jsx                    # Componente raiz
│   │   ├── main.jsx                   # Entry point
│   │   ├── config.js                  # Configuração API_URL
│   │   ├── pages/
│   │   │   ├── LoginPageRoute.jsx     # Página de login
│   │   │   ├── DashboardPage.jsx      # Dashboard
│   │   │   ├── ClubsPanelPage.jsx     # Lista de clubes
│   │   │   ├── ClubDetailPage.jsx     # Detalhes do clube
│   │   │   └── ClubFormPage.jsx       # Editar/criar clube
│   │   ├── components/
│   │   │   ├── AppSidebar.jsx         # Sidebar navegação
│   │   │   ├── DashboardView.jsx      # Gráficos
│   │   │   └── ClubFormModal.jsx      # Modal de criação
│   │   ├── services/
│   │   │   └── api.js                 # Client HTTP (com token auth)
│   │   ├── hooks/
│   │   │   └── useClubes.js           # Hook para gerenciar dados
│   │   ├── utils/
│   │   │   └── clubes.js              # Funções utilitárias
│   │   └── styles/
│   │       ├── styles.css             # Estilos principais
│   │       └── legacy.css             # Componentes dashboard
│   │
│   ├── scripts/
│   │   ├── validate-clubes.mjs        # Validador de dados
│   │   ├── import-clubes.mjs          # Importador em lote
│   │   └── clubes.example.json        # Exemplo de dados (ignorado)
│   │
│   ├── apps-script/                   # ⚠️ IGNORADO NO GIT
│   │   ├── codigo-gs-COMPLETO-com-token.gs
│   │   ├── token-auth.gs              # Referência de auth
│   │   ├── TEST_LOGIN_LOCAL.gs        # Teste local
│   │   └── INTEGRACAO_TOKEN_GUIA.md   # Docs
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── .gitignore
│
├── codigo.gs                           # ⚠️ IGNORADO (ainda no Apps Script)
├── README.md
└── INTEGRACAO_RAPIDA.md               # Guia de setup
```

---

## 🔒 Segurança

### Autenticação por Token

1. **Login**: Usuário envia email/senha
2. **Token Gerado**: Apps Script gera token aleatório + hash HMAC-SHA256
3. **Armazenamento**: Token real enviado ao cliente, hash armazenado no Sheets
4. **Requisições**: Cliente envia token a cada requisição protegida
5. **Validação**: Backend valida token contra hash do Sheets
6. **Expiração**: Token expira após 8 horas (configurável)
7. **Logout**: Token é marcado como "revogado" no Sheets

### Proteção de Dados

```
# Arquivos ignorados (nunca commitados):
apps-script/
**/clubes-importar.json
**/clubes.example.json
listagem clubes.pdf
**/*.private.json
```

### Senha

⚠️ **Atual**: Armazenadas em plaintext no Sheets (seguro enquanto Sheets é privado)

✅ **Recomendado**: Implementar hash MD5/SHA256 antes de armazenar

---

## 🌐 Deployment

### Opção 1: GitHub Pages (Estático)

```bash
# Build
npm run build

# Commitar dist/ e fazer deploy via GitHub Pages
git add painel-react/dist
git commit -m "build: dist atualizado"
git push
```

### Opção 2: Vercel

```bash
npm install -g vercel
vercel
# Segue instruções interativas
```

### Opção 3: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=painel-react/dist
```

---

## 📚 Documentação Técnica

### Autenticação e Token
- [Token Management](TOKEN_MANAGEMENT_EXPLICADO.md) - Como funcionam os tokens
- [INTEGRACAO_TOKEN_GUIA.md](painel-react/apps-script/INTEGRACAO_TOKEN_GUIA.md) - Guia detalhado de integração
- [INTEGRACAO_RAPIDA.md](INTEGRACAO_RAPIDA.md) - Setup rápido em 5 passos

### API Endpoints

**baseURL**: `https://script.google.com/macros/s/[ID]/exec`

| Ação | Token? | Descrição |
|------|--------|-----------|
| `login` | ❌ | Fazer login, retorna token |
| `logout` | ✅ | Fazer logout, revoga token |
| `validar_sessao` | ✅ | Valida token atual |
| `listar_clubes` | ✅ | Lista todos os clubes |
| `listar_alunos` | ✅ | Lista alunos de um clube |
| `listar_encontros` | ✅ | Lista encontros de um clube |
| `salvar_clube` | ✅ | Criar/atualizar clube |
| `salvar_aluno` | ✅ | Adicionar aluno |
| `salvar_encontro` | ✅ | Adicionar encontro |
| `atualizar_status_clube` | ✅ | Mudar status do clube |
| `atualizar_status_encontro` | ✅ | Mudar status do encontro |

### Fluxo de Autenticação

```
Cliente                           Apps Script                 Sheets
   │                                  │                         │
   ├─ POST {email, senha} ──────────→ │                         │
   │                                  ├─ Valida credenciais ────→ │
   │                                  │ ← Valida               │
   │                                  ├─ Gera token aleatório  │
   │                                  ├─ Calcula hash HMAC     │
   │                                  ├─ Calcula expira_em     │
   │                                  ├─ Insere em SESSOES ────→ │
   │ ← {token, expira_em} ──────────┤ ← Insere             │
   │                                  │                         │
   └─ POST {acao, token} ──────────→ │                         │
                                      ├─ Calcula hash do token │
                                      ├─ Procura em SESSOES ──→ │
                                      │ ← Validação           │
                                      ├─ Executa acao        │
                                      ├─ Insere/Atualiza ───→ │
   ← {dados/erro} ────────────────┤ ← Sucesso             │
```

---

## 🐛 Troubleshooting

### "Credenciais inválidas"

1. ✅ Verificar se email/senha existem em `Usuarios` sheet
2. ✅ Não há espaços extras (use `.trim()`)
3. ✅ Fazer novo deploy do Apps Script

### "Token inválido ou expirado"

1. ✅ Fazer login novamente
2. ✅ Verificar se localStorage tem token: `console.log(localStorage.painel_token_sessao)`
3. ✅ Limpar localStorage: `localStorage.clear()` e refazer login

### "API_URL não encontrada"

1. ✅ Verificar `painel-react/src/config.js`
2. ✅ Copiar URL correta do App Script deployment
3. ✅ Recarregar página (Ctrl+Shift+R)

### Build falha

```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📋 Checklist de Deploy

- [ ] Sheet `Usuarios` tem dados
- [ ] Apps Script deployment criado e URL copiada
- [ ] `.env.local` atualizado com API_URL
- [ ] `npm run build` executado com sucesso
- [ ] Frontend testado localmente
- [ ] Login funcionando
- [ ] CRUD de clubes funciona
- [ ] Logout funciona
- [ ] `.gitignore` ignora `apps-script/`

---

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit mudanças: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/sua-feature`
4. Abra um Pull Request

---

## 📜 Licença

MIT - Veja `LICENSE` para detalhes

---

## 👨‍💻 Desenvolvedor

**Arthur Silveira** - IsArthurSilveira

---

## 📞 Suporte

Para dúvidas, abra uma issue ou envie um email.

---

**Última atualização**: 11 de abril de 2026
