const testArticle = {
  title: "Teste de Estilos - Artigo Manual",
  slug: "teste-estilos-artigo-manual",
  excerpt: "Artigo de teste para verificar todos os estilos implementados: blocos de código, FAQ, tabelas e formatação markdown.",
  cover_image_url: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=800&h=400&fit=crop",
  content: `## Introdução

Este é um artigo de teste criado para verificar todos os estilos implementados no sistema do blog.

## Blocos de Código

### JavaScript
\`\`\`javascript
function calcularSoma(a, b) {
  const resultado = a + b;
  console.log('Resultado:', resultado);
  return resultado;
}

// Teste da função
const soma = calcularSoma(5, 3);
alert(\`A soma é: \${soma}\`);
\`\`\`

### Python
\`\`\`python
def calcular_fibonacci(n):
    if n <= 1:
        return n
    else:
        return calcular_fibonacci(n-1) + calcular_fibonacci(n-2)

# Exemplo de uso
for i in range(10):
    print(f"F({i}) = {calcular_fibonacci(i)}")
\`\`\`

### CSS
\`\`\`css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-4px);
}
\`\`\`

### HTML
\`\`\`html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Teste de HTML</title>
</head>
<body>
    <header class="header">
        <h1>Meu Site Incrível</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#sobre">Sobre</a></li>
                <li><a href="#contato">Contato</a></li>
            </ul>
        </nav>
    </header>
</body>
</html>
\`\`\`

## Código Inline

Aqui temos alguns exemplos de \`código inline\` como \`console.log()\`, \`useState()\` e \`npm install react\`.

### Comandos de Terminal
Use \`npm install\` para instalar dependências, \`git commit -m "message"\` para fazer commits, e \`docker build -t myapp .\` para criar imagens Docker.

## Tabelas

| Linguagem | Dificuldade | Popularidade | Uso Principal |
|-----------|-------------|--------------|---------------|
| JavaScript | Média | ⭐⭐⭐⭐⭐ | Frontend/Backend |
| Python | Baixa | ⭐⭐⭐⭐⭐ | Data Science/Backend |
| Java | Alta | ⭐⭐⭐⭐ | Enterprise/Android |
| C++ | Muito Alta | ⭐⭐⭐ | Sistemas/Games |

## Listas

### Lista Numerada
1. Primeiro item importante
2. Segunda funcionalidade
3. Terceira característica
4. Quarto elemento

### Lista com Marcadores
- ✅ Blocos de código funcionando
- ✅ Syntax highlighting implementado
- ✅ FAQ estruturado
- ✅ Tabelas responsivas
- ⚠️ Newsletter EN-US (em teste)

## Formatação de Texto

**Texto em negrito** para destacar informações importantes.

*Texto em itálico* para ênfase sutil.

***Texto em negrito e itálico*** para máximo destaque.

~~Texto riscado~~ para indicar conteúdo obsoleto.

> Esta é uma citação em bloco que destaca informações importantes ou quotes de outras fontes. Muito útil para destacar conceitos principais.

## Perguntas Frequentes

### Como testar os estilos do blog?
Este artigo foi criado especificamente para testar todos os elementos de formatação implementados no sistema. Ele inclui código, tabelas, listas e FAQ.

### Os blocos de código têm syntax highlighting?
Sim! O sistema detecta automaticamente a linguagem especificada nos blocos de código e aplica o destaque de sintaxe apropriado.

### Como funciona o sistema de FAQ?
O FAQ pode ser detectado automaticamente no markdown ou adicionado através do editor estruturado com campos dedicados para perguntas e respostas.

### O sistema suporta diferentes linguagens de código?
Sim, suporta JavaScript, Python, CSS, HTML, TypeScript, SQL, JSON e muitas outras linguagens populares.

### Como funciona a responsividade das tabelas?
As tabelas são automaticamente responsivas, permitindo scroll horizontal em dispositivos móveis quando necessário.

## Conclusão

Este artigo de teste demonstra todas as funcionalidades de formatação implementadas:
- ✅ Blocos de código com highlighting
- ✅ Código inline
- ✅ Tabelas formatadas
- ✅ FAQ estruturado
- ✅ Listas e formatação de texto
- ✅ Citações e elementos visuais

Se você está vendo todos esses elementos formatados corretamente, o sistema está funcionando perfeitamente!`,
  category: "technology",
  subcategory: "testing",
  tags: ["teste", "estilos", "markdown", "codigo", "faq"],
  locale: "pt-BR",
  status: "published",
  published_at: new Date().toISOString()
};

// Função para criar o artigo
async function createTestArticle() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + process.env.ADMIN_TOKEN // se necessário
      },
      body: JSON.stringify(testArticle)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Artigo de teste criado com sucesso!');
    console.log('🔗 ID:', result.id);
    console.log('🔗 URL:', `http://localhost:3000/pt-BR/blog/${result.slug}`);
    return result;
  } catch (error) {
    console.error('❌ Erro ao criar artigo:', error.message);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestArticle();
}

export { createTestArticle, testArticle };