#!/usr/bin/env node

// Teste para simular uma nova tradução via API e verificar se newsletter funciona
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTranslationWithNewsletter() {
  console.log('🧪 Testando tradução com newsletter...');

  try {
    // 1. Encontrar um post PT que ainda NÃO foi traduzido
    console.log('\n1️⃣ Procurando post PT sem tradução...');
    
    const { data: ptPosts, error: ptError } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('locale', 'pt-BR')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (ptError || !ptPosts || ptPosts.length === 0) {
      console.error('❌ Erro ao buscar posts PT:', ptError);
      return;
    }

    // Verificar quais não têm tradução
    let postToTranslate = null;
    
    for (const post of ptPosts) {
      const { data: existingTranslation, error: transError } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('translated_from', post.id)
        .eq('locale', 'en-US');

      if (!transError && (!existingTranslation || existingTranslation.length === 0)) {
        postToTranslate = post;
        break;
      }
    }

    if (!postToTranslate) {
      console.log('⚠️  Todos os posts PT já foram traduzidos');
      console.log('💡 Vou testar com o post mais recente para demonstrar o processo...');
      postToTranslate = ptPosts[0];
    } else {
      console.log(`✅ Post sem tradução encontrado: "${postToTranslate.title}"`);
    }

    // 2. Verificar estado antes da tradução
    console.log('\n2️⃣ Estado antes da tradução:');
    const { data: subscriberBefore, error: subBeforeError } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .eq('verified', true)
      .eq('subscribed', true)
      .single();

    console.log(`   📧 ${subscriberBefore.email}: ${subscriberBefore.last_email_sent_at || 'Never'}`);

    // 3. Fazer tradução via API
    console.log('\n3️⃣ Fazendo tradução via API...');
    console.log(`   📝 Post: "${postToTranslate.title}"`);
    console.log(`   🆔 ID: ${postToTranslate.id}`);

    const response = await fetch('http://localhost:3000/api/blog/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: postToTranslate.id,
        targetLocale: 'en-US'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API de tradução:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resultado da tradução:', JSON.stringify(result, null, 2));

    // 4. Verificar estado após tradução
    console.log('\n4️⃣ Aguardando 3 segundos e verificando estado...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: subscriberAfter, error: subAfterError } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .eq('verified', true)
      .eq('subscribed', true)
      .single();

    console.log(`   📧 ${subscriberAfter.email}: ${subscriberAfter.last_email_sent_at || 'Never'}`);

    // 5. Analisar resultado
    console.log('\n5️⃣ Análise do resultado:');
    const beforeTime = subscriberBefore.last_email_sent_at ? new Date(subscriberBefore.last_email_sent_at) : null;
    const afterTime = subscriberAfter.last_email_sent_at ? new Date(subscriberAfter.last_email_sent_at) : null;

    if (!beforeTime && afterTime) {
      console.log('   🎉 SUCCESS: Primeira newsletter enviada!');
    } else if (beforeTime && afterTime && afterTime > beforeTime) {
      console.log('   🎉 SUCCESS: Newsletter enviada com sucesso!');
      const diffSeconds = (afterTime - beforeTime) / 1000;
      console.log(`   ⏱️  Diferença: ${diffSeconds} segundos`);
    } else {
      console.log('   ❌ PROBLEMA: Newsletter não foi enviada');
      
      // Verificar resposta da API
      if (result.newsletter) {
        console.log('   📊 Detalhes da newsletter na resposta:');
        console.log(`      Sent: ${result.newsletter.sent}`);
        console.log(`      Subscribers: ${result.newsletter.totalSubscribers || 'N/A'}`);
        console.log(`      Successfully sent: ${result.newsletter.successfullySent || 'N/A'}`);
        if (result.newsletter.errors) {
          console.log(`      Errors: ${JSON.stringify(result.newsletter.errors)}`);
        }
      }
    }

    console.log('\n🔍 CONCLUSÃO:');
    if (result.success) {
      console.log('✅ API de tradução funcionou');
      if (result.newsletter && result.newsletter.sent) {
        console.log('✅ Sistema de newsletter está funcionando via API');
        console.log('💡 SOLUÇÃO: Use sempre a API /api/blog/translate para garantir envio da newsletter');
      } else {
        console.log('❌ Newsletter não enviada - verificar configurações');
      }
    } else {
      console.log('❌ Problema na API de tradução');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testTranslationWithNewsletter();