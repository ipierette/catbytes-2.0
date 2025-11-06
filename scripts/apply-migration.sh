#!/bin/bash

# Script para aplicar migration no Supabase
# Executa o arquivo SQL de migration

echo "🔧 Aplicando migration: add_generation_method.sql"
echo ""

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$SUPABASE_PROJECT_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Erro: Variáveis de ambiente não configuradas"
    echo "Configure SUPABASE_PROJECT_URL e SUPABASE_SERVICE_ROLE_KEY"
    exit 1
fi

# Executar migration via API
curl -X POST "${SUPABASE_PROJECT_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d @supabase/migrations/add_generation_method.sql

echo ""
echo "✅ Migration aplicada com sucesso!"
echo ""
echo "Agora você pode:"
echo "1. Testar DALL-E 3"
echo "2. Testar Stability AI"
echo "3. Testar Texto IA + IMG"
