#!/bin/zsh
# Script para descobrir o INSTAGRAM_USER_ID a partir do access token
# Uso: ./scripts/get-instagram-user-id.sh SEU_INSTAGRAM_ACCESS_TOKEN

if [ -z "$1" ]; then
  echo "Uso: $0 SEU_INSTAGRAM_ACCESS_TOKEN"
  exit 1
fi

ACCESS_TOKEN="$1"

# 1. Descobrir PAGE_ID da página do Facebook
PAGE_ID=$(curl -s "https://graph.facebook.com/v18.0/me/accounts?access_token=$ACCESS_TOKEN" | jq -r '.data[0].id')

if [ -z "$PAGE_ID" ] || [ "$PAGE_ID" = "null" ]; then
  echo "Não foi possível obter o PAGE_ID. Verifique seu access token."
  exit 2
fi

echo "PAGE_ID encontrado: $PAGE_ID"

# 2. Descobrir INSTAGRAM_USER_ID
INSTAGRAM_USER_ID=$(curl -s "https://graph.facebook.com/v18.0/$PAGE_ID?fields=instagram_business_account&access_token=$ACCESS_TOKEN" | jq -r '.instagram_business_account.id')

if [ -z "$INSTAGRAM_USER_ID" ] || [ "$INSTAGRAM_USER_ID" = "null" ]; then
  echo "Não foi possível obter o INSTAGRAM_USER_ID. Verifique se sua página está conectada a uma conta comercial do Instagram."
  exit 3
fi

echo "INSTAGRAM_USER_ID encontrado: $INSTAGRAM_USER_ID"
