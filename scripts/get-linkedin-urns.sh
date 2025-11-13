#!/bin/bash

# Script para obter Person URN e Organization URN do LinkedIn
# Uso: ./get-linkedin-urns.sh SEU_ACCESS_TOKEN

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se o token foi fornecido
if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Token de acesso não fornecido${NC}"
    echo ""
    echo "Uso: ./get-linkedin-urns.sh SEU_ACCESS_TOKEN"
    echo ""
    echo "Exemplo:"
    echo "./get-linkedin-urns.sh AQV1234abcd..."
    exit 1
fi

TOKEN="$1"

echo -e "${BLUE}🔍 Obtendo URNs do LinkedIn...${NC}"
echo ""

# Obter Person URN
echo -e "${YELLOW}📋 Passo 1: Obtendo Person URN${NC}"
echo ""

PERSON_RESPONSE=$(curl -s -X GET 'https://api.linkedin.com/v2/userinfo' \
  -H "Authorization: Bearer $TOKEN")

# Verificar se houve erro
if echo "$PERSON_RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Erro ao obter Person URN:${NC}"
    echo "$PERSON_RESPONSE" | jq '.'
    exit 1
fi

# Extrair Person URN
PERSON_URN=$(echo "$PERSON_RESPONSE" | jq -r '.sub')
PERSON_NAME=$(echo "$PERSON_RESPONSE" | jq -r '.name')
PERSON_EMAIL=$(echo "$PERSON_RESPONSE" | jq -r '.email')

echo -e "${GREEN}✅ Person URN obtido com sucesso!${NC}"
echo ""
echo "Nome: $PERSON_NAME"
echo "Email: $PERSON_EMAIL"
echo -e "${GREEN}Person URN: $PERSON_URN${NC}"
echo ""

# Obter Organization URN
echo -e "${YELLOW}📋 Passo 2: Obtendo Organization URN${NC}"
echo ""

ORG_RESPONSE=$(curl -s -X GET 'https://api.linkedin.com/v2/organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED&projection=(elements*(organization~(localizedName,vanityName)))' \
  -H "Authorization: Bearer $TOKEN")

# Verificar se houve erro
if echo "$ORG_RESPONSE" | grep -q "error"; then
    echo -e "${RED}❌ Erro ao obter Organization URN:${NC}"
    echo "$ORG_RESPONSE" | jq '.'
    echo ""
    echo -e "${YELLOW}💡 Dica: Você pode obter o Organization URN através da URL da página:${NC}"
    echo "   1. Acesse a página CatBytes no LinkedIn"
    echo "   2. A URL será: https://www.linkedin.com/company/12345678/"
    echo "   3. O número é o Organization ID"
    echo "   4. Formate como: urn:li:organization:12345678"
    exit 1
fi

# Extrair organizações
ORG_COUNT=$(echo "$ORG_RESPONSE" | jq '.elements | length')

if [ "$ORG_COUNT" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Nenhuma organização encontrada como administrador${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dica: Obtenha o Organization URN através da URL da página:${NC}"
    echo "   1. Acesse a página CatBytes no LinkedIn"
    echo "   2. A URL será: https://www.linkedin.com/company/12345678/"
    echo "   3. O número é o Organization ID"
    echo "   4. Formate como: urn:li:organization:12345678"
    echo ""
else
    echo -e "${GREEN}✅ Organizações encontradas: $ORG_COUNT${NC}"
    echo ""
    
    for i in $(seq 0 $((ORG_COUNT - 1))); do
        ORG_URN=$(echo "$ORG_RESPONSE" | jq -r ".elements[$i].organization")
        ORG_NAME=$(echo "$ORG_RESPONSE" | jq -r ".elements[$i][\"organization~\"].localizedName")
        ORG_VANITY=$(echo "$ORG_RESPONSE" | jq -r ".elements[$i][\"organization~\"].vanityName")
        
        echo "Organização $((i + 1)):"
        echo "  Nome: $ORG_NAME"
        echo "  Vanity Name: $ORG_VANITY"
        echo -e "  ${GREEN}Organization URN: $ORG_URN${NC}"
        echo ""
    done
fi

# Resumo final
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📝 Resumo - Adicione ao .env.local:${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo ""
echo "LINKEDIN_PERSON_URN=$PERSON_URN"

if [ "$ORG_COUNT" -gt 0 ]; then
    FIRST_ORG_URN=$(echo "$ORG_RESPONSE" | jq -r '.elements[0].organization')
    echo "LINKEDIN_ORGANIZATION_URN=$FIRST_ORG_URN"
else
    echo "LINKEDIN_ORGANIZATION_URN=urn:li:organization:SEU_ID_AQUI"
fi

echo ""
echo -e "${GREEN}✅ Processo concluído!${NC}"
echo ""
echo -e "${YELLOW}💡 Próximos passos:${NC}"
echo "   1. Copie as variáveis acima"
echo "   2. Cole no seu arquivo .env.local"
echo "   3. Reinicie o servidor: npm run dev"
echo "   4. Teste a integração no Admin > Instagram/LinkedIn"
echo ""
