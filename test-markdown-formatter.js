// Teste do formatador de markdown
import { readFileSync } from 'fs';
import path from 'path';

// Simular a importação do formatador
async function testMarkdownFormatter() {
  try {
    // Ler o arquivo de teste
    const testContent = readFileSync('./test-article-simple.md', 'utf8');
    
    // Simular o que o formatador deveria fazer
    console.log('=== CONTEÚDO MARKDOWN ORIGINAL ===');
    console.log(testContent);
    
    console.log('\n=== TESTE DE DETECÇÃO DE BLOCOS DE CÓDIGO ===');
    
    // Detectar blocos de código
    const codeBlocks = testContent.match(/```[\s\S]*?```/g);
    if (codeBlocks) {
      codeBlocks.forEach((block, index) => {
        const lines = block.split('\n');
        const language = lines[0].replace('```', '').trim();
        console.log(`Bloco ${index + 1}: Linguagem detectada = "${language}"`);
      });
    }
    
    console.log('\n=== TESTE DE DETECÇÃO DE CÓDIGO INLINE ===');
    
    // Detectar código inline
    const inlineCode = testContent.match(/`[^`]+`/g);
    if (inlineCode) {
      console.log('Código inline detectado:', inlineCode);
    }
    
    console.log('\n=== TESTE DE DETECÇÃO DE FAQ ===');
    
    // Detectar FAQ
    const faqPattern = /###\s+(.+?)\n(.+?)(?=\n###|\n##|\n$)/gs;
    const faqs = [];
    let faqMatch;
    
    while ((faqMatch = faqPattern.exec(testContent)) !== null) {
      if (faqMatch[1].includes('?')) {
        faqs.push({
          question: faqMatch[1].trim(),
          answer: faqMatch[2].trim()
        });
      }
    }
    
    console.log('FAQs detectados:', faqs.length);
    faqs.forEach((faq, index) => {
      console.log(`FAQ ${index + 1}:`);
      console.log(`  P: ${faq.question}`);
      console.log(`  R: ${faq.answer}`);
    });
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

// Executar teste
testMarkdownFormatter();