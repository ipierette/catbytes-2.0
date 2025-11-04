# 📋 Changelog

All notable changes to the CatBytes project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-11-03 🚀

### 🎉 Major Release - Complete Platform Rewrite

This version represents a **complete rewrite** of the CatBytes portfolio, migrating from vanilla HTML/CSS/JS to a modern, production-ready stack with advanced features.

### ✨ Added

#### Core Architecture
- **Next.js 15.5.6** framework with App Router and TypeScript strict mode
- **Progressive Web App (PWA)** with native mobile app experience
- **Internationalization (i18n)** - Full support for Portuguese (pt-BR) and English (en-US)
- **Dark/Light theme** with system preference detection
- **Service Worker** with offline caching strategies

#### PWA Native Features
- Native iOS/Android-style bottom navigation (PWA standalone mode only)
- Glassmorphism design with backdrop-blur effects
- App-style header with logo and native sharing
- Professional drawer menu with gradient design
- Install banner with platform-specific instructions (iOS/Android)
- Standalone detection and conditional rendering

#### Blog System with AI
- **AI-powered blog generator** using OpenAI GPT-4o-mini
- **Automatic cover image generation** with DALL-E 3
- **Automatic translation** - Posts generated in PT-BR, auto-translated to EN-US
- Blog feed with infinite scroll and filtering
- Post modal with full content and metadata
- SEO optimization with dynamic meta tags
- Reading time calculation
- Category and tag management

#### Newsletter System
- **Double opt-in** email subscription with verification flow
- **Automatic email delivery** when new blog posts are published
- **Resend integration** for professional email delivery
- **Supabase database** for subscriber management
- Responsive email templates with mobile optimization
- Unsubscribe functionality with one-click confirmation
- i18n support for all email communications

#### AI Features Section
- Cat adoption tool (find your perfect match)
- Cat breed identifier with image upload
- Ad generator for products/services with strategy insights
- Interactive tabs with smooth animations

#### GitHub Integration
- Real-time GitHub statistics display
- Commit count, repository tracking
- Language statistics from repositories
- Professional stat cards on hero section

#### Responsive Design
- Mobile-first approach with 3 breakpoints
- Hero section with particles.js background (mobile)
- Large sitting cat image positioned at hero bottom
- GitHub stats cards integrated in mobile hero
- Touch gestures support (swipe navigation)

#### Performance & SEO
- Static Site Generation (SSG) for all pages
- Image optimization with AVIF/WebP formats
- Remote image CDN support (DALL-E, Unsplash, Cloudinary, Dev.to, Hashnode)
- Lazy loading for images and components
- Scroll progress indicator
- Back-to-top button with smooth scroll

### 🔧 Changed

#### Migration from 1.x to 2.0
- **Framework**: Vanilla HTML/CSS/JS → Next.js 15 + TypeScript
- **Styling**: Custom CSS modules → Tailwind CSS 3.4 with custom theme
- **State Management**: DOM manipulation → React hooks + Framer Motion
- **Routing**: Single page → App Router with nested layouts
- **API**: Netlify Functions → Next.js API Routes (Edge Runtime)
- **Animations**: ScrollReveal → Framer Motion (page transitions, gestures)
- **Icons**: Font Awesome → Lucide React (tree-shakeable)

#### UI/UX Improvements
- Professional glassmorphism design system
- Gradient backgrounds (purple-to-blue, pink gradients)
- Smooth page transitions with Framer Motion
- Enhanced mobile navigation (bottom tabs instead of menu toggle)
- Improved form validation with real-time feedback
- WhatsApp button with floating animation

### 🐛 Fixed

#### Build & Deployment
- TypeScript import resolution for barrel exports
- SSR navigator.share compatibility check
- Hydration mismatch prevention
- Image optimization cache configuration
- Service worker registration in production

#### Mobile Responsiveness
- Hero cat positioning (sitting at bottom with overflow-visible)
- Bottom navigation visibility (PWA only, hidden in mobile browser)
- Touch gesture conflicts with scroll
- Modal overflow on small screens
- Email template rendering on mobile clients

#### TypeScript & Lint
- Removed 81 TypeScript/ESLint warnings
- Fixed module resolution with barrel exports (`components/layout/index.ts`)
- Added proper types for all API routes
- Resolved navigator.share SSR issues

### 🔒 Security

- **Environment variable validation** for all API keys
- **API rate limiting** with edge middleware
- **Input sanitization** for all form submissions
- **CORS configuration** for API routes
- **Content Security Policy** headers
- **Secure session management** for newsletter subscriptions
- **Email validation** with disposable domain blocking

### 🎨 Design System

#### Colors
- Primary Purple: `#9333ea` (catbytes-purple)
- Secondary Blue: `#3b82f6` (catbytes-blue)
- Accent Pink: `#ec4899` (catbytes-pink)
- Glassmorphism: `bg-white/80 backdrop-blur-xl`

#### Typography
- Headings: Comfortaa (Google Fonts)
- Body: Inter (Google Fonts)
- Code: Fira Code (monospace)

#### Animations
- Page transitions: Fade + slide (300ms)
- Hover effects: Scale(1.05) + shadow
- Loading states: Pulse animation
- Scroll animations: Intersection Observer

### 📦 Dependencies

#### Core
- `next@15.5.6` - React framework
- `react@18.3.1` - UI library
- `typescript@5.6.3` - Type safety
- `tailwindcss@3.4.14` - Utility-first CSS

#### UI & Animation
- `framer-motion@11.18.2` - Animations
- `lucide-react@0.462.0` - Icons
- `embla-carousel-react@8.3.0` - Carousels
- `next-themes@0.4.3` - Theme switching

#### Internationalization
- `next-intl@3.26.5` - i18n routing & translations

#### AI & APIs
- `openai@6.7.0` - GPT-4 & DALL-E 3
- `@google/generative-ai@0.21.0` - Gemini AI
- `@supabase/supabase-js@2.78.0` - Database
- `resend@6.4.0` - Email delivery

#### PWA
- `next-pwa@5.6.0` - Service worker generation

#### Forms & Validation
- `react-hook-form@7.53.2` - Form management
- `zod@3.23.8` - Schema validation

### 📊 Performance Metrics

- Build time: ~14s (optimized compilation)
- First Contentful Paint: <1.5s
- Time to Interactive: <3s
- Lighthouse Score: 95+ (Performance, Accessibility, Best Practices, SEO)
- Bundle size: Optimized with tree-shaking and code splitting

### 🗂️ Project Structure

```
catbytes-2.0/
├── app/                    # Next.js App Router
│   ├── [locale]/          # i18n locale routes
│   ├── api/               # API routes (Edge Runtime)
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── app/              # PWA shell components
│   ├── blog/             # Blog-specific components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── newsletter/       # Newsletter components
│   ├── sections/         # Page sections (Hero, About, Projects, etc.)
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
├── messages/             # i18n translation files
│   ├── pt-BR.json
│   └── en-US.json
├── public/               # Static assets
│   ├── images/
│   ├── favicon-*.png
│   ├── manifest.json
│   └── sw.js             # Service worker
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

### 🔄 Migration Guide (1.x → 2.0)

If you're upgrading from CatBytes 1.x:

1. **Backup your environment variables** from Netlify
2. **Export your data** if you had any custom integrations
3. **Update dependencies**: Run `npm install` in the new project
4. **Configure environment**:
   ```env
   OPENAI_API_KEY=your_openai_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   RESEND_API_KEY=your_resend_key
   GITHUB_TOKEN=your_github_token (optional)
   ```
5. **Deploy to Vercel** (recommended) or Netlify
6. **Test PWA installation** on mobile devices

### 🎯 Breaking Changes

- Netlify Functions removed (replaced with Next.js API Routes)
- CSS modules replaced with Tailwind utility classes
- Static HTML removed (now fully React-based)
- Old theme switcher incompatible (use new next-themes)
- Contact form now requires Resend API key

---

## [1.3.0] - 2025-08-20

### Added
- Dynamic character counter (2000 max) in message field
- Helper text below message label that disappears while typing

### Changed
- Contact form layout: character counter repositioned to label line
- Placeholder style: "Sua mensagem..." now disappears while typing

### Fixed
- Blocking empty or whitespace-only message submission
- Email validation via Netlify Functions:
  - Format checking and invisible character cleanup
  - Blocking known disposable domains
  - Auto-correction for common typos (`gmil.com` → `gmail.com`, etc.)
  - Valid provider suggestions using Levenshtein distance (fuzzy matching)
  - MX record verification for non-existent domains

### Security
- Reinforcement against automated/bot submissions with invisible honeypot (`_gotcha`)
- Prevention of malformed email or invalid domain submission

---

## [1.2.0] - 2025-08-10

### Added
- Icons with light/dark mode support (cat, book, lamp, heart, robot, cardboard box)
- Custom yellow scale for lamp (light/dark mode)
- Visual improvements in main titles and sections

### Changed
- Color adjustments in titles and links for better contrast in both themes
- Consistent styling across the entire page
