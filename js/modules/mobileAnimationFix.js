/**
 * Mobile Animation Fix
 * Detecta mobile e ajusta animações para prevenir bugs visuais
 */

export function initMobileAnimationFix() {
  // Detectar se é mobile
  const isMobile = () => {
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Detectar se é conexão lenta
  const isSlowConnection = () => {
    if ('connection' in navigator) {
      const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (conn) {
        return conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g' || conn.saveData;
      }
    }
    return false;
  };

  // Detectar nível de bateria
  const isLowBattery = async () => {
    if ('getBattery' in navigator) {
      try {
        const battery = await navigator.getBattery();
        return battery.level < 0.2 && !battery.charging;
      } catch {
        return false;
      }
    }
    return false;
  };

  // Aplicar classes ao body
  const applyOptimizations = async () => {
    const body = document.body;

    if (isMobile()) {
      body.classList.add('is-mobile');
    }

    if (isSlowConnection()) {
      body.classList.add('slow-connection');
      // Reduzir ainda mais as animações
      body.classList.add('reduce-animations');
    }

    if (await isLowBattery()) {
      body.classList.add('low-battery');
      body.classList.add('reduce-animations');
    }
  };

  // Limpar will-change após animações completarem
  const cleanupWillChange = () => {
    const animatedElements = document.querySelectorAll('[class*="animate-"]');
    
    animatedElements.forEach(element => {
      element.addEventListener('animationend', () => {
        element.classList.add('animation-complete');
        element.style.willChange = 'auto';
      }, { once: true });
    });
  };

  // Observar mudanças de orientação e resize
  const handleOrientationChange = () => {
    applyOptimizations();
    cleanupWillChange();
  };

  // Throttle para performance
  let resizeTimeout;
  const throttledResize = () => {
    if (resizeTimeout) {
      clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(handleOrientationChange, 250);
  };

  // Inicializar
  applyOptimizations();
  cleanupWillChange();

  // Event listeners
  window.addEventListener('resize', throttledResize);
  window.addEventListener('orientationchange', handleOrientationChange);

  // Observar bateria
  if ('getBattery' in navigator) {
    navigator.getBattery().then(battery => {
      battery.addEventListener('levelchange', applyOptimizations);
      battery.addEventListener('chargingchange', applyOptimizations);
    }).catch(() => {});
  }

  // Observar mudanças de conexão
  if ('connection' in navigator) {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
      conn.addEventListener('change', applyOptimizations);
    }
  }
}

// Auto-inicializar quando o DOM estiver pronto
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileAnimationFix);
  } else {
    initMobileAnimationFix();
  }
}
