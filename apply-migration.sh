#!/bin/bash

# Script para aplicar migration no Supabase via API
# Configure as variáveis de ambiente antes de executar:
#   export SUPABASE_SERVICE_ROLE_KEY="your_service_key"

SUPABASE_URL="https://lbjekucdxgouwgegpdhi.supabase.co"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_ROLE_KEY}"

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "❌ Erro: SUPABASE_SERVICE_ROLE_KEY não configurado"
    echo "Configure: export SUPABASE_SERVICE_ROLE_KEY='your_key'"
    exit 1
fi

SQL_FILE="supabase/migrations/20251121_add_smart_generate.sql"

echo "🚀 Aplicando migration: $SQL_FILE"

# Ler conteúdo do arquivo SQL
SQL_QUERY=$(cat "$SQL_FILE")

# Executar via Supabase REST API (usando rpc do PostgREST)
curl -X POST "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(jq -Rs . <<< "$SQL_QUERY")}"

echo ""
echo "✅ Migration aplicada!"
