#!/bin/bash
# Script para testar o cronjob manualmente

echo "🔍 Testando Cronjob do CatBytes"
echo "================================"
echo ""

# Verificar se CRON_SECRET está configurado
if [ -z "$CRON_SECRET" ]; then
  echo "❌ CRON_SECRET não está definido!"
  echo "   Configure com: export CRON_SECRET='seu-secret'"
  echo ""
  echo "   Para ver o secret no Vercel:"
  echo "   vercel env pull .env.local"
  exit 1
fi

echo "✅ CRON_SECRET encontrado"
echo ""

# Verificar dia e hora
DAY=$(date +%u)  # 1=Monday, 7=Sunday
HOUR=$(date +%H)
UTC_HOUR=$(TZ=UTC date +%H)

echo "📅 Informações de agendamento:"
echo "   Dia da semana: $DAY (1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb, 7=Dom)"
echo "   Hora local: ${HOUR}h"
echo "   Hora UTC: ${UTC_HOUR}h"
echo "   Dias configurados: Ter(2), Qui(4), Sáb(6), Dom(7/0)"
echo "   Hora configurada: 16h UTC (13h BRT)"
echo ""

# Testar endpoint
echo "🚀 Testando endpoint do cron..."
echo "   URL: https://www.catbytes.site/api/simple-cron"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET "https://www.catbytes.site/api/simple-cron" \
  -H "Authorization: Bearer $CRON_SECRET" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$ d')

echo "📊 Resposta:"
echo "   Status HTTP: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Cronjob executou com sucesso!"
  echo ""
  echo "📄 Resultado:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
  echo "❌ Erro na execução!"
  echo ""
  echo "📄 Resposta:"
  echo "$BODY"
fi

echo ""
echo "================================"
echo "💡 Próximos passos:"
echo ""
echo "1. Se deu erro 401: Verificar CRON_SECRET no Vercel"
echo "2. Se deu erro 500: Ver logs com: vercel logs"
echo "3. Se funcionou: Verificar no dashboard do Vercel se Cron está habilitado"
echo "   https://vercel.com/YOUR_TEAM/YOUR_PROJECT/settings/crons"
echo ""
