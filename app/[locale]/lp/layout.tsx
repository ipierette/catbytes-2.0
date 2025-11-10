import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
}

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Injetar CSS via head usando dangerouslySetInnerHTML */}
      <div 
        data-lp 
        style={{ 
          position: 'relative', 
          isolation: 'isolate',
          minHeight: '100vh',
          background: '#ffffff'
        }}
      >
        {/* SEO-only header (visually hidden) */}
        <header 
          className="seo-header"
          style={{ 
            position: 'absolute',
            left: '-9999px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
          aria-hidden="true"
        >
          <h1>CatBytes AI - Landing Page Generator</h1>
          <nav>
            <a href="https://catbytes.site">CatBytes Portfolio</a>
          </nav>
        </header>
        
        {children}
      </div>

      {/* CSS global injetado via Script */}
      <Script id="lp-global-css" strategy="beforeInteractive">
        {`
          (function() {
            const style = document.createElement('style');
            style.textContent = \`
              /* Forçar remoção do layout do site principal */
              body > div:first-child > div:first-child:not([data-lp]) {
                display: none !important;
              }
              nav[aria-label="Main navigation"],
              header:not(.seo-header),
              footer:not([data-lp-footer]) {
                display: none !important;
              }
              /* Reset completo para LPs */
              main {
                all: unset !important;
                display: block !important;
                width: 100% !important;
                min-height: 100vh !important;
              }
              .seo-header {
                position: absolute !important;
                left: -9999px !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important;
              }
            \`;
            document.head.appendChild(style);
          })();
        `}
      </Script>
    </>
  )
}
