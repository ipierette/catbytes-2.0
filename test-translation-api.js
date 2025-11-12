#!/usr/bin/env node

// Teste da API de tradução para validar se funciona
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTranslationAPI() {
  console.log('🧪 Testando API de tradução...');

  try {
    // 1. Buscar alguns slugs para testar
    console.log('\n1️⃣ Buscando slugs de exemplo...');
    
    // Pegar um post PT
    const { data: ptPost, error: ptError } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('locale', 'pt-BR')
      .eq('published', true)
      .limit(1)
      .single();

    if (ptError || !ptPost) {
      console.error('❌ Erro ao buscar post PT:', ptError);
      return;
    }

    // Pegar um post EN
    const { data: enPost, error: enError } = await supabase
      .from('blog_posts')
      .select('slug, title')
      .eq('locale', 'en-US')
      .eq('published', true)
      .limit(1)
      .single();

    if (enError || !enPost) {
      console.error('❌ Erro ao buscar post EN:', enError);
      return;
    }

    console.log(`✅ Post PT: "${ptPost.title}" (${ptPost.slug})`);
    console.log(`✅ Post EN: "${enPost.title}" (${enPost.slug})`);

    // 2. Testar API de tradução PT -> EN
    console.log('\n2️⃣ Testando PT -> EN...');
    
    const ptToEnUrl = `http://localhost:3000/api/blog/posts/${ptPost.slug}/translation?targetLocale=en-US`;
    console.log('🔗 URL:', ptToEnUrl);

    try {
      const ptToEnResponse = await fetch(ptToEnUrl);
      const ptToEnData = await ptToEnResponse.json();
      
      console.log('📤 Status:', ptToEnResponse.status);
      console.log('📦 Response:', JSON.stringify(ptToEnData, null, 2));
    } catch (error) {
      console.error('❌ Erro PT -> EN:', error.message);
    }

    // 3. Testar API de tradução EN -> PT
    console.log('\n3️⃣ Testando EN -> PT...');
    
    const enToPtUrl = `http://localhost:3000/api/blog/posts/${enPost.slug}/translation?targetLocale=pt-BR`;
    console.log('🔗 URL:', enToPtUrl);

    try {
      const enToPtResponse = await fetch(enToPtUrl);
      const enToPtData = await enToPtResponse.json();
      
      console.log('📤 Status:', enToPtResponse.status);
      console.log('📦 Response:', JSON.stringify(enToPtData, null, 2));
    } catch (error) {
      console.error('❌ Erro EN -> PT:', error.message);
    }

    // 4. Testar com slug inexistente
    console.log('\n4️⃣ Testando slug inexistente...');
    
    const notFoundUrl = `http://localhost:3000/api/blog/posts/post-inexistente/translation?targetLocale=en-US`;
    
    try {
      const notFoundResponse = await fetch(notFoundUrl);
      const notFoundData = await notFoundResponse.json();
      
      console.log('📤 Status:', notFoundResponse.status);
      console.log('📦 Response:', JSON.stringify(notFoundData, null, 2));
    } catch (error) {
      console.error('❌ Erro slug inexistente:', error.message);
    }

    console.log('\n🎉 Teste da API concluído!');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testTranslationAPI();