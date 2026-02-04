# Frontend - Astrocode Backend

Projeto frontend desenvolvido com Vue 3, Vite, TypeScript, Vuetify 3, Pinia e Vue Router.

## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo
- **Vite** - Build tool e dev server
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vuetify 3** - Framework de componentes Material Design
- **Pinia** - Gerenciamento de estado
- **Vue Router** - Roteamento para aplicações Vue

## 📁 Estrutura do Projeto

```
src/
  app/
    layout/
      - AppLayout.vue      # Layout principal da aplicação
      - AuthLayout.vue      # Layout para páginas de autenticação
    router/
      - index.ts           # Configuração do Vue Router
    store/
      - index.ts           # Configuração do Pinia
  modules/
    auth/
      pages/
        - LoginPage.vue    # Página de login
    dashboard/
      pages/
        - DashboardPage.vue # Página do dashboard
  shared/
    components/            # Componentes compartilhados
    services/              # Serviços compartilhados
    utils/                 # Utilitários compartilhados
  plugins/
    - vuetify.ts          # Configuração do Vuetify
  App.vue                 # Componente raiz
  main.ts                 # Entry point da aplicação
```

## 🛠️ Instalação

```bash
npm install
```

## 🏃 Executar em Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## 📦 Build para Produção

```bash
npm run build
```

## 🔍 Preview da Build

```bash
npm run preview
```

## 🗺️ Rotas

- `/login` - Página de login (AuthLayout)
- `/` - Dashboard (AppLayout)

## 📝 Notas

- Este projeto usa Composition API em todos os componentes
- Vuetify 3 está configurado com tema padrão e ícones Material Design
- Pinia está configurado e pronto para uso
- Vue Router está configurado com rotas básicas
- Estrutura preparada para expansão futura

## 🔄 Próximos Passos

- Implementar autenticação
- Configurar Axios para chamadas de API
- Criar stores do Pinia
- Adicionar mais páginas e componentes
