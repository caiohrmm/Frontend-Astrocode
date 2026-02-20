# 🎨 Frontend – Sistema CRM Imobiliário com Inteligência Artificial

<div align="center">

**Interface moderna e intuitiva desenvolvida com Vue.js 3 e Vuetify**

[![Vue.js 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.11-1867C0?logo=vuetify&logoColor=white)](https://vuetifyjs.com)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

**Aplicação em produção (Vercel):** [https://frontend-astrocode.vercel.app/](https://frontend-astrocode.vercel.app/)

</div>

---

## 📋 Índice

- [1. Visão geral](#1-visão-geral)
- [2. Arquitetura e tecnologias](#2-arquitetura-e-tecnologias)
- [3. Estrutura do projeto e instalação](#3-estrutura-do-projeto-e-instalação)
- [4. Funcionalidades por módulo](#4-funcionalidades-por-módulo)
- [5. Rotas e proteção de acesso](#5-rotas-e-proteção-de-acesso)
- [6. Integrações de APIs externas](#6-integrações-de-apis-externas)
- [7. Componentes reutilizáveis](#7-componentes-reutilizáveis)
- [8. Máscaras de entrada e estado](#8-máscaras-de-entrada-e-estado)
- [9. Deploy na Vercel](#9-deploy-na-vercel)
- [10. Destaques técnicos](#10-destaques-técnicos)
- [Documentação adicional](#-documentação-adicional)

---

## 1. Visão geral

Frontend do **CRM imobiliário** com **IA integrada**, oferecendo interface responsiva para gestão de **clientes**, **imóveis**, **atendimentos** (ciclos), **visitas**, **vendas** e **perdas**. A aplicação consome a API do backend e reflete as regras de negócio: um único ciclo de atendimento ativo (ACTIVE) por cliente, visitas/vendas/perdas vinculadas ao cliente e ao ciclo, e atualização de perfil e lead score com base no ciclo ativo.

### Características principais

- **Interface moderna** com Material Design (Vuetify 3) e TypeScript.
- **Totalmente responsiva** (desktop, tablet e mobile).
- **Proteção de rotas** por autenticação e por role (RBAC: gestor vs atendente).
- **Integração com IA**: resumos de atendimento, detecção de visitas/imóveis, jornada do cliente, chat com IA, recomendações.
- **Integrações externas** no cadastro de imóveis (ViaCEP, Google Geocoding, IBGE, Nominatim).
- **Máscaras de entrada** em tempo real (moeda, telefone, CEP).
- **Deploy** preparado para **Vercel** (SPA com rewrites).

---

## 2. Arquitetura e tecnologias

### Stack

| Camada | Tecnologia |
|--------|------------|
| **Framework** | Vue.js 3.5 (Composition API) |
| **Linguagem** | TypeScript 5.9 |
| **Build** | Vite 7.2 |
| **Roteamento** | Vue Router 4.6 |
| **Estado** | Pinia 3.0 |
| **UI** | Vuetify 3.11, Material Design Icons |
| **HTTP** | Fetch nativo (cliente centralizado em `api.ts`) |

### Integração com o backend

- Todas as chamadas passam pelo cliente em `src/shared/services/api.ts`, que adiciona o token JWT e trata erros.
- Variável de ambiente: `VITE_API_BASE_URL` (URL da API FastAPI). Em produção (ex.: Vercel), configurar para a URL do backend.

---

## 3. Estrutura do projeto e instalação

### Estrutura de pastas (principal)

```
src/
├── app/
│   ├── layout/
│   │   ├── AppLayout.vue          # Layout principal (sidebar, barra, menu usuário)
│   │   └── AuthLayout.vue         # Layout de login/registro/recuperação de senha
│   ├── router/
│   │   └── index.ts               # Rotas e guards (auth + requiresManager)
│   └── store/
│       ├── auth.store.ts          # Pinia: token, user, roles, login/logout
│       └── index.ts
│
├── modules/
│   ├── auth/                      # Login, registro, forgot/reset password, OAuth callback
│   ├── dashboard/                 # Dashboard gerencial (gestores)
│   ├── clients/                   # Listagem e detalhes do cliente
│   ├── attendances/               # Listagem, criação e detalhes de atendimento
│   ├── properties/                # Listagem, formulário e detalhes de imóveis
│   ├── visits/                    # Listagem, formulário e detalhes de visitas
│   ├── sales/                     # Listagem e gestão de vendas (gestores)
│   ├── losses/                    # Análise de perdas (gestores)
│   └── users/                     # Gestão de usuários (gestores)
│
├── shared/
│   ├── components/                # Componentes reutilizáveis (ver tópico 7)
│   ├── services/                  # api.ts, auth, clients, attendances, properties, visits, sales, losses, users, dashboard, aiChat, aiSummaries, journey
│   └── utils/
│       └── masks.ts               # Máscaras de moeda, telefone, CEP
│
├── plugins/
│   └── vuetify.ts
├── App.vue
└── main.ts
```

### Instalação

1. **Pré-requisitos:** Node.js 18+, npm ou yarn.
2. **Dependências:**
   ```bash
   npm install
   ```
3. **Variáveis de ambiente:** criar `.env` na raiz (ou usar `.env.example` como base):
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```
   Em produção, definir `VITE_API_BASE_URL` com a URL do backend (ex.: API na Vercel ou outro host).
4. **Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Aplicação em `http://localhost:5173`.
5. **Build:**
   ```bash
   npm run build
   ```
   Saída em `dist/`.
6. **Preview da build:**
   ```bash
   npm run preview
   ```

---

## 4. Funcionalidades por módulo

Alinhado às regras de negócio do backend: cliente como centro; ciclos de atendimento (um ACTIVE por cliente); visitas, vendas e perdas vinculadas ao cliente e ao atendimento.

### Autenticação

- **Login** com e-mail/senha e **login com Google OAuth** (redirect para backend, callback em `/auth/google/callback`).
- **Registro público** (`/register`): novos usuários recebem role **atendente**.
- **Esqueci a senha** e **redefinir senha** (fluxo via backend).
- **Persistência de sessão** via token em `localStorage`; guard valida token e carrega usuário ao acessar rotas protegidas.

### Clientes

- **Listagem** com filtros e busca.
- **Criação** (dialog) com classificação automática pela IA (lead score, estado derivado).
- **Detalhes** com timeline de eventos, ciclos de atendimento, jornada do cliente (IA), propriedades recomendadas, insights e campos controlados pela IA (read-only). Atualizações incrementais do perfil sugeridas pela IA.

### Atendimentos

- **Listagem** e **criação** de atendimento (vinculado a cliente e propriedade quando aplicável).
- **Detalhes** do atendimento: edição no próprio detalhe (rota `/attendances/:id/edit` redireciona para detalhes). Ao salvar, análise pela IA (resumo, intenção, próximos passos). **Detecção automática de visitas** e **de imóveis** mencionados: modal de confirmação e criação/navegação para visita com dados preenchidos.

### Imóveis

- **Listagem** com filtros.
- **Formulário** completo (abas: geral, localização com integrações – tópico 6 –, características, financeiro, comercial, proprietário, IA & Matching, mídia). Upload de imagens via Cloudinary.
- **Detalhes** com mapa (Google Maps quando disponível). Máscaras de moeda em tempo real.

### Visitas

- **Listagem** (incluindo visualização por calendário quando aplicável) e **formulário** de criação/edição.
- Status (agendada, realizada, cancelada, remarcada). Visitas vinculadas a cliente e atendimento; detecção de intenção de visita pela IA no atendimento com modal e criação rápida.

### Vendas e perdas (gestores)

- **Vendas:** listagem, criação com múltiplos métodos de pagamento, máscaras de moeda, busca de cliente/imóvel, comissões. Fechamento de ciclo e aplicação de lead score no cliente (regra do backend).
- **Perdas:** registro de perdas com motivo e feedback, análise estatística. Fechamento de ciclo e lead score (regra do backend).

### Dashboard e usuários (gestores)

- **Dashboard:** métricas (clientes, valor de vendas, taxa de conversão, lead score médio), funil, gráficos, origem de leads, top corretores, insights da IA, alertas e clientes em risco.
- **Usuários:** listagem, criação e atribuição de roles (gestor/atendente).

---

## 5. Rotas e proteção de acesso

- **Rotas públicas:** `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/google/callback`.
- **Rotas protegidas (autenticação):** todas as demais. Sem token ou com token inválido → redirect para `/login`.
- **Rotas exclusivas para gestor** (`meta.requiresManager: true`): `/` (dashboard), `/users`, `/sales`, `/losses`. Usuário sem role `gestor` → redirect para `/clients`.

### Tabela resumida

| Rota | Componente | Requer auth | Apenas gestor |
|------|------------|-------------|----------------|
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/google/callback` | AuthLayout + páginas correspondentes | Não | Não |
| `/` | DashboardPage | Sim | Sim |
| `/clients`, `/clients/:id` | ClientsListPage, ClientDetailsPage | Sim | Não |
| `/attendances`, `/attendances/create`, `/attendances/:id` | AttendanceListPage, AttendanceCreatePage, AttendanceDetailsPage | Sim | Não |
| `/attendances/:id/edit` | Redireciona para `AttendanceDetailsPage` | Sim | Não |
| `/properties`, `/properties/create`, `/properties/:id`, `/properties/:id/edit` | PropertiesListPage, PropertyFormPage, PropertyDetailsPage | Sim | Não |
| `/visits`, `/visits/create`, `/visits/:id`, `/visits/:id/edit` | VisitsListPage, VisitFormPage, VisitDetailsPage | Sim | Não |
| `/sales` | SalesListPage | Sim | Sim |
| `/losses` | LossAnalysisPage | Sim | Sim |
| `/users` | UsersPage | Sim | Sim |

### Guards

- `router.beforeEach`: verifica `requiresAuth`; se necessário, valida token e chama `fetchCurrentUser`; em seguida verifica `requiresManager` e roles. Usuário autenticado em `/login` ou `/register` é redirecionado para dashboard (gestor) ou `/clients` (atendente).

---

## 6. Integrações de APIs externas

Usadas principalmente no **formulário de imóveis**, aba **Localização**:

| Integração | Uso |
|------------|-----|
| **ViaCEP** | Busca por CEP → preenchimento de logradouro, bairro, cidade, UF. CEP formatado `00000-000`. |
| **Google Geocoding** | Via backend: busca por endereço ou URL do Google Maps → endereço parseado e coordenadas. |
| **IBGE** | Lista de cidades por UF (`/api/v1/localidades/estados/{uf}/municipios`). |
| **Nominatim (OSM)** | Fallback para coordenadas após ViaCEP (sem API key). |

Benefícios: menos erros de digitação, dados padronizados e coordenadas para mapas.

---

## 7. Componentes reutilizáveis

| Componente | Descrição |
|------------|-----------|
| **SearchSelectDialog** | Dialog de busca e seleção (clientes, imóveis, corretores): debounce, paginação, loading, empty state, seleção única ou múltipla. |
| **VisitDetectionDialog** | Exibido quando a IA detecta intenção de visita no atendimento; confirma e cria visita ou leva ao formulário com dados preenchidos. |
| **ClientCreateDialog** | Criação/edição de cliente; máscara de telefone; classificação pela IA. |
| **ClientAttendanceCycles** | Exibição dos ciclos de atendimento do cliente (ACTIVE e históricos). |
| **ClientStateDerivationInfo** | Explicação do estado derivado do cliente (IA). |
| **ClientUpdateSuggestionsDialog** | Sugestões de atualização de perfil pela IA. |
| **LeadClassificationCard** | Exibição da classificação do lead (IA). |
| **AttendanceJourneyPanel** | Painel da jornada do cliente no contexto do atendimento (estágio, próximas ações, saúde do relacionamento). |
| **AiChatWidget** | Chat com IA sobre o cliente (contexto enviado ao backend). |
| **PropertyImageUpload** | Upload de imagens de imóveis (Cloudinary), preview e validação. |

---

## 8. Máscaras de entrada e estado

### Máscaras (`shared/utils/masks.ts`)

- **Moeda (tempo real):** formatação em pt-BR (ex.: `12.345,67`); usada em imóveis (preço, condomínio, IPTU) e vendas (valor da venda, métodos de pagamento).
- **Telefone:** fixo `(11) 3456-7890`, celular `(11) 98765-4321`.
- **CEP:** `00000-000`.

### Estado (Pinia)

- **Auth store** (`auth.store.ts`): `token`, `user`, `userRoles`, `isAuthenticated`; ações `login`, `register`, `logout`, `fetchCurrentUser`, `setToken`, `getToken`, `initialize`. Getters: `isManager`, `hasRole(roleName)`.
- Token sincronizado com `apiClient` e `localStorage`; interceptors do cliente adicionam `Authorization: Bearer <token>` nas requisições.

---

## 9. Deploy na Vercel

A aplicação é um **SPA** (Vue Router em modo history). Para funcionar na Vercel, todas as rotas devem servir `index.html`; arquivos estáticos (JS, CSS, imagens) continuam sendo servidos normalmente.

### Configuração no repositório

- **vercel.json** na raiz já contém o rewrite necessário:
  ```json
  {
    "rewrites": [
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- Build: comando padrão `npm run build` (Vite); diretório de saída: `dist/` (a Vercel detecta automaticamente para projetos Vite).

### Variáveis de ambiente na Vercel

- **VITE_API_BASE_URL:** URL base da API do backend (ex.: `https://sua-api.vercel.app` ou outro host).
- Configurar em: Project → Settings → Environment Variables (Production/Preview conforme necessário).

### Deploy

- Conectar o repositório à Vercel; o build e o output serão detectados.
- **Aplicação em produção:** [https://frontend-astrocode.vercel.app/](https://frontend-astrocode.vercel.app/)
- Após o deploy, acessar a URL fornecida pela Vercel; garantir que o backend esteja acessível pela URL definida em `VITE_API_BASE_URL` (e CORS configurado para o domínio do frontend).

---

## 10. Destaques técnicos

- **Composition API** e `<script setup>` em todos os componentes; TypeScript em todo o projeto.
- **Cliente HTTP centralizado** (`api.ts`): token automático, tratamento de 422 e erros padronizados.
- **Lazy loading** de rotas (`import()` no router); code splitting e tree shaking via Vite.
- **Responsividade** com breakpoints do Vuetify (xs a xl).
- **UX:** loading states, snackbars, validação em tempo real, empty states.
- **Integração com IA:** resumos, detecção de visitas/imóveis, jornada, chat e recomendações alinhados aos endpoints e regras do backend.

---

## 📚 Documentação adicional

- [Vue.js 3](https://vuejs.org/)
- [Vuetify 3](https://vuetifyjs.com/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vercel – Rewrites](https://vercel.com/docs/edge-network/rewrites)

---

<div align="center">

**Desenvolvido com Vue.js 3, TypeScript e Vuetify**

[⬆ Voltar ao topo](#-frontend--sistema-crm-imobiliário-com-inteligência-artificial)

</div>
