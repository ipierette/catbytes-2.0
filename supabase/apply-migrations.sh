#!/bin/bash

# Script para aplicar migrations do Supabase
# Uso: ./apply-migrations.sh

echo "🚀 Aplicando migrations do Supabase..."

# Verifica se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado"
    echo "📦 Instalando Supabase CLI..."
    brew install supabase/tap/supabase
fi

# Diretório de migrations
MIGRATIONS_DIR="./supabase/migrations"

echo ""
echo "📂 Migrations encontradas:"
ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null || {
    echo "❌ Nenhuma migration encontrada em $MIGRATIONS_DIR"
    exit 1
}

echo ""
echo "⚙️  Escolha uma opção:"
echo "1) Aplicar todas as migrations (via Supabase CLI)"
echo "2) Gerar SQL consolidado (copiar e colar no Supabase Dashboard)"
echo "3) Aplicar apenas nova migration (20251114_add_lp_indexing_columns.sql)"
read -p "Opção: " option

case $option in
    1)
        echo ""
        echo "🔐 Conectando ao Supabase..."
        supabase db push
        echo "✅ Migrations aplicadas!"
        ;;
    2)
        echo ""
        echo "📋 SQL Consolidado:"
        echo "=========================================="
        cat "$MIGRATIONS_DIR"/*.sql
        echo "=========================================="
        echo ""
        echo "💡 Copie o SQL acima e execute no Supabase Dashboard → SQL Editor"
        ;;
    3)
        echo ""
        echo "📋 SQL da Migration de Indexação:"
        echo "=========================================="
        cat "$MIGRATIONS_DIR/20251114_add_lp_indexing_columns.sql"
        echo "=========================================="
        echo ""
        echo "💡 Copie e execute no Supabase Dashboard → SQL Editor"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "✅ Concluído!"
