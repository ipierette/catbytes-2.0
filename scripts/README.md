# 🚀 Scripts Úteis do CatBytes

## get-linkedin-urns.sh

Script automatizado para obter os URNs necessários do LinkedIn (Person URN e Organization URN).

### 📋 Pré-requisitos

- Token de acesso do LinkedIn já gerado
- `jq` instalado (para processar JSON)
  ```bash
  # macOS
  brew install jq
  
  # Ubuntu/Debian
  sudo apt-get install jq
  ```

### 🎯 Uso

```bash
./scripts/get-linkedin-urns.sh SEU_ACCESS_TOKEN
```

**Exemplo:**
```bash
./scripts/get-linkedin-urns.sh AQV1234abcd...
```

### 📤 Saída Esperada

```
🔍 Obtendo URNs do LinkedIn...

📋 Passo 1: Obtendo Person URN

✅ Person URN obtido com sucesso!

Nome: Seu Nome
Email: seu@email.com
Person URN: ABC123xyz

📋 Passo 2: Obtendo Organization URN

✅ Organizações encontradas: 1

Organização 1:
  Nome: CatBytes
  Vanity Name: catbytes
  Organization URN: urn:li:organization:12345678

═══════════════════════════════════════════════════
📝 Resumo - Adicione ao .env.local:
═══════════════════════════════════════════════════

LINKEDIN_PERSON_URN=ABC123xyz
LINKEDIN_ORGANIZATION_URN=urn:li:organization:12345678

✅ Processo concluído!
```

### ✨ O que o script faz

1. ✅ Obtém o Person URN através da API `/v2/userinfo`
2. ✅ Lista todas as organizações onde você é administrador
3. ✅ Mostra nome, email e URNs de forma formatada
4. ✅ Gera as variáveis prontas para copiar ao `.env.local`
5. ✅ Trata erros e fornece dicas de troubleshooting

### 🐛 Troubleshooting

#### Erro: "jq: command not found"
```bash
# Instale o jq
brew install jq  # macOS
```

#### Erro: "Permission denied"
```bash
# Dê permissão de execução
chmod +x scripts/get-linkedin-urns.sh
```

#### Erro: "Invalid token"
- ✅ Verifique se o token não expirou (válido por 60 dias)
- ✅ Gere um novo token em Admin > Configurações

#### Organization URN não encontrado
- Se você não é administrador da página, obtenha o URN pela URL:
  1. Acesse a página CatBytes no LinkedIn
  2. URL será: `https://www.linkedin.com/company/12345678/`
  3. Use: `urn:li:organization:12345678`

---

## 💡 Outros Scripts

### check-env.js
Verifica se todas as variáveis de ambiente necessárias estão configuradas.

```bash
node scripts/check-env.js
```

### optimize-meta.js
Otimiza as meta tags HTML para melhor SEO.

```bash
node scripts/optimize-meta.js
```

---

## 📚 Documentação Relacionada

- [Guia Completo do Token LinkedIn](../docs/LINKEDIN_TOKEN_GUIDE.md)
- [Exemplo de .env](../.env.linkedin.example)
- [Configurações do LinkedIn](../lib/linkedin-settings.ts)
