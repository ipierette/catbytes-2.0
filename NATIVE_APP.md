# 📱 CatBytes Native Mobile App

## 🎯 Visão Geral

O CatBytes 2.0 agora possui uma **experiência de aplicativo mobile nativo** quando instalado como PWA. O site automaticamente se transforma em um app profissional com navegação nativa, gestos intuitivos e design híbrido iOS/Material Design.

## ✨ Funcionalidades Nativas

### 🧭 App Shell
- **Header iOS-style**: Backdrop blur, botões nativos, logo centralizado
- **Bottom Navigation**: 4 abas com indicador animado (Home, Blog, IA, Sobre)
- **Material Drawer**: Menu lateral com gradiente CatBytes
- **Safe Areas**: Suporte para notch/Dynamic Island (iPhone)
- **Page Transitions**: Animações spring suaves entre páginas

### 👆 Gestos Interativos
- **Pull-to-Refresh**: Arraste para baixo para atualizar
- **Swipe Cards**: Arraste cards para ações (delete/archive)
- **Long Press**: Pressione e segure para menu contextual
- **Swipe Back**: Arraste da esquerda para voltar
- **Double Tap**: Toque duplo para curtir (Instagram-style)

### 📳 Haptic Feedback
- **Light**: 10ms (feedback sutil)
- **Medium**: 20ms (ações padrão)
- **Heavy**: 30ms (ações importantes)
- **Success**: [10, 30, 10] (padrão de sucesso)
- **Error**: [20, 50] (padrão de erro)

### 🎨 Componentes UI

#### AppCard
```tsx
<AppCard onClick={handleClick}>
  <h3>Título</h3>
  <p>Conteúdo</p>
</AppCard>
```

#### AppButton
```tsx
<AppButton variant="primary" haptic="medium">
  Ação
</AppButton>
```

#### AppSheet (Bottom Sheet)
```tsx
<AppSheet isOpen={isOpen} onClose={close} title="Filtros">
  {content}
</AppSheet>
```

#### AppToast
```tsx
<AppToast message="Sucesso!" type="success" />
```

## 🎨 Design System

### Cores

#### CatBytes Brand
- **Gradiente**: `#667eea` → `#764ba2`
- **Purple**: `#6c4fd9`
- **Pink**: `#ec4899`

#### iOS Colors
- **Blue**: `#007AFF` (light), `#0A84FF` (dark)
- **Green**: `#34C759`
- **Red**: `#FF3B30`
- **Gray**: `#8E8E93`

### Typography
- **Sans**: Inter, system-ui
- **Mono**: 'Courier New', monospace
- **Base**: 16px (mobile), 16px (desktop)
- **Scale**: 1.2 (major third)

### Spacing
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 24px
--space-6: 32px
--space-8: 48px
--space-10: 64px
```

### Border Radius
```css
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
--radius-full: 9999px
```

## 🚀 Como Usar

### 1. Instalar o App

#### iOS (Safari)
1. Abra `https://catbytes.com` no Safari
2. Toque no botão compartilhar (⎵)
3. Selecione "Adicionar à Tela Inicial"
4. Abra o ícone CatBytes na home screen

#### Android (Chrome)
1. Abra `https://catbytes.com` no Chrome
2. Toque no menu (⋮)
3. Selecione "Adicionar à tela inicial"
4. Abra o ícone CatBytes no launcher

### 2. Navegação

- **Bottom Tabs**: Toque para navegar entre seções principais
- **Drawer Menu**: Toque no menu (☰) para ver todas as opções
- **Back**: Arraste da esquerda ou toque na seta (←)
- **Share**: Toque no ícone compartilhar (⎵)

### 3. Gestos

- **Pull-to-Refresh**: Arraste para baixo no topo da página
- **Swipe Back**: Arraste da esquerda para voltar
- **Long Press**: Segure em cards para opções
- **Double Tap**: Toque duas vezes para curtir

## 🔧 Desenvolvimento

### Estrutura de Arquivos

```
components/app/
├── app-shell.tsx       # Shell principal do app
├── native-ui.tsx       # Componentes UI nativos
└── gestures.tsx        # Gestos e interações

css/
└── pwa-native-app.css  # Design system completo

app/[locale]/layout.tsx # Integração AppShell
```

### Usar Componentes

```tsx
import { AppCard, AppButton, AppSheet } from '@/components/app/native-ui'
import { PullToRefresh, SwipeableCard } from '@/components/app/gestures'
import { haptic } from '@/components/app/gestures'

export function MyComponent() {
  return (
    <PullToRefresh onRefresh={async () => {
      await fetchData()
      haptic.success()
    }}>
      <AppCard>
        <h2>Título</h2>
        <AppButton onClick={() => haptic.medium()}>
          Ação
        </AppButton>
      </AppCard>
    </PullToRefresh>
  )
}
```

### Detectar Modo Standalone

```tsx
'use client'

import { useEffect, useState } from 'react'

export function useIsStandalone() {
  const [isStandalone, setIsStandalone] = useState(false)
  
  useEffect(() => {
    const isPWA = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    
    setIsStandalone(isPWA)
  }, [])
  
  return isStandalone
}
```

### Adicionar Safe Areas

```css
.my-component {
  padding-top: var(--app-safe-area-top);
  padding-bottom: var(--app-safe-area-bottom);
}

/* Ou usando padding direto */
.my-component {
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

## 🎭 Animações

### Spring Physics (Framer Motion)

```tsx
const springConfig = {
  type: 'spring',
  stiffness: 380,
  damping: 30
}

<motion.div
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={springConfig}
>
  Content
</motion.div>
```

### CSS Transitions

```css
/* Smooth */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Bounce */
transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Spring */
transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
```

## 📊 Performance

### Métricas Alvo
- **FCP**: < 1.8s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **FID**: < 100ms

### Otimizações
- Service Worker com cache strategies
- Lazy loading de imagens
- Code splitting por rota
- Prefetch de navegação
- Debounce em gestos

## ♿ Acessibilidade

### WCAG 2.1 AA
- ✅ Contraste mínimo 4.5:1 (texto)
- ✅ Touch targets 44×44px (iOS), 48×48px (Android)
- ✅ Keyboard navigation
- ✅ Screen reader support (ARIA labels)
- ✅ Focus indicators visíveis
- ✅ Reduced motion support

### Modo de Movimento Reduzido

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🌙 Dark Mode

O app detecta automaticamente a preferência do sistema:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
>
  {children}
</ThemeProvider>
```

Todas as cores e componentes se adaptam:
- **Light**: Backgrounds brancos, texto escuro
- **Dark**: Backgrounds escuros (#1a1a1a), texto claro

## 🔐 Segurança

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-eval' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
```

### Permissions
- **Vibrate**: Haptic feedback
- **Share**: Native share sheet
- **Notifications**: Push notifications (futuro)

## 🐛 Debug

### Ver Logs do Service Worker
1. Chrome DevTools → Application → Service Workers
2. Console → Filter: `sw.js`

### Simular Standalone Mode
1. Chrome DevTools → Application → Manifest
2. Check "Open in standalone mode"
3. Reload page

### Testar Gestos
1. Device toolbar (Ctrl+Shift+M)
2. Enable touch simulation
3. Use mouse/trackpad para simular swipes

## 📚 Recursos

### Documentação
- [PWA Docs](https://web.dev/progressive-web-apps/)
- [Framer Motion](https://www.framer.com/motion/)
- [Next.js PWA](https://github.com/shadowwalker/next-pwa)

### Inspiração
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/)
- [Material Design 3](https://m3.material.io/)
- [Telegram Web App](https://web.telegram.org/)
- [Instagram PWA](https://www.instagram.com/)

## 💡 Dicas

### Performance
- Use `will-change` com cuidado (apenas durante animações)
- Debounce gestos rápidos (< 16ms)
- Lazy load imagens fora da viewport
- Prefetch links críticos

### UX
- Sempre forneça feedback visual imediato
- Use haptic feedback para confirmar ações
- Mantenha animações < 300ms
- Safe areas são cruciais (iPhone)

### Debugging
- Console.log no service worker aparece no DevTools
- Use `navigator.vibrate` apenas se suportado
- Teste em dispositivos reais quando possível

## 🎉 Resultado Final

O CatBytes agora oferece uma **experiência de app nativo profissional** que:

✅ Parece um app iOS/Android nativo  
✅ Funciona offline  
✅ Tem gestos intuitivos  
✅ Vibra com feedback tátil  
✅ Navega suavemente entre páginas  
✅ Mantém a identidade CatBytes  
✅ Segue boas práticas de design  
✅ É acessível (WCAG AA)  
✅ Tem performance otimizada  
✅ Suporta dark mode  

**Transformamos um site em um aplicativo mobile de primeira linha.** 🚀🐱💜
