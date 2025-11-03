#!/bin/bash

# Script para gerar ícones PWA a partir de uma imagem
# Requer: ImageMagick instalado (brew install imagemagick)
#
# Uso: ./generate-icons.sh input-image.png
#
# O input deve ser uma imagem quadrada de pelo menos 512x512px

INPUT_IMAGE="$1"
OUTPUT_DIR="public/images/icons"

if [ -z "$INPUT_IMAGE" ]; then
  echo "❌ Erro: Forneça uma imagem de entrada"
  echo "Uso: ./generate-icons.sh logo.png"
  exit 1
fi

if [ ! -f "$INPUT_IMAGE" ]; then
  echo "❌ Erro: Arquivo não encontrado: $INPUT_IMAGE"
  exit 1
fi

# Verificar se ImageMagick está instalado
if ! command -v convert &> /dev/null; then
  echo "❌ ImageMagick não encontrado!"
  echo "Instale com: brew install imagemagick"
  exit 1
fi

# Criar diretório de saída
mkdir -p "$OUTPUT_DIR"

echo "🎨 Gerando ícones PWA..."

# Tamanhos necessários para PWA
SIZES=(72 96 128 144 152 192 384 512)

for SIZE in "${SIZES[@]}"; do
  OUTPUT_FILE="$OUTPUT_DIR/icon-${SIZE}x${SIZE}.png"
  echo "  Gerando ${SIZE}x${SIZE}..."
  convert "$INPUT_IMAGE" -resize "${SIZE}x${SIZE}" "$OUTPUT_FILE"
done

echo "✅ Ícones gerados com sucesso em $OUTPUT_DIR"
echo ""
echo "Ícones criados:"
ls -lh "$OUTPUT_DIR"
