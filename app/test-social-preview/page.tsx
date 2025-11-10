import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Test Social Media Previews - CatBytes',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SocialPreviewTest() {
  const shareUrls = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u=https://catbytes.site',
    twitter: 'https://twitter.com/intent/tweet?url=https://catbytes.site&text=Confira%20o%20portfólio%20CatBytes!',
    linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=https://catbytes.site',
    whatsapp: 'https://wa.me/?text=Confira%20o%20portfólio%20CatBytes!%20https://catbytes.site',
    telegram: 'https://t.me/share/url?url=https://catbytes.site&text=Confira%20o%20portfólio%20CatBytes!',
  }

  const validators = [
    {
      name: 'Facebook Sharing Debugger',
      url: 'https://developers.facebook.com/tools/debug/?q=https://catbytes.site',
      description: 'Valida Open Graph tags e mostra preview do Facebook'
    },
    {
      name: 'Twitter Card Validator',
      url: 'https://cards-dev.twitter.com/validator',
      description: 'Valida Twitter Cards (precisa estar logado)'
    },
    {
      name: 'LinkedIn Post Inspector',
      url: 'https://www.linkedin.com/post-inspector/inspect/https://catbytes.site',
      description: 'Valida como o link aparece no LinkedIn'
    },
    {
      name: 'Open Graph Check',
      url: 'https://opengraphcheck.com/result.php?url=https://catbytes.site',
      description: 'Valida todas as meta tags Open Graph'
    },
    {
      name: 'Meta Tags Check',
      url: 'https://metatags.io/?url=https://catbytes.site',
      description: 'Preview em todas as redes sociais simultaneamente'
    }
  ]

  const images = [
    { name: 'Open Graph Padrão', path: '/images/og-1200x630.jpg', size: '1200x630' },
    { name: 'Twitter/X', path: '/images/og-twitter-800x418.jpg', size: '800x418' },
    { name: 'LinkedIn', path: '/images/og-linkedin-1200x600.jpg', size: '1200x600' },
    { name: 'Instagram/Facebook', path: '/images/og-instagram-1080x1080.jpg', size: '1080x1080' },
    { name: 'WhatsApp', path: '/images/og-whatsapp-1200x1200.jpg', size: '1200x1200' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            🔍 Teste de Previews de Redes Sociais
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Validadores para verificar como seu link aparece em cada rede social
          </p>
        </div>

        {/* Validators */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            🛠️ Validadores Online
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {validators.map((validator) => (
              <a
                key={validator.name}
                href={validator.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-lg"
              >
                <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                  {validator.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {validator.description}
                </p>
                <div className="mt-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  Abrir validador →
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Share Buttons */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            📤 Testar Compartilhamento
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(shareUrls).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg text-white text-center font-medium hover:scale-105 transition-transform shadow-lg"
              >
                {platform === 'facebook' && '📘 Facebook'}
                {platform === 'twitter' && '🐦 Twitter/X'}
                {platform === 'linkedin' && '💼 LinkedIn'}
                {platform === 'whatsapp' && '💬 WhatsApp'}
                {platform === 'telegram' && '✈️ Telegram'}
              </a>
            ))}
          </div>
        </div>

        {/* Image Previews */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            🖼️ Imagens Geradas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div
                key={img.name}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
                  <img
                    src={img.path}
                    alt={img.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {img.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {img.size} pixels
                  </p>
                  <a
                    href={img.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-2 inline-block"
                  >
                    Abrir imagem →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meta Tags Info */}
        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-lg mb-3 text-blue-900 dark:text-blue-100">
            ℹ️ Informações Importantes
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>✅ Todas as imagens foram otimizadas para cada rede social</li>
            <li>✅ Open Graph tags configuradas para Facebook, LinkedIn e WhatsApp</li>
            <li>✅ Twitter Cards configuradas com imagem específica</li>
            <li>✅ Instagram usa imagem quadrada (1080x1080)</li>
            <li>⚠️ Após alterar meta tags, use os validadores para limpar cache</li>
            <li>⚠️ Facebook pode levar até 24h para atualizar preview</li>
            <li>💡 Use o Facebook Debugger para forçar atualização imediata</li>
          </ul>
        </div>

        {/* Current Meta Tags */}
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
            📝 Meta Tags Atuais
          </h3>
          <div className="space-y-3 text-sm font-mono">
            <div>
              <div className="text-gray-600 dark:text-gray-400 mb-1">Open Graph Title:</div>
              <div className="text-gray-900 dark:text-white">CatBytes - Izadora Cury Pierette | Desenvolvimento Web, IA e Automação</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 mb-1">Open Graph Image:</div>
              <div className="text-gray-900 dark:text-white">https://catbytes.site/images/og-1200x630.jpg</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 mb-1">Twitter Card:</div>
              <div className="text-gray-900 dark:text-white">summary_large_image</div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400 mb-1">Twitter Image:</div>
              <div className="text-gray-900 dark:text-white">https://catbytes.site/images/og-twitter-800x418.jpg</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
