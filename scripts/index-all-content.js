#!/usr/bin/env node

/**
 * Script para indexar TODO o conteúdo do CatBytes no Google
 * 
 * Indexa:
 * - Todas as páginas estáticas
 * - Todos os artigos do blog (pt-BR e en-US)
 * - Todas as landing pages
 * 
 * Uso: node scripts/index-all-content.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { google } = require('googleapis');

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site';
const BATCH_SIZE = 100; // Google permite max 100 URLs por batch
const DELAY_BETWEEN_BATCHES = 1000; // 1 segundo entre batches

// Páginas estáticas para indexar
const STATIC_PAGES = [
  // Homepage
  '/',
  '/pt-BR',
  '/en-US',
  
  // Blog
  '/pt-BR/blog',
  '/en-US/blog',
  
  // Admin (não indexar - privado)
  // '/admin',
];

async function getGoogleIndexingClient() {
  let credentials;
  
  // Try to load from file first
  const keyFilePath = './google-indexing-key.json';
  const fs = require('fs');
  const path = require('path');
  
  try {
    const keyFile = path.join(__dirname, '..', keyFilePath);
    if (fs.existsSync(keyFile)) {
      credentials = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
      console.log('✅ Carregado de google-indexing-key.json');
    }
  } catch (e) {
    console.log('⚠️  Arquivo google-indexing-key.json não encontrado');
  }
  
  // Fallback to env variable
  if (!credentials && process.env.GOOGLE_INDEXING_KEY) {
    try {
      credentials = JSON.parse(process.env.GOOGLE_INDEXING_KEY);
      console.log('✅ Carregado de GOOGLE_INDEXING_KEY');
    } catch (e) {
      console.error('❌ Erro ao parsear GOOGLE_INDEXING_KEY:', e.message);
    }
  }
  
  if (!credentials || !credentials.client_email) {
    throw new Error('Credenciais do Google não configuradas. Use google-indexing-key.json ou GOOGLE_INDEXING_KEY');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/indexing'],
  });

  const client = await auth.getClient();
  const indexing = google.indexing({ version: 'v3', auth: client });
  
  return indexing;
}

async function submitBatch(indexing, urls) {
  console.log(`\n📦 Enviando batch de ${urls.length} URLs...`);
  
  const items = urls.map(url => ({
    'Content-Type': 'application/http',
    'Content-ID': `<${url}>`,
    body: JSON.stringify({
      url,
      type: 'URL_UPDATED'
    })
  }));

  try {
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url: urls[0],
        type: 'URL_UPDATED'
      }
    });

    console.log(`✅ Batch enviado com sucesso!`);
    return { success: true, urls: urls.length };
  } catch (error) {
    console.error(`❌ Erro ao enviar batch:`, error.message);
    return { success: false, error: error.message };
  }
}

async function submitUrlIndividually(indexing, url) {
  try {
    await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type: 'URL_UPDATED'
      }
    });
    console.log(`  ✅ ${url}`);
    return true;
  } catch (error) {
    console.error(`  ❌ ${url} - ${error.message}`);
    return false;
  }
}

async function getAllBlogPosts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase não configurado - pulando posts do blog');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('slug, locale, published')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar posts do blog:', error);
    return [];
  }

  return posts.map(post => `${SITE_URL}/${post.locale}/blog/${post.slug}`);
}

async function getAllLandingPages() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase não configurado - pulando landing pages');
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data: pages, error } = await supabase
    .from('landing_pages')
    .select('slug, status')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Erro ao buscar landing pages:', error);
    return [];
  }

  return pages.map(page => `${SITE_URL}/lp/${page.slug}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 INDEXAÇÃO MASSIVA DO CATBYTES NO GOOGLE\n');
  console.log(`📍 Site: ${SITE_URL}\n`);

  // 1. Buscar todas as URLs
  console.log('📋 Coletando URLs...\n');
  
  const staticUrls = STATIC_PAGES.map(path => `${SITE_URL}${path}`);
  console.log(`  ✓ ${staticUrls.length} páginas estáticas`);
  
  const blogUrls = await getAllBlogPosts();
  console.log(`  ✓ ${blogUrls.length} artigos do blog`);
  
  const landingUrls = await getAllLandingPages();
  console.log(`  ✓ ${landingUrls.length} landing pages`);
  
  const allUrls = [...staticUrls, ...blogUrls, ...landingUrls];
  console.log(`\n📊 Total: ${allUrls.length} URLs para indexar`);

  if (allUrls.length === 0) {
    console.log('\n⚠️  Nenhuma URL para indexar!');
    return;
  }

  // 2. Conectar ao Google Indexing API
  console.log('\n🔐 Conectando ao Google Indexing API...');
  const indexing = await getGoogleIndexingClient();
  console.log('✅ Conectado!\n');

  // 3. Indexar URLs individualmente (Google Indexing API não suporta batch via Node.js client)
  console.log('📤 Enviando URLs para o Google...\n');
  
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < allUrls.length; i++) {
    const url = allUrls[i];
    const result = await submitUrlIndividually(indexing, url);
    
    if (result) {
      successCount++;
    } else {
      errorCount++;
    }

    // Delay para evitar rate limiting (200 requests/day)
    if (i < allUrls.length - 1) {
      await delay(500); // 0.5 segundos entre requests
    }

    // Progress
    if ((i + 1) % 10 === 0) {
      console.log(`\n📊 Progresso: ${i + 1}/${allUrls.length} URLs processadas`);
    }
  }

  // 4. Relatório final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log(`✅ Sucesso: ${successCount} URLs`);
  console.log(`❌ Erros: ${errorCount} URLs`);
  console.log(`📈 Taxa de sucesso: ${((successCount / allUrls.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  console.log('\n💡 Próximos passos:');
  console.log('1. Aguarde 3-12 horas para o Google processar');
  console.log('2. Verifique no Google Search Console');
  console.log('3. URLs indexadas aparecerão em "Cobertura" > "Válidas"');
  console.log('\n✨ Indexação concluída!\n');
}

main().catch(error => {
  console.error('\n💥 Erro fatal:', error);
  process.exit(1);
});
