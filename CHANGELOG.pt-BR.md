# 📋 Registro de Mudanças (Changelog)

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

**🌐 Idiomas:** [🇧🇷 Português](./CHANGELOG.pt-BR.md) | [🇺🇸 English](./CHANGELOG.md)

---

## [2.0.0] - 03/11/2025 🚀

### 🎉 Lançamento Maior - Reescrita Completa da Plataforma

Esta versão representa uma **reescrita completa** do portfólio CatBytes, migrando de HTML/CSS/JS vanilla para um stack moderno e pronto para produção com recursos avançados.

### ✨ Adicionado

#### Arquitetura Central
- **Next.js 15.5.6** framework com App Router e TypeScript strict mode
- **Progressive Web App (PWA)** com experiência de aplicativo móvel nativo
- **Internacionalização (i18n)** - Suporte completo para Português (pt-BR) e Inglês (en-US)
- **Tema Claro/Escuro** com detecção de preferência do sistema
- **Service Worker** com estratégias de cache offline

#### Recursos PWA Nativos
- Navegação inferior estilo iOS/Android (apenas em modo PWA standalone)
- Design glassmorphism com efeitos backdrop-blur
- Header estilo app com logo e compartilhamento nativo
- Menu drawer profissional com design gradiente
- Banner de instalação com instruções específicas por plataforma (iOS/Android)
- Detecção de modo standalone e renderização condicional

#### Sistema de Blog com IA
- **Gerador de blog alimentado por IA** usando OpenAI GPT-4o-mini
- **Geração automática de imagens de capa** com DALL-E 3
- **Tradução automática** - Posts gerados em PT-BR, auto-traduzidos para EN-US
- Feed de blog com scroll infinito e filtragem
- Modal de post com conteúdo completo e metadados
- Otimização SEO com meta tags dinâmicas
- Cálculo de tempo de leitura
- Gerenciamento de categorias e tags

#### Sistema de Newsletter
- **Double opt-in** com fluxo de verificação por email
- **Entrega automática de email** quando novos posts são publicados
- **Integração com Resend** para entrega profissional de emails
- **Banco de dados Supabase** para gerenciamento de assinantes
- Templates de email responsivos com otimização mobile
- Funcionalidade de cancelamento de inscrição com confirmação em um clique
- Suporte i18n para todas as comunicações por email

#### Seção de Recursos de IA
- Ferramenta de adoção de gatos (encontre seu par perfeito)
- Identificador de raças de gatos com upload de imagem
- Gerador de anúncios para produtos/serviços com insights de estratégia
- Abas interativas com animações suaves

#### Integração com GitHub
- Exibição de estatísticas do GitHub em tempo real
- Contagem de commits, rastreamento de repositórios
- Estatísticas de linguagens dos repositórios
- Cards profissionais de estatísticas na seção hero

#### Design Responsivo
- Abordagem mobile-first com 3 breakpoints
- Seção hero com background particles.js (mobile)
- Imagem grande do gato sentado posicionada na parte inferior do hero
- Cards de estatísticas do GitHub integrados no hero mobile
- Suporte a gestos touch (navegação por swipe)

#### Performance & SEO
- Geração Estática de Sites (SSG) para todas as páginas
- Otimização de imagem com formatos AVIF/WebP
- Suporte a CDNs de imagens remotas (DALL-E, Unsplash, Cloudinary, Dev.to, Hashnode)
- Lazy loading para imagens e componentes
- Indicador de progresso de scroll
- Botão voltar ao topo com scroll suave

### 🔧 Alterado

#### Migração de 1.x para 2.0
- **Framework**: HTML/CSS/JS Vanilla → Next.js 15 + TypeScript
- **Estilização**: Módulos CSS customizados → Tailwind CSS 3.4 com tema personalizado
- **Gerenciamento de Estado**: Manipulação DOM → React hooks + Framer Motion
- **Roteamento**: Página única → App Router com layouts aninhados
- **API**: Funções Serverless → Next.js API Routes (Edge Runtime)
- **Animações**: ScrollReveal → Framer Motion (transições de página, gestos)
- **Ícones**: Font Awesome → Lucide React (tree-shakeable)

#### Melhorias de UI/UX
- Sistema de design glassmorphism profissional
- Backgrounds gradientes (roxo-para-azul, gradientes rosa)
- Transições de página suaves com Framer Motion
- Navegação mobile aprimorada (abas inferiores em vez de menu toggle)
- Validação de formulário melhorada com feedback em tempo real
- Botão WhatsApp com animação flutuante

### 🐛 Corrigido

#### Build & Deploy
- Resolução de importação TypeScript para barrel exports
- Verificação de compatibilidade SSR do navigator.share
- Prevenção de hydration mismatch
- Configuração de cache de otimização de imagem
- Registro do service worker em produção

#### Responsividade Mobile
- Posicionamento do gato no hero (sentado na parte inferior com overflow-visible)
- Visibilidade da navegação inferior (apenas PWA, oculta no navegador mobile)
- Conflitos de gestos touch com scroll
- Overflow de modal em telas pequenas
- Renderização de template de email em clientes mobile

#### TypeScript & Lint
- Removidos 81 avisos TypeScript/ESLint
- Corrigida resolução de módulos com barrel exports (`components/layout/index.ts`)
- Adicionados tipos apropriados para todas as rotas API
- Resolvidos problemas SSR do navigator.share

### 🔒 Segurança

- **Validação de variáveis de ambiente** para todas as chaves de API
- **Rate limiting de API** com middleware edge
- **Sanitização de entrada** para todos os envios de formulário
- **Configuração CORS** para rotas API
- **Headers de Content Security Policy**
- **Gerenciamento seguro de sessão** para assinaturas de newsletter
- **Validação de email** com bloqueio de domínios descartáveis

### 🎨 Sistema de Design

#### Cores
- Roxo Principal: `#9333ea` (catbytes-purple)
- Azul Secundário: `#3b82f6` (catbytes-blue)
- Rosa Accent: `#ec4899` (catbytes-pink)
- Glassmorphism: `bg-white/80 backdrop-blur-xl`

#### Tipografia
- Títulos: Comfortaa (Google Fonts)
- Corpo: Inter (Google Fonts)
- Código: Fira Code (monospace)

#### Animações
- Transições de página: Fade + slide (300ms)
- Efeitos hover: Scale(1.05) + shadow
- Estados de loading: Animação pulse
- Animações de scroll: Intersection Observer

### 📦 Dependências

#### Core
- `next@15.5.6` - Framework React
- `react@18.3.1` - Biblioteca UI
- `typescript@5.6.3` - Segurança de tipos
- `tailwindcss@3.4.14` - CSS utility-first

#### UI & Animação
- `framer-motion@11.18.2` - Animações
- `lucide-react@0.462.0` - Ícones
- `embla-carousel-react@8.3.0` - Carrosséis
- `next-themes@0.4.3` - Troca de temas

#### Internacionalização
- `next-intl@3.26.5` - Roteamento i18n & traduções

#### IA & APIs
- `openai@6.7.0` - GPT-4 & DALL-E 3
- `@google/generative-ai@0.21.0` - Gemini AI
- `@supabase/supabase-js@2.78.0` - Banco de dados
- `resend@6.4.0` - Entrega de email

#### PWA
- `next-pwa@5.6.0` - Geração de service worker

#### Formulários & Validação
- `react-hook-form@7.53.2` - Gerenciamento de formulários
- `zod@3.23.8` - Validação de schemas

### 📊 Métricas de Performance

- Tempo de build: ~14s (compilação otimizada)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Pontuação Lighthouse: 95+ (Performance, Acessibilidade, Melhores Práticas, SEO)
- Tamanho do bundle: Otimizado com tree-shaking e code splitting

### 🗂️ Estrutura do Projeto

```
catbytes-2.0/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Rotas de locale i18n
│   ├── api/               # Rotas API (Edge Runtime)
│   ├── globals.css        # Estilos globais
│   └── layout.tsx         # Layout raiz
├── components/            # Componentes React
│   ├── app/              # Componentes shell PWA
│   ├── blog/             # Componentes específicos do blog
│   ├── layout/           # Componentes de layout (Header, Footer)
│   ├── newsletter/       # Componentes de newsletter
│   ├── sections/         # Seções de página (Hero, About, Projects, etc.)
│   └── ui/               # Componentes UI reutilizáveis
├── lib/                  # Funções utilitárias
├── messages/             # Arquivos de tradução i18n
│   ├── pt-BR.json
│   └── en-US.json
├── public/               # Assets estáticos
│   ├── images/
│   ├── favicon-*.png
│   ├── manifest.json
│   └── sw.js             # Service worker
├── next.config.js        # Configuração Next.js
├── tailwind.config.ts    # Configuração Tailwind
└── tsconfig.json         # Configuração TypeScript
```

### 🔄 Guia de Migração (1.x → 2.0)

Se você está atualizando do CatBytes 1.x:

1. **Faça backup das suas variáveis de ambiente** do Netlify
2. **Exporte seus dados** se você tinha integrações customizadas
3. **Atualize as dependências**: Execute `npm install` no novo projeto
4. **Configure o ambiente**:
   ```env
   OPENAI_API_KEY=sua_chave_openai
   GOOGLE_GENERATIVE_AI_API_KEY=sua_chave_gemini
   SUPABASE_URL=sua_url_supabase
   SUPABASE_ANON_KEY=sua_chave_supabase_anon
   RESEND_API_KEY=sua_chave_resend
   GITHUB_TOKEN=seu_token_github (opcional)
   ```
5. **Deploy no Vercel** (recomendado) ou Netlify
6. **Teste a instalação PWA** em dispositivos móveis

### 🎯 Mudanças Incompatíveis (Breaking Changes)

- Funções Serverless removidas (substituídas por Next.js API Routes)
- Módulos CSS substituídos por classes utilitárias Tailwind
- HTML estático removido (agora totalmente baseado em React)
- Antigo theme switcher incompatível (use novo next-themes)
- Formulário de contato agora requer chave API do Resend

---

## [1.3.0] - 20/08/2025

### Adicionado
- Contador dinâmico de caracteres (máximo 2000) no campo de mensagem
- Texto auxiliar abaixo do label de mensagem que desaparece ao digitar

### Alterado
- Layout do formulário de contato: contador de caracteres reposicionado para a linha do label
- Estilo do placeholder: "Sua mensagem..." agora desaparece ao digitar

### Corrigido
- Bloqueio de envio de mensagem vazia ou apenas com espaços
- Validação de email via API Routes:
  - Verificação de formato e limpeza de caracteres invisíveis
  - Bloqueio de domínios descartáveis conhecidos
  - Correção automática para typos comuns (`gmil.com` → `gmail.com`, etc.)
  - Sugestões de provedores válidos usando distância Levenshtein (fuzzy matching)
  - Verificação de registros MX para domínios inexistentes

### Segurança
- Reforço contra envios automatizados/bots com honeypot invisível (`_gotcha`)
- Prevenção de envio com email malformado ou domínio inválido

---

## [1.2.0] - 10/08/2025

### Adicionado
- Ícones com suporte ao modo claro/escuro (gato, livro, lâmpada, coração, robô, caixa de papelão)
- Escala de amarelo personalizada para lâmpada (modo claro/escuro)
- Melhorias visuais nos títulos principais e seções

### Alterado
- Ajustes de cor nos títulos e links para melhor contraste em ambos os temas
- Estilização consistente em toda a página
