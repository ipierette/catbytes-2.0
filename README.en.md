<div align="center">

<p align="center">
  <img src="./public/images/catbytes-logo.png" width="150" alt="CatBytes Logo" style="margin: 0 20px;" />
  <img src="./public/images/logo-desenvolvedora.png" width="150" alt="Developer Logo" style="margin: 0 20px;" />
</p>

# CatBytes 2.0 — Professional Full Stack Portfolio

### [🇧🇷 Português](./README.md) | 🇺🇸 English

[![Deploy Status](https://img.shields.io/badge/deploy-live-success?style=for-the-badge&logo=vercel)](https://catbytes.site)
[![Version](https://img.shields.io/badge/version-2.0.0-purple?style=for-the-badge)](./CHANGELOG.md)
[![License](https://img.shields.io/badge/license-Custom-blue?style=for-the-badge)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)

**[✨ View Demo](https://catbytes.site)** • **[📄 Full Changelog](./CHANGELOG.md)** • **[📧 Contact](mailto:ipierette2@gmail.com)**

</div>

---

## 📋 Table of Contents

- [🎯 About the Project](#-about-the-project)
- [✨ What's New in 2.0](#-whats-new-in-20)
- [🚀 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Installation & Usage](#-installation--usage)
- [🌍 PWA - Progressive Web App](#-pwa---progressive-web-app)
- [🤖 AI Integrations](#-ai-integrations)
- [🗂️ Project Structure](#️-project-structure)
- [🎨 Design System](#-design-system)
- [📊 Performance](#-performance)
- [🔒 Security](#-security)
- [📜 License](#-license)
- [👩‍💻 Author](#-author)

---

## 🎯 About the Project

**CatBytes** is a professional full stack portfolio showcasing the integration of modern technologies to create high-quality web experiences. The project combines **Next.js 15**, **TypeScript**, **Artificial Intelligence**, and **Progressive Web App** features in a bilingual application (PT-BR/EN-US) with advanced capabilities.

### 🎨 Design Philosophy

The project features a unique visual identity inspired by the world of cats 🐱 and programming, presenting:

- **Glassmorphism** with backdrop-blur effects
- **Vibrant gradients** (purple → blue, pink → purple)
- **Smooth animations** with Framer Motion
- **Mobile-first responsiveness**
- **Accessibility** (WCAG 2.1 AA)

---

## ✨ What's New in 2.0

### 🔄 Complete Rewrite

Version 2.0 represents a **complete transformation** of the original project:

| Aspect | Version 1.x | Version 2.0 |
|---------|-----------|-----------|
| **Framework** | Vanilla HTML/CSS/JS | Next.js 15 + TypeScript |
| **Styling** | CSS Modules | Tailwind CSS 3.4 |
| **Animations** | ScrollReveal | Framer Motion |
| **Routing** | Single Page | App Router + i18n |
| **API** | Serverless Functions | Next.js API Routes (Edge) |
| **Icons** | Font Awesome | Lucide React |
| **Deploy** | Vercel | Vercel (optimized) |

### 🎉 Main New Features

#### 📱 **Native Progressive Web App**
- Installable as native app on iOS and Android
- Native app-style bottom navigation (PWA mode only)
- Professional glassmorphism design
- Offline functionality with Service Worker

#### 📝 **AI-Powered Blog System**
- Automatic article generation with GPT-4o-mini
- Cover image creation with DALL-E 3
- Automatic translation PT-BR ↔ EN-US
- Infinite scroll feed with category filters
- SEO optimized for each post

#### 📧 **Complete Newsletter System**
- Double opt-in with email verification
- Automatic delivery of new posts to subscribers
- Professional responsive templates
- Management via Supabase

#### 🌐 **Full Internationalization**
- Complete support for Portuguese and English
- Dynamic language switching without reload
- Localized URLs (catbytes.site/pt-BR, catbytes.site/en-US)
- All components and emails translated

---

## 🚀 Features

### 🎨 User Interface

- ✅ **Responsive Design** - Mobile-first with 3 breakpoints (sm, md, lg)
- ✅ **Light/Dark Theme** - Smooth switching with system preference detection
- ✅ **Page Animations** - Smooth route transitions with Framer Motion
- ✅ **Smart Navigation** - Bottom nav in PWA, traditional header in browser
- ✅ **Dynamic Hero** - Sitting cat with animated particles and GitHub stats
- ✅ **Project Gallery** - Interactive cards with hover effects and lazy loading

### 📱 PWA Features

- ✅ **Native Installation** - Banner with platform-specific instructions (iOS/Android)
- ✅ **Offline First** - Page and image caching for offline use
- ✅ **App Shell** - Instant interface loading
- ✅ **Splash Screen** - Custom splash screen
- ✅ **Touch Gestures** - Swipe navigation on mobile devices

### 🤖 AI Features

- ✅ **Cat Adoption** - Find your ideal cat with AI
- ✅ **Breed Identification** - Photo upload for breed identification
- ✅ **Ad Generator** - Create advertising copy with strategy
- ✅ **Automated Blog** - AI-generated posts with images

### 📊 Integrations

- ✅ **GitHub Stats** - Real-time repository statistics
- ✅ **Newsletter** - Complete subscription and delivery system
- ✅ **Analytics** - View and interaction tracking
- ✅ **WhatsApp** - Floating button for direct contact

---

## 🛠️ Tech Stack

### 🎯 Core

```json
{
  "framework": "Next.js 15.5.6",
  "language": "TypeScript 5.6.3",
  "styling": "Tailwind CSS 3.4.14",
  "ui": "React 18.3.1"
}
```

### 🎨 UI & Animations

- **Framer Motion** `11.18.2` - Animations and transitions
- **Lucide React** `0.462.0` - Modern tree-shakeable icons
- **Embla Carousel** `8.3.0` - Smooth carousels
- **Next Themes** `0.4.3` - Theme management

### 🌍 Internationalization

- **Next Intl** `3.26.5` - i18n with automatic routing

### 🤖 AI & APIs

- **OpenAI** `6.7.0` - GPT-4o-mini + DALL-E 3
- **Google Generative AI** `0.21.0` - Gemini Pro
- **Supabase** `2.78.0` - PostgreSQL Database
- **Resend** `6.4.0` - Professional email delivery

### 📱 PWA

- **Next PWA** `5.6.0` - Service Worker and manifest

### 📝 Forms & Validation

- **React Hook Form** `7.53.2` - Form management
- **Zod** `3.23.8` - TypeScript-first schema validation

---

## 📦 Installation & Usage

### 📋 Prerequisites

- **Node.js** 18.17 or higher
- **npm** or **yarn** or **pnpm**
- **Git**

### 🔧 Installation

```bash
# 1. Clone the repository
git clone https://github.com/ipierette/catbytes-2.0.git

# 2. Navigate to directory
cd catbytes-2.0

# 3. Install dependencies
npm install
# or
yarn install
# or
pnpm install

# 4. Configure environment variables
cp .env.example .env.local

# 5. Edit .env.local file with your keys
```

### 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI (for blog and content generation)
OPENAI_API_KEY=sk-proj-...

# Google Gemini (for AI features)
GOOGLE_GENERATIVE_AI_API_KEY=AI...

# Supabase (database)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Resend (email delivery)
RESEND_API_KEY=re_...

# GitHub (statistics - optional)
GITHUB_TOKEN=ghp_... (optional, increases rate limit)

# URLs
NEXT_PUBLIC_BASE_URL=https://catbytes.site
```

### 🚀 Run Locally

```bash
# Development
npm run dev

# Production build
npm run build

# Start production
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

### 🌐 Access

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 PWA - Progressive Web App

### 📲 Installation

CatBytes can be installed as a native app:

#### **iOS (Safari)**
1. Open the site in Safari
2. Tap the share icon (square with arrow)
3. Scroll to "Add to Home Screen"
4. Tap "Add"

#### **Android (Chrome)**
1. Open the site in Chrome
2. Tap the three dots (⋮)
3. Select "Install app" or "Add to home screen"
4. Confirm installation

### ✨ PWA Features

- **🔌 Offline**: Works without internet after first visit
- **⚡ Fast**: Smart caching with Service Worker
- **📱 Native**: Bottom navigation only in app mode
- **🎨 Immersive**: No browser bar in fullscreen
- **🔔 Notifications**: (planned for v2.1)

### 🎯 Cache Strategies

```javascript
// Runtime caching configured
{
  urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|webp|avif|svg|ico)$/,
  handler: 'StaleWhileRevalidate',
  options: {
    cacheName: 'static-image-assets',
    expiration: {
      maxEntries: 64,
      maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
    }
  }
}
```

---

## 🤖 AI Integrations

### 📝 Automated Blog

Complete content generation system:

```typescript
// POST /api/blog/generate
{
  "topic": "Next.js 15 Performance",
  "category": "Tutorial",
  "keywords": ["nextjs", "performance", "web"]
}

// Response
{
  "id": "uuid",
  "title": "How to Optimize Performance in Next.js 15",
  "content": "...",
  "cover_image_url": "https://dalle-cdn/...",
  "translations": {
    "en-US": { ... }
  }
}
```

**Generation Flow:**
1. GPT-4o-mini generates article in PT-BR (1500-2000 words)
2. DALL-E 3 creates professional cover image
3. GPT-4o-mini translates to EN-US
4. Post saved to Supabase with both versions
5. Email sent to subscribers

### 🐱 Feline AI Features

#### **Cat Adoption**
```typescript
POST /api/adopt-cat
{
  "lifestyle": "active",
  "space": "apartment",
  "experience": "beginner"
}
// Returns ideal breed suggestion with explanation
```

#### **Breed Identification**
```typescript
POST /api/identify-cat
{
  "image": "base64_image_data"
}
// Returns identified breed + characteristics
```

#### **Ad Generator**
```typescript
POST /api/generate-ad
{
  "product": "Next.js Course",
  "target": "React Developers",
  "tone": "professional"
}
// Returns copy + posting strategy
```

---

## 🗂️ Project Structure

```
catbytes-2.0/
│
├── 📁 app/                       # Next.js App Router
│   ├── 📁 [locale]/             # Internationalized routes
│   │   ├── page.tsx             # Home (Hero + About + Projects)
│   │   ├── blog/                # Blog feed and posts
│   │   ├── projetos/            # Projects gallery
│   │   ├── sobre/               # About page
│   │   ├── ia-felina/           # AI features
│   │   └── layout.tsx           # Layout with locale
│   ├── 📁 api/                  # API Routes (Edge Runtime)
│   │   ├── blog/                # Blog CRUD + generation
│   │   ├── newsletter/          # Subscription + delivery
│   │   ├── adopt-cat/           # AI adoption
│   │   ├── identify-cat/        # AI identification
│   │   ├── generate-ad/         # AI ads
│   │   └── github-stats/        # GitHub statistics
│   ├── globals.css              # Global styles + Tailwind
│   ├── layout.tsx               # Root layout
│   └── sitemap.ts               # Dynamic sitemap
│
├── 📁 components/                # React components
│   ├── 📁 app/                  # PWA shell components
│   │   ├── app-shell.tsx        # Shell with bottom nav
│   │   ├── pwa-install-banner.tsx
│   │   ├── native-ui.tsx        # Native components
│   │   └── gestures.tsx         # Touch gestures
│   ├── 📁 blog/                 # Blog components
│   │   ├── post-card.tsx
│   │   ├── post-modal.tsx
│   │   └── blog-feed.tsx
│   ├── 📁 layout/               # Layout components
│   │   ├── header.tsx           # Traditional header
│   │   ├── footer.tsx           # Footer with logo
│   │   ├── desktop-layout.tsx   # Conditional layout
│   │   └── index.ts             # Barrel export
│   ├── 📁 newsletter/           # Newsletter components
│   │   └── newsletter-signup.tsx
│   ├── 📁 providers/            # Context providers
│   │   └── theme-provider.tsx   # Dark/Light theme
│   ├── 📁 sections/             # Page sections
│   │   ├── hero.tsx             # Main hero
│   │   ├── about.tsx            # About me
│   │   ├── projects.tsx         # Projects
│   │   ├── skills.tsx           # Skills
│   │   ├── ai-features.tsx      # AI features
│   │   └── contact.tsx          # Contact
│   └── 📁 ui/                   # Reusable UI components
│       ├── animated-particles.tsx
│       ├── back-to-top.tsx
│       ├── github-stats.tsx
│       ├── scroll-progress.tsx
│       └── whatsapp-button.tsx
│
├── 📁 lib/                       # Utilities
│   ├── api-security.ts          # Rate limiting
│   ├── security.ts              # Validations
│   ├── translation-service.ts   # AI translation
│   └── utils.ts                 # Helper functions
│
├── 📁 messages/                  # i18n translations
│   ├── pt-BR.json               # Portuguese
│   └── en-US.json               # English
│
├── 📁 public/                    # Static assets
│   ├── 📁 images/               # Optimized images
│   ├── favicon-*.png            # Favicons (6 sizes)
│   ├── apple-touch-icon.png     # iOS icon
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service Worker (generated)
│
├── 📁 i18n/                      # i18n config
│   ├── request.ts               # Request handler
│   └── routing.ts               # Routing config
│
├── 📄 next.config.js             # Next.js + PWA config
├── 📄 tailwind.config.ts         # Tailwind + theme config
├── 📄 tsconfig.json              # TypeScript config
├── 📄 middleware.ts              # i18n middleware
├── 📄 .env.local                 # Environment variables (not committed)
├── 📄 package.json               # Dependencies
├── 📄 CHANGELOG.md               # Change history
├── 📄 README.md                  # README (PT-BR)
├── 📄 README.en.md               # This file (EN-US)
└── 📄 LICENSE                    # Custom license
```

---

## 🎨 Design System

### 🎨 Color Palette

```css
/* Main Colors */
--catbytes-purple: #9333ea;  /* Main purple */
--catbytes-blue: #3b82f6;    /* Secondary blue */
--catbytes-pink: #ec4899;    /* Accent pink */

/* Gradients */
.gradient-purple-blue {
  background: linear-gradient(135deg, #9333ea, #3b82f6);
}

.gradient-pink-purple {
  background: linear-gradient(135deg, #ec4899, #9333ea);
}

/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

### 🔤 Typography

```css
/* Headings */
font-family: 'Comfortaa', cursive;
font-weight: 300, 400, 700;

/* Body */
font-family: 'Inter', sans-serif;
font-weight: 100-900 (variable);

/* Code */
font-family: 'Fira Code', monospace;
```

### ✨ Animations

```typescript
// Page Transitions
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
}

// Hover Effects
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}
```

### 📱 Breakpoints

```javascript
// Tailwind breakpoints
{
  'sm': '640px',   // Mobile large
  'md': '768px',   // Tablet
  'lg': '1024px',  // Desktop
  'xl': '1280px',  // Desktop large
  '2xl': '1536px'  // Desktop XL
}
```

---

## 📊 Performance

### ⚡ Lighthouse Metrics

```
Performance:    98/100 ⚡
Accessibility:  96/100 ♿
Best Practices: 100/100 ✅
SEO:           100/100 🎯
PWA:           100/100 📱
```

### 🚀 Implemented Optimizations

- ✅ **Image Optimization** - Automatic AVIF/WebP with next/image
- ✅ **Code Splitting** - Component lazy loading
- ✅ **Tree Shaking** - Optimized imports (Lucide React)
- ✅ **Static Generation** - SSG for all public pages
- ✅ **Edge Runtime** - API routes on edge for low latency
- ✅ **Font Optimization** - Google Fonts with display=swap
- ✅ **Bundle Size** - Gzip/Brotli compression
- ✅ **Service Worker** - Smart caching with Workbox

### 📈 Core Web Vitals

```
LCP (Largest Contentful Paint):    < 1.5s  ✅
FID (First Input Delay):            < 50ms  ✅
CLS (Cumulative Layout Shift):      < 0.1   ✅
FCP (First Contentful Paint):       < 1.0s  ✅
TTI (Time to Interactive):          < 3.0s  ✅
```

---

## 🔒 Security

### 🛡️ Implemented Measures

#### **Input Validation**
```typescript
// Validation with Zod
const EmailSchema = z.string().email().min(5).max(255);
const sanitizedEmail = EmailSchema.parse(userInput);
```

#### **Rate Limiting**
```typescript
// API Middleware
const rateLimiter = new Map<string, { count: number; resetAt: number }>();
// Limit: 10 requests / 60 seconds per IP
```

#### **Security Headers**
```javascript
// next.config.js
headers: [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'origin-when-cross-origin' }
]
```

#### **Environment Variables**
- ✅ Automatic validation on startup
- ✅ Never exposed to client (except NEXT_PUBLIC_*)
- ✅ Different values per environment (dev/prod)

#### **Newsletter**
- ✅ Mandatory double opt-in
- ✅ Unique verification tokens (UUID v4)
- ✅ Token expiration (24h)
- ✅ One-click unsubscribe

---

## 📜 License

This project is under a **custom license** available at [LICENSE](./LICENSE).

### ⚖️ Permissions

✅ **Allowed:**
- Use code as **study reference**
- Modify and adapt for **personal projects**
- Learn from the **architecture and implementations**
- Contribute **improvements via Pull Requests**

❌ **Prohibited:**
- Copy the project **entirely**
- Reproduce the **visual identity** (logo, colors, branding)
- Use as **commercial template**
- Redistribute without **attribution**

---

## 👩‍💻 Author

<div align="center">

### **Izadora Cury Pierette**

Full Stack Developer specialized in **React**, **Next.js**, **TypeScript** and **Artificial Intelligence**.  
Creating digital experiences that unite creativity, technology and innovation.

[![LinkedIn](https://img.shields.io/badge/-LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/izadora-cury-pierette-7a7754253)
[![GitHub](https://img.shields.io/badge/-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/ipierette)
[![Email](https://img.shields.io/badge/-Email-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:ipierette2@gmail.com)
[![Portfolio](https://img.shields.io/badge/-Portfolio-9333EA?style=for-the-badge&logo=vercel&logoColor=white)](https://catbytes.site)

</div>

---

## 🙏 Acknowledgments

- **Vercel** - Optimized hosting and deployment
- **OpenAI** - GPT-4 and DALL-E 3 for content generation
- **Supabase** - Reliable PostgreSQL database
- **Resend** - Professional email service
- **Next.js Community** - Amazing framework
- **Open Source Community** - For the packages used

---

## 📚 Additional Documentation

- 📄 **[Full Changelog](./CHANGELOG.md)** - All v2.0 changes
- 🇧🇷 **[Portuguese README](./README.md)** - Portuguese version
- 🚀 **[Deploy Guide](./docs/DEPLOY.md)** - How to deploy (coming soon)
- 🎨 **[Design System](./docs/DESIGN.md)** - Style guide (coming soon)
- 🤝 **[Contributing](./docs/CONTRIBUTING.md)** - How to contribute (coming soon)

---

<div align="center">

### ⭐ If you liked the project, consider giving it a star!

**Developed with 💜 by [Izadora Pierette](https://github.com/ipierette)**

> 💡 _"Between lines of code and curious meows, the future also purrs in bytes."_

</div>

---



## 👩‍💻 Author

**Izadora Cury Pierette**  

- 🌐 [LinkedIn](https://www.linkedin.com/in/izadora-cury-pierette-7a7754253)  
- 🐈‍⬛ [GitHub](https://github.com/ipierette)  
- ✉️ [E-mail](mailto:ipierette2@gmail.com)  

---

> 💡 _“Between lines of code and curious meows, the future also purrs in bytes.”_
