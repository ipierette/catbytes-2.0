#!/bin/bash

# Script para solicitar indexação de todas as URLs do CatBytes no Google Search Console
# Use este script para acelerar a indexação do seu site

echo "🔍 Buscando URLs do sitemap..."
echo ""

# Extrai todas as URLs do sitemap
URLS=$(curl -sL https://catbytes.site/sitemap.xml 2>&1 | grep -o '<loc>[^<]*</loc>' | sed 's/<loc>//g' | sed 's/<\/loc>//g')

echo "📋 URLs encontradas no sitemap:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$URLS" | nl
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL=$(echo "$URLS" | wc -l | tr -d ' ')
echo "✅ Total: $TOTAL URLs"
echo ""
echo "📝 PRÓXIMOS PASSOS:"
echo ""
echo "1. Acesse Google Search Console:"
echo "   https://search.google.com/search-console"
echo ""
echo "2. Para cada URL abaixo, faça:"
echo "   a) Cole a URL na barra de inspeção de URL"
echo "   b) Clique em 'Solicitar indexação'"
echo "   c) Aguarde confirmação (~30 segundos por URL)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URLs PRIORITÁRIAS (faça essas primeiro):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🏠 Homepage:"
echo "   https://catbytes.site"
echo ""
echo "🇧🇷 Páginas em Português:"
echo "   https://catbytes.site/pt-BR"
echo "   https://catbytes.site/pt-BR/sobre"
echo "   https://catbytes.site/pt-BR/projetos"
echo "   https://catbytes.site/pt-BR/ia-felina"
echo "   https://catbytes.site/pt-BR/blog"
echo ""
echo "🇺🇸 Páginas em Inglês:"
echo "   https://catbytes.site/en-US"
echo "   https://catbytes.site/en-US/about"
echo "   https://catbytes.site/en-US/projects"
echo "   https://catbytes.site/en-US/feline-ai"
echo "   https://catbytes.site/en-US/blog"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏱️  TEMPO ESTIMADO:"
echo "   • 6 URLs prioritárias × 30s = ~3 minutos"
echo "   • 11 URLs totais × 30s = ~5-6 minutos"
echo ""
echo "💡 DICA: Abra Search Console e copie as URLs acima"
echo "         Use Cmd+C / Ctrl+C para copiar rapidamente"
echo ""
echo "🚀 Após solicitar indexação, o Google processará em:"
echo "   • Páginas importantes: 1-2 dias"
echo "   • Páginas secundárias: 3-7 dias"
echo ""
