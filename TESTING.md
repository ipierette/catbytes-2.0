# 🧪 Guia Rápido de Teste - App Nativo

## ⚡ Teste Rápido (5 minutos)

### 1. Build & Start
```bash
npm run build
npm start
```

### 2. Chrome DevTools
1. Abrir `http://localhost:3000/pt-BR` no Chrome
2. F12 → Device Toolbar (Ctrl+Shift+M)
3. Selecionar iPhone 13 Pro
4. Application → Manifest → Ver configurações
5. Service Workers → Verificar registro

### 3. Instalar PWA
1. Clicar no ícone + na barra de endereço
2. Instalar PWA
3. Abrir PWA em nova janela standalone
4. ✅ Verificar: Bottom navigation aparece
5. ✅ Verificar: Header iOS-style com blur

### 4. Testar Navegação
- [ ] Clicar nas 4 abas do bottom nav
- [ ] Abrir drawer menu (☰)
- [ ] Navegar para Blog
- [ ] Clicar em "Voltar" (←)
- [ ] Compartilhar página (⎵)

### 5. Testar Gestos
- [ ] Pull-to-refresh no topo
- [ ] Swipe card (se disponível)
- [ ] Long press em card
- [ ] Double tap em imagem

---

## 📱 Teste em Dispositivo Real

### iOS (Safari)
```
1. Deploy no Vercel/Netlify
2. Abrir no Safari iPhone
3. Compartilhar → Adicionar à Tela Inicial
4. Abrir ícone CatBytes
5. Testar navegação e gestos
```

### Android (Chrome)
```
1. Deploy no Vercel/Netlify
2. Abrir no Chrome Android
3. Menu → Adicionar à tela inicial
4. Abrir ícone CatBytes
5. Testar navegação e gestos
```

---

## ✅ Checklist Completo

### Visual
- [ ] Bottom nav tem 4 abas
- [ ] Header tem botão voltar (esquerda)
- [ ] Header tem botão menu/share (direita)
- [ ] Logo CatBytes centralizado
- [ ] Indicador de aba ativa funciona
- [ ] Safe areas respeitadas (notch)
- [ ] Blur effects no header/nav

### Navegação
- [ ] Tabs trocam de página
- [ ] Drawer abre/fecha suavemente
- [ ] Transições de página fluidas
- [ ] Voltar funciona
- [ ] Compartilhar abre sheet

### Gestos
- [ ] Pull-to-refresh aparece spinner
- [ ] Pull-to-refresh trigger em 80px
- [ ] Swipe cards mostram ações
- [ ] Long press vibra após 500ms
- [ ] Swipe back volta página
- [ ] Double tap mostra coração

### Performance
- [ ] Animações a 60fps
- [ ] Transições < 300ms
- [ ] Loading states aparecem
- [ ] Imagens lazy load
- [ ] Service worker cacheia

### Haptic
- [ ] Vibra ao clicar botões
- [ ] Vibra ao mudar tab
- [ ] Vibra ao fazer swipe
- [ ] Vibra padrão success
- [ ] Vibra padrão error

### Dark Mode
- [ ] Alterna automaticamente
- [ ] Cores adaptam corretamente
- [ ] Blur effects mantêm
- [ ] Contraste adequado

### Offline
- [ ] Funciona sem internet
- [ ] Cache serve páginas
- [ ] Imagens aparecem
- [ ] CSS/JS carregam

---

## 🐛 Problemas Comuns

### Bottom nav não aparece
```
Verificar:
1. Está em modo standalone? (window.matchMedia)
2. Está em mobile? (< 768px)
3. CSS pwa-native-app.css importado?
4. Body tem classe pwa-standalone?
```

### Blur não funciona
```
Safari requer:
- backdrop-filter + -webkit-backdrop-filter
- background: rgba(255, 255, 255, 0.92)
- supports(backdrop-filter: blur(20px))
```

### Gestos não funcionam
```
Verificar:
1. Framer Motion instalado?
2. Touch events habilitados?
3. Drag constraints corretos?
4. PanInfo type importado?
```

### Haptic não vibra
```
Verificar:
1. 'vibrate' in navigator?
2. HTTPS (vibrate não funciona em HTTP)
3. Permissão concedida?
4. Dispositivo suporta?
```

### Safe areas erradas
```
iOS precisa:
- viewport-fit=cover no meta viewport
- env(safe-area-inset-top) no CSS
- padding-top: var(--app-safe-area-top)
```

---

## 🔍 Debug

### Ver se está standalone
```tsx
useEffect(() => {
  console.log('Standalone:', window.matchMedia('(display-mode: standalone)').matches)
  console.log('iOS:', (window.navigator as any).standalone)
  console.log('Android:', document.referrer.includes('android-app://'))
}, [])
```

### Ver safe areas
```tsx
useEffect(() => {
  console.log('Top:', getComputedStyle(document.documentElement).getPropertyValue('--app-safe-area-top'))
  console.log('Bottom:', getComputedStyle(document.documentElement).getPropertyValue('--app-safe-area-bottom'))
}, [])
```

### Ver vibração
```tsx
const testVibrate = () => {
  if ('vibrate' in navigator) {
    navigator.vibrate([10, 30, 10]) // Success pattern
    console.log('Vibration triggered')
  } else {
    console.log('Vibration not supported')
  }
}
```

---

## 📊 Métricas Esperadas

### Lighthouse (Mobile)
- **Performance**: > 90
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100
- **PWA**: ✅ Installable

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### App Shell
- **TTI**: < 3s
- **FCP**: < 1.8s
- **Animation FPS**: 60

---

## 🎯 Teste de Aceitação

### Cenário 1: Instalar e Navegar
```
1. Abrir site
2. Instalar PWA
3. Abrir do ícone
4. Ver app shell (✓)
5. Navegar entre abas (✓)
6. Abrir drawer (✓)
7. Voltar (✓)
```

### Cenário 2: Gestos
```
1. Ir para topo
2. Pull-to-refresh (✓)
3. Ver spinner girar (✓)
4. Trigger em 80px (✓)
5. Feedback haptic (✓)
```

### Cenário 3: Compartilhar
```
1. Clicar share (⎵)
2. Sheet abre (✓)
3. Ver opções nativas (✓)
4. Compartilhar funciona (✓)
```

### Cenário 4: Dark Mode
```
1. Alternar tema
2. Cores mudam (✓)
3. Blur mantém (✓)
4. Legível (✓)
```

### Cenário 5: Offline
```
1. Desconectar internet
2. Recarregar página
3. Funciona (✓)
4. Navegar (✓)
5. Imagens aparecem (✓)
```

---

## ✅ Pronto para Produção

Quando todos os testes passarem:

```bash
# Gerar ícones PWA
./scripts/generate-icons.sh public/images/catbytes-logo.png

# Executar migração database
# (SQL no UPDATES.md)

# Deploy
npm run build
vercel --prod
```

**O app nativo está pronto!** 🚀🐱💜
