# 🎨 Frontend - Sistema CRM Imobiliário com Inteligência Artificial

<div align="center">

**Interface moderna e intuitiva desenvolvida com Vue.js 3 e Vuetify**

[![Vue.js 3](https://img.shields.io/badge/Vue.js-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vuetify](https://img.shields.io/badge/Vuetify-3.11-1867C0?logo=vuetify&logoColor=white)](https://vuetifyjs.com)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Integrações de APIs](#-integrações-de-apis)
- [Rotas e Proteção de Acesso](#-rotas-e-proteção-de-acesso)
- [Componentes Reutilizáveis](#-componentes-reutilizáveis)
- [Máscaras de Entrada](#-máscaras-de-entrada)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Arquitetura de Estado](#-arquitetura-de-estado)
- [Destaques Técnicos](#-destaques-técnicos)

---

## 🎯 Visão Geral

Frontend completo desenvolvido para o sistema CRM imobiliário, oferecendo uma interface moderna, responsiva e intuitiva para gestão de clientes, imóveis, atendimentos, visitas e vendas. A aplicação integra profundamente com a Inteligência Artificial do backend, proporcionando uma experiência fluida e automatizada.

### Características Principais

- ✅ **Interface Moderna** com Material Design (Vuetify 3)
- ✅ **Totalmente Responsiva** para desktop, tablet e mobile
- ✅ **TypeScript** para type safety e melhor DX
- ✅ **Componentes Reutilizáveis** e bem estruturados
- ✅ **Integração com APIs Externas** para facilitar cadastros
- ✅ **Máscaras de Entrada** em tempo real (como apps bancários)
- ✅ **Proteção de Rotas** baseada em roles (RBAC)
- ✅ **Feedback Visual** com loading states e notificações
- ✅ **Detecção Automática** de visitas e propriedades pela IA

---

## 🏗️ Stack Tecnológico

### Core

- **Vue.js 3.5** - Framework JavaScript progressivo com Composition API
- **TypeScript 5.9** - Superset JavaScript com tipagem estática
- **Vite 7.2** - Build tool e dev server ultra-rápido
- **Vue Router 4.6** - Roteamento oficial do Vue.js
- **Pinia 3.0** - Gerenciamento de estado moderno (sucessor do Vuex)

### UI Framework

- **Vuetify 3.11** - Framework de componentes Material Design
- **Material Design Icons** - Biblioteca de ícones completa

### Utilitários

- **Fetch API** - Para chamadas HTTP (nativo do navegador)
- **Composition API** - Padrão moderno do Vue 3

---

## 📁 Estrutura do Projeto

```
frontend/
│
├── src/
│   ├── app/                          # Configuração da aplicação
│   │   ├── layout/
│   │   │   ├── AppLayout.vue        # Layout principal (com sidebar)
│   │   │   └── AuthLayout.vue       # Layout de autenticação
│   │   ├── router/
│   │   │   └── index.ts             # Configuração de rotas e guards
│   │   └── store/
│   │       ├── auth.store.ts        # Store de autenticação (Pinia)
│   │       └── index.ts              # Configuração do Pinia
│   │
│   ├── modules/                      # Módulos da aplicação
│   │   ├── auth/                     # Módulo de autenticação
│   │   │   └── pages/
│   │   │       ├── LoginPage.vue
│   │   │       ├── RegisterPage.vue
│   │   │       └── OAuthCallbackPage.vue
│   │   │
│   │   ├── dashboard/                # Dashboard gerencial
│   │   │   └── pages/
│   │   │       └── DashboardPage.vue
│   │   │
│   │   ├── clients/                  # Módulo de clientes
│   │   │   └── pages/
│   │   │       ├── ClientsListPage.vue
│   │   │       └── ClientDetailsPage.vue
│   │   │
│   │   ├── attendances/              # Módulo de atendimentos
│   │   │   └── pages/
│   │   │       ├── AttendanceListPage.vue
│   │   │       ├── AttendanceCreatePage.vue
│   │   │       └── AttendanceDetailsPage.vue
│   │   │
│   │   ├── properties/               # Módulo de imóveis
│   │   │   └── pages/
│   │   │       ├── PropertiesListPage.vue
│   │   │       ├── PropertyFormPage.vue
│   │   │       └── PropertyDetailsPage.vue
│   │   │
│   │   ├── visits/                   # Módulo de visitas
│   │   │   └── pages/
│   │   │       ├── VisitsListPage.vue
│   │   │       ├── VisitFormPage.vue
│   │   │       └── VisitDetailsPage.vue
│   │   │
│   │   ├── sales/                     # Módulo de vendas
│   │   │   └── pages/
│   │   │       └── SalesListPage.vue
│   │   │
│   │   ├── losses/                    # Módulo de perdas
│   │   │   └── pages/
│   │   │       └── LossAnalysisPage.vue
│   │   │
│   │   └── users/                     # Módulo de usuários
│   │       └── pages/
│   │           └── UsersPage.vue
│   │
│   ├── shared/                        # Código compartilhado
│   │   ├── components/                # Componentes reutilizáveis
│   │   │   ├── AiChatWidget.vue      # Widget de chat com IA
│   │   │   ├── ClientAttendanceCycles.vue
│   │   │   ├── ClientCreateDialog.vue
│   │   │   ├── ClientJourneyPanel.vue
│   │   │   ├── ClientStateDerivationInfo.vue
│   │   │   ├── ClientUpdateSuggestionsDialog.vue
│   │   │   ├── LeadClassificationCard.vue
│   │   │   ├── PropertyImageUpload.vue
│   │   │   ├── SearchSelectDialog.vue  # Dialog de busca e seleção
│   │   │   └── VisitDetectionDialog.vue # Dialog de detecção de visita
│   │   │
│   │   ├── services/                  # Serviços de API
│   │   │   ├── api.ts                # Cliente HTTP base
│   │   │   ├── aiChat.service.ts
│   │   │   ├── aiSummaries.service.ts
│   │   │   ├── attendances.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── clients.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   ├── journey.service.ts
│   │   │   ├── losses.service.ts
│   │   │   ├── properties.service.ts
│   │   │   ├── sales.service.ts
│   │   │   ├── users.service.ts
│   │   │   └── visits.service.ts
│   │   │
│   │   └── utils/                     # Utilitários
│   │       └── masks.ts              # Máscaras de entrada
│   │
│   ├── plugins/
│   │   └── vuetify.ts                # Configuração do Vuetify
│   │
│   ├── App.vue                       # Componente raiz
│   └── main.ts                       # Entry point
│
├── public/                           # Arquivos estáticos
├── index.html                        # HTML principal
├── package.json                      # Dependências
├── tsconfig.json                     # Configuração TypeScript
├── vite.config.ts                    # Configuração Vite
└── README.md                         # Este arquivo
```

---

## ⚙️ Funcionalidades Principais

### 1. Autenticação e Autorização

- **Login com email/senha**
- **Login com Google OAuth**
- **Proteção de rotas** baseada em autenticação
- **Controle de acesso** baseado em roles (RBAC)
- **Guards de navegação** automáticos
- **Persistência de sessão** via localStorage

### 2. Gestão de Clientes

- **Listagem** com filtros e busca
- **Criação** com classificação automática pela IA
- **Detalhes completos** com:
  - Timeline de eventos
  - Ciclos de atendimento
  - Jornada do cliente (análise IA)
  - Propriedades recomendadas
  - Insights da IA
- **Campos controlados pela IA** (read-only) com indicação visual
- **Atualizações incrementais** do perfil pela IA

### 3. Gestão de Atendimentos

- **Criação/edição** de atendimentos
- **Análise automática pela IA** ao salvar
- **Detecção automática de visitas** com modal de confirmação
- **Detecção automática de imóveis** mencionados
- **Vinculação automática** de propriedades
- **Resumo gerado pela IA** exibido em tempo real
- **Recomendações de propriedades** baseadas no atendimento
- **Próximos passos sugeridos** pela IA

### 4. Gestão de Imóveis

- **Formulário completo** com abas organizadas:
  - Geral (código, tipo, título, descrição)
  - **Localização** (com integrações de APIs - ver seção dedicada)
  - Características (área, quartos, banheiros, etc)
  - Financeiro (preços, condomínio, IPTU)
  - Comercial (status, agente, visibilidade)
  - Proprietário
  - IA & Matching
  - Mídia (upload de imagens)
- **Listagem** com filtros avançados
- **Visualização detalhada** com mapa do Google Maps
- **Upload de imagens** via Cloudinary
- **Máscaras de moeda** em tempo real

### 5. Gestão de Visitas

- **Listagem** com visualização por calendário
- **Criação/edição** de visitas
- **Status tracking** (Agendada, Realizada, Cancelada, Remarcada)
- **Detecção automática** via IA nos atendimentos
- **Modal de confirmação** quando IA detecta intenção de visita
- **Navegação direta** para criação de visita

### 6. Gestão de Vendas

- **Listagem** com estatísticas
- **Criação** com múltiplos métodos de pagamento
- **Máscaras de moeda** em tempo real
- **Busca inteligente** de clientes e imóveis
- **Cálculo automático** de comissões
- **Filtros** por tipo, status, cliente

### 7. Dashboard Gerencial

- **Métricas principais** (Total Clientes, Valor Total de Vendas, Taxa de Conversão, Lead Score Médio)
- **Funil de vendas** visual
- **Gráfico de crescimento** de clientes (últimos 6 meses)
- **Distribuição de origem** de leads
- **Top 5 corretores** por performance
- **Insights da IA**
- **Alertas e oportunidades**
- **Clientes em risco**

### 8. Análise de Perdas

- **Registro de perdas** com motivo e feedback
- **Análise estatística** de perdas
- **Visualização** de tendências

### 9. Gestão de Usuários (Apenas Gestores)

- **Listagem** de usuários
- **Atribuição de roles**
- **Criação** de novos usuários

---

## 🌐 Integrações de APIs

### Formulário de Imóveis - Aba Localização

O formulário de imóveis possui uma aba de **Localização** com integrações inteligentes para facilitar o cadastro:

#### 1. **ViaCEP API** - Busca por CEP

**Funcionalidade:**
- Busca automática de endereço a partir do CEP
- Preenchimento automático de:
  - Rua/Logradouro
  - Bairro
  - Cidade
  - Estado (UF)
  - CEP formatado

**Como funciona:**
1. Usuário digita o CEP (com ou sem formatação)
2. Sistema formata automaticamente para `00000-000`
3. Ao pressionar Enter ou clicar em "Buscar", faz requisição para `https://viacep.com.br/ws/{cep}/json/`
4. Preenche automaticamente os campos do formulário
5. Opcionalmente busca coordenadas geográficas via Nominatim

**Implementação:**
```typescript
// src/modules/properties/pages/PropertyFormPage.vue
const handleSearchCep = async () => {
  const cep = cepSearch.value.replace(/\D/g, '')
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
  const data = await response.json()
  // Preenche campos automaticamente
}
```

#### 2. **Google Geocoding API** - Busca por Endereço

**Funcionalidade:**
- Busca endereço completo a partir de texto livre
- Suporta:
  - Endereços completos ("Rua X, 123, Bairro Y, Cidade Z")
  - Nomes de lugares ("Shopping Center, São Paulo")
  - URLs do Google Maps (detecta e extrai coordenadas)
- Retorna:
  - Endereço completo parseado
  - Coordenadas geográficas (latitude/longitude)
  - CEP (quando disponível)

**Como funciona:**
1. Usuário digita endereço ou URL do Google Maps
2. Sistema envia para backend que processa via Google Geocoding API
3. Backend retorna dados estruturados
4. Formulário é preenchido automaticamente

**Implementação:**
```typescript
// Via backend: /properties/geocode/address
const handleGeocodeAddress = async () => {
  const addressData = await propertiesService.geocodeAddress(addressSearch.value)
  // Preenche campos com dados geocodificados
}
```

#### 3. **IBGE API** - Lista de Cidades por Estado

**Funcionalidade:**
- Carrega automaticamente lista de cidades quando estado é selecionado
- Lista ordenada alfabeticamente
- Autocomplete para facilitar seleção

**Como funciona:**
1. Usuário seleciona estado (UF)
2. Sistema busca cidades via `https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios`
3. Lista de cidades é carregada no campo de seleção
4. Usuário pode buscar e selecionar cidade

**Implementação:**
```typescript
const loadCitiesForState = async (uf: string) => {
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
  )
  const data = await response.json()
  availableCities.value = data.map((city: { nome: string }) => city.nome)
}
```

#### 4. **Nominatim (OpenStreetMap)** - Coordenadas Geográficas

**Funcionalidade:**
- Busca coordenadas geográficas quando CEP é encontrado via ViaCEP
- Fallback gratuito para obter latitude/longitude
- Não requer API key

**Como funciona:**
- Após buscar CEP via ViaCEP, sistema tenta obter coordenadas via Nominatim
- Se bem-sucedido, preenche campos de latitude/longitude
- Se falhar, não impede o cadastro (coordenadas são opcionais)

**Benefícios das Integrações:**

✅ **Redução de erros** - Dados preenchidos automaticamente são mais precisos  
✅ **Economia de tempo** - Não precisa digitar endereço completo manualmente  
✅ **Melhor UX** - Interface intuitiva com feedback visual  
✅ **Dados completos** - Coordenadas geográficas para integração com mapas  
✅ **Validação automática** - CEP e endereços são validados pelas APIs  

---

## 🔒 Rotas e Proteção de Acesso

### Sistema de Rotas

A aplicação utiliza **Vue Router 4** com guards de navegação para proteger rotas baseadas em autenticação e roles.

### Rotas Públicas

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/login` | `LoginPage.vue` | Página de login |
| `/register` | `RegisterPage.vue` | Registro de usuário (apenas gestores) |
| `/auth/google/callback` | `OAuthCallbackPage.vue` | Callback OAuth Google |

### Rotas Protegidas (Requerem Autenticação)

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/clients` | `ClientsListPage.vue` | Listagem de clientes |
| `/clients/:id` | `ClientDetailsPage.vue` | Detalhes do cliente |
| `/attendances` | `AttendanceListPage.vue` | Listagem de atendimentos |
| `/attendances/create` | `AttendanceCreatePage.vue` | Criar atendimento |
| `/attendances/:id` | `AttendanceDetailsPage.vue` | Detalhes do atendimento |
| `/attendances/:id/edit` | `AttendanceCreatePage.vue` | Editar atendimento |
| `/properties` | `PropertiesListPage.vue` | Listagem de imóveis |
| `/properties/create` | `PropertyFormPage.vue` | Criar imóvel |
| `/properties/:id` | `PropertyDetailsPage.vue` | Detalhes do imóvel |
| `/properties/:id/edit` | `PropertyFormPage.vue` | Editar imóvel |
| `/visits` | `VisitsListPage.vue` | Listagem de visitas |
| `/visits/create` | `VisitFormPage.vue` | Criar visita |
| `/visits/:id` | `VisitDetailsPage.vue` | Detalhes da visita |
| `/visits/:id/edit` | `VisitFormPage.vue` | Editar visita |

### Rotas Exclusivas para Gestores

Estas rotas requerem autenticação **E** role de **gestor**:

| Rota | Componente | Descrição | Meta |
|------|------------|-----------|------|
| `/` | `DashboardPage.vue` | Dashboard gerencial | `requiresManager: true` |
| `/users` | `UsersPage.vue` | Gestão de usuários | `requiresManager: true` |
| `/sales` | `SalesListPage.vue` | Gestão de vendas | `requiresManager: true` |
| `/losses` | `LossAnalysisPage.vue` | Análise de perdas | `requiresManager: true` |

### Navigation Guards

O sistema implementa guards que:

1. **Verificam autenticação** antes de acessar rotas protegidas
2. **Validam token** e carregam dados do usuário
3. **Verificam roles** para rotas exclusivas de gestor
4. **Redirecionam** automaticamente:
   - Não autenticado → `/login`
   - Sem role de gestor tentando acessar rota de gestor → `/clients`
   - Autenticado tentando acessar login → Dashboard ou Clients

**Implementação:**
```typescript
// src/app/router/index.ts
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  // Verifica se rota requer autenticação
  if (to.meta.requiresAuth !== false) {
    // Valida token e carrega usuário
    if (!authStore.isAuthenticated) {
      next({ name: 'login' })
      return
    }
    
    // Verifica se rota requer role de gestor
    if (to.meta.requiresManager) {
      if (!authStore.userRoles.includes('gestor')) {
        next({ name: 'clients' })
        return
      }
    }
  }
  
  next()
})
```

---

## 🧩 Componentes Reutilizáveis

### 1. SearchSelectDialog

**Descrição:** Dialog de busca e seleção genérico para clientes, imóveis, corretores, etc.

**Features:**
- Busca com debounce
- Paginação automática
- Loading states
- Empty states
- Seleção única ou múltipla

**Uso:**
```vue
<SearchSelectDialog
  v-model="showDialog"
  title="Buscar Cliente"
  :items="searchItems"
  :loading="isLoading"
  :total-items="totalItems"
  @search="handleSearch"
  @select="handleSelect"
/>
```

### 2. VisitDetectionDialog

**Descrição:** Modal exibido quando IA detecta intenção de visita em um atendimento.

**Features:**
- Exibe dados detectados (data, hora, imóvel, notas)
- Botão de confirmação que cria visita automaticamente
- Navegação direta para formulário de visita

### 3. ClientCreateDialog

**Descrição:** Dialog para criar/editar clientes.

**Features:**
- Validação de formulário
- Máscara de telefone em tempo real
- Classificação automática pela IA

### 4. PropertyImageUpload

**Descrição:** Componente para upload de imagens de imóveis.

**Features:**
- Preview de imagem
- Upload via Cloudinary
- Validação de tipo e tamanho

### 5. AiChatWidget

**Descrição:** Widget de chat com IA sobre clientes.

**Features:**
- Interface de chat
- Contexto completo do cliente
- Respostas da IA em tempo real

### 6. ClientJourneyPanel

**Descrição:** Painel exibindo análise completa da jornada do cliente pela IA.

**Features:**
- Estágio atual da jornada
- Próximas ações sugeridas
- Saúde do relacionamento

---

## 💰 Máscaras de Entrada

### Máscara de Moeda em Tempo Real

**Funcionalidade:** Formatação automática de valores monetários enquanto o usuário digita, similar a aplicativos bancários.

**Características:**
- Formatação em tempo real: `1234567` → `12.345,67`
- Trata últimos 2 dígitos como centavos
- Mantém posição do cursor
- Suporte a valores grandes

**Implementação:**
```typescript
// src/shared/utils/masks.ts
export function formatCurrencyInputRealTime(value: string): string {
  const digits = value.replace(/\D/g, '')
  const numValue = parseInt(digits, 10) / 100
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue)
}
```

**Uso:**
```vue
<v-text-field
  v-model="priceFormatted"
  @input="handlePriceInput($event)"
  @blur="handlePriceBlur()"
/>
```

**Onde é usado:**
- Formulário de imóveis (Preço de Venda, Preço de Aluguel, Condomínio, IPTU)
- Formulário de vendas (Valor da Venda, Valores dos Métodos de Pagamento)

### Máscara de Telefone

**Funcionalidade:** Formatação automática de números de telefone brasileiros.

**Formato:**
- Fixo: `(11) 3456-7890`
- Celular: `(11) 98765-4321`

**Uso:**
```vue
<v-text-field
  v-model="phoneFormatted"
  @input="handlePhoneInput"
  @blur="formData.phone = parsePhone(phoneFormatted)"
/>
```

### Máscara de CEP

**Funcionalidade:** Formatação automática de CEP.

**Formato:** `00000-000`

---

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js 18+**
- **npm** ou **yarn**

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# URL do backend
VITE_API_URL=http://localhost:8000

# URL do frontend (para OAuth callback)
VITE_FRONTEND_URL=http://localhost:5173
```

### 3. Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 4. Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`

### 5. Preview da Build

```bash
npm run preview
```

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com hot-reload |
| `npm run build` | Gera build de produção otimizado |
| `npm run preview` | Preview da build de produção localmente |

---

## 🗂️ Arquitetura de Estado

### Pinia Stores

#### Auth Store (`auth.store.ts`)

**Estado:**
- `token`: Token JWT
- `user`: Dados do usuário atual
- `userRoles`: Roles do usuário
- `isAuthenticated`: Status de autenticação

**Ações:**
- `login(email, password)`: Login com email/senha
- `loginWithGoogle()`: Iniciar OAuth Google
- `logout()`: Fazer logout
- `fetchCurrentUser()`: Buscar dados do usuário atual
- `setToken(token)`: Definir token
- `getToken()`: Obter token do localStorage

**Getters:**
- `isManager`: Verifica se usuário é gestor
- `isAuthenticated`: Verifica se está autenticado

---

## 🎨 Destaques Técnicos

### 1. Composition API

Todos os componentes utilizam **Composition API** do Vue 3, proporcionando:
- Melhor organização do código
- Reutilização de lógica
- Type safety com TypeScript
- Performance otimizada

### 2. TypeScript

- **100% tipado** com TypeScript
- Interfaces para todos os modelos de dados
- Type safety em serviços e componentes
- Autocomplete completo no IDE

### 3. Componentes Reutilizáveis

- **SearchSelectDialog**: Busca genérica reutilizável
- **Máscaras**: Funções utilitárias para formatação
- **Services**: Camada de abstração para APIs

### 4. Responsividade

- **Mobile-first** approach
- **Breakpoints** do Vuetify
- **Layout adaptativo** com grid system

### 5. Performance

- **Code splitting** automático pelo Vite
- **Lazy loading** de rotas
- **Tree shaking** de dependências não utilizadas
- **Otimização de imagens** via Cloudinary

### 6. UX/UI

- **Loading states** em todas as operações assíncronas
- **Feedback visual** com snackbars e alerts
- **Validação em tempo real** de formulários
- **Empty states** informativos
- **Animações suaves** com transições do Vue

### 7. Integração com Backend

- **Cliente HTTP centralizado** (`api.ts`)
- **Interceptors** para adicionar token automaticamente
- **Tratamento de erros** padronizado
- **Refresh token** (implementável)

### 8. Detecção Automática pela IA

- **VisitDetectionDialog**: Exibido quando IA detecta intenção de visita
- **Navegação automática** para criação de visita
- **Preenchimento automático** de dados detectados

---

## 🔄 Fluxo de Dados

```
Usuário (Interface)
    ↓
Componente Vue
    ↓
Service (API Client)
    ↓
Backend API
    ↓
Resposta
    ↓
Store (Pinia) - Opcional
    ↓
Componente (Reatividade)
```

---

## 📱 Responsividade

A aplicação é totalmente responsiva com breakpoints:

- **xs**: < 600px (Mobile)
- **sm**: 600px - 960px (Tablet)
- **md**: 960px - 1264px (Desktop pequeno)
- **lg**: 1264px - 1904px (Desktop)
- **xl**: > 1904px (Desktop grande)

---

## 🎯 Melhores Práticas Implementadas

✅ **Separação de responsabilidades** (components, services, utils)  
✅ **Reutilização de código** (componentes e funções compartilhadas)  
✅ **Type safety** (TypeScript em todo o projeto)  
✅ **Validação de formulários** (regras e feedback visual)  
✅ **Tratamento de erros** (try/catch e mensagens amigáveis)  
✅ **Loading states** (feedback durante operações assíncronas)  
✅ **Acessibilidade** (labels, ARIA, navegação por teclado)  
✅ **Performance** (lazy loading, code splitting)  

---

## 🚀 Próximos Passos / Melhorias Futuras

- [ ] Testes unitários com Vitest
- [ ] Testes E2E com Playwright
- [ ] PWA (Progressive Web App)
- [ ] Notificações push
- [ ] Modo offline
- [ ] Internacionalização (i18n)
- [ ] Tema dark/light
- [ ] Exportação de relatórios (PDF/Excel)

---

## 📝 Notas de Desenvolvimento

### Estrutura de Serviços

Todos os serviços seguem o mesmo padrão:

```typescript
class ServiceName {
  async methodName(params): Promise<ReturnType> {
    return apiClient.get|post|put|delete<ReturnType>(url, data)
  }
}

export const serviceName = new ServiceName()
```

### Padrão de Componentes

Componentes utilizam Composition API com `<script setup>`:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
// Lógica do componente
</script>
```

---

## 📚 Documentação Adicional

- [Vue.js 3 Documentation](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

---

<div align="center">

**Desenvolvido com ❤️ usando Vue.js 3, TypeScript e Vuetify**

[⬆ Voltar ao topo](#-frontend---sistema-crm-imobiliário-com-inteligência-artificial)

</div>
