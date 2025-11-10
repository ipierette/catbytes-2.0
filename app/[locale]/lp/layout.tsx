import type { Metadata } from 'next'

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
      <style jsx global>{`
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
      `}</style>
      
      <div data-lp style={{ 
        position: 'relative', 
        isolation: 'isolate',
        minHeight: '100vh',
        background: '#ffffff'
      }}>
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
    </>
  )
}
