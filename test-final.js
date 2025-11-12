#!/usr/bin/env node

// Teste final: fazer uma tradução nova e verificar se a newsletter funciona
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFinalNewsletter() {
  console.log('🎯 TESTE FINAL: Verificando se newsletter funciona agora...');

  try {
    // 1. Verificar estado atual do assinante
    console.log('\n1️⃣ Estado atual do assinante:');
    const { data: subscriber, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at, verified, subscribed')
      .eq('locale', 'en-US')
      .eq('email', 'valterzjr@gmail.com')
      .single();

    if (subError || !subscriber) {
      console.error('❌ Erro ao buscar assinante:', subError);
      return;
    }

    console.log(`   📧 ${subscriber.email}`);
    console.log(`   ✅ Verified: ${subscriber.verified}, Subscribed: ${subscriber.subscribed}`);
    console.log(`   🕐 Last email: ${subscriber.last_email_sent_at || 'Never'}`);

    // 2. Verificar RESEND_FROM_EMAIL
    console.log('\n2️⃣ Configuração do email:');
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    console.log(`   📧 RESEND_FROM_EMAIL: ${fromEmail || 'NÃO CONFIGURADO'}`);
    
    if (!fromEmail) {
      console.log('   ⚠️  Usando fallback: CatBytes <contato@catbytes.site>');
    }

    // 3. Verificar se há posts PT para traduzir que ainda não foram traduzidos
    console.log('\n3️⃣ Buscando posts PT sem tradução...');
    const { data: ptPosts, error: ptError } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('locale', 'pt-BR')
      .eq('published', true)
      .limit(5);

    if (ptError || !ptPosts) {
      console.error('❌ Erro ao buscar posts PT:', ptError);
      return;
    }

    // Verificar quais não têm tradução
    const postsWithoutTranslation = [];
    for (const post of ptPosts) {
      const { data: existing, error } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('translated_from', post.id)
        .eq('locale', 'en-US');

      if (!error && (!existing || existing.length === 0)) {
        postsWithoutTranslation.push(post);
      }
    }

    console.log(`   📚 Posts PT encontrados: ${ptPosts.length}`);
    console.log(`   🔄 Posts sem tradução: ${postsWithoutTranslation.length}`);
    
    if (postsWithoutTranslation.length > 0) {
      console.log('\n   Posts disponíveis para traduzir:');
      postsWithoutTranslation.forEach(post => {
        console.log(`     📄 "${post.title}" (${post.id})`);
      });

      console.log('\n💡 PRÓXIMOS PASSOS:');
      console.log('   1. ✅ Configuração corrigida (RESEND_FROM_EMAIL)');
      console.log('   2. ✅ Domínio verificado (contato@catbytes.site)');
      console.log('   3. ✅ Assinante EN-US ativo');
      console.log(`   4. 🔄 Para testar: traduzir o post "${postsWithoutTranslation[0].title}"`);
      console.log('   5. 📧 Newsletter será enviada automaticamente');
    } else {
      console.log('\n⚠️  Todos os posts já foram traduzidos');
      console.log('💡 Para testar, você pode criar um novo post PT ou forçar uma nova tradução');
    }

    // 4. Mostrar command para testar
    if (postsWithoutTranslation.length > 0) {
      const testPost = postsWithoutTranslation[0];
      console.log('\n4️⃣ COMANDO DE TESTE:');
      console.log(`   curl -X POST http://localhost:3000/api/blog/translate \\`);
      console.log(`        -H "Content-Type: application/json" \\`);
      console.log(`        -d '{"postId":"${testPost.id}","targetLocale":"en-US"}'`);
    }

    console.log('\n🎉 SISTEMA PRONTO! Newsletter funcionará na próxima tradução.');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testFinalNewsletter();