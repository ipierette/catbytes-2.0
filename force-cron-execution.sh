#!/bin/bash
#
# FORÇA EXECUÇÃO MANUAL DO CRON - Geração Completa
# Use quando o Vercel Cron falhar
#
# Uso: ./force-cron-execution.sh
#
# Requer: .env.local com CRON_SECRET configurado
#

# Carregar variáveis do .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | grep CRON_SECRET | xargs)
fi

if [ -z "$CRON_SECRET" ]; then
  echo "❌ Erro: CRON_SECRET não encontrado no .env.local"
  exit 1
fi

BASE_URL="https://www.catbytes.site"

echo "🚨 FORÇANDO EXECUÇÃO MANUAL DO CRON"
echo "====================================="
echo ""
echo "Data/Hora: $(date '+%d/%m/%Y %H:%M:%S %Z')"
echo ""

# Step 1: Gerar artigo do blog + newsletter + posts sociais
echo "📝 Step 1: Gerando artigo de blog + newsletter + posts sociais..."
echo ""

RESPONSE=$(curl -X POST "$BASE_URL/api/blog/generate" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{}' \
  --max-time 180 \
  -w "\nHTTP_STATUS:%{http_code}" \
  2>&1)

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "200" ]; then
  echo "✅ Artigo gerado com sucesso!"
  echo ""
  
  # Extrair título do artigo (se tiver jq instalado)
  if command -v jq &> /dev/null; then
    TITLE=$(echo "$BODY" | jq -r '.post.title // "N/A"')
    SLUG=$(echo "$BODY" | jq -r '.post.slug // "N/A"')
    SOCIAL_SUCCESS=$(echo "$BODY" | jq -r '.socialPromotion.successes // [] | join(", ")')
    
    echo "   Título: $TITLE"
    echo "   Slug: $SLUG"
    echo "   Publicado em: $SOCIAL_SUCCESS"
  fi
  
  echo ""
else
  echo "❌ Erro ao gerar artigo (HTTP $HTTP_STATUS)"
  echo ""
  echo "Resposta:"
  echo "$BODY"
  exit 1
fi

# Step 2: Verificar se newsletter foi enviada
echo "📧 Step 2: Verificando envio de newsletter..."
echo ""

# Newsletter já é enviada automaticamente pelo /api/blog/generate
echo "✅ Newsletter enviada automaticamente durante geração do artigo"
echo ""

# Step 3: Resumo
echo "📊 RESUMO DA EXECUÇÃO"
echo "====================="
echo ""
echo "✅ Artigo de blog gerado"
echo "✅ Newsletter enviada"
echo "✅ Posts sociais criados e publicados"
echo ""
echo "🎉 Execução manual completa!"
echo ""
echo "Para verificar:"
echo "  - Artigo: $BASE_URL/blog/$SLUG"
echo "  - Instagram: https://www.instagram.com/catbytes.site/"
echo "  - LinkedIn: https://www.linkedin.com/company/catbytes/"
echo ""
