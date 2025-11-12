#!/usr/bin/env node

// Script para testar a tradução e verificar logs de newsletter
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTranslation() {
  console.log('🧪 Testando tradução com monitoramento de newsletter...');

  try {
    // 1. Verificar se há posts em português para traduzir
    console.log('\n1️⃣ Buscando posts em português...');
    const { data: ptPosts, error: ptError } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .eq('locale', 'pt-BR')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3);

    if (ptError) {
      console.error('❌ Erro ao buscar posts PT:', ptError);
      return;
    }

    console.log('✅ Posts PT encontrados:', ptPosts.length);
    
    if (ptPosts.length === 0) {
      console.log('⚠️ Nenhum post PT encontrado para traduzir');
      return;
    }

    // 2. Pegar o primeiro post
    const post = ptPosts[0];
    console.log(`\n2️⃣ Traduzindo post: "${post.title}"`);

    // 3. Verificar se já existe tradução
    const { data: existingEn, error: enError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('original_post_id', post.id)
      .eq('locale', 'en-US')
      .single();

    if (!enError && existingEn) {
      console.log('⚠️ Post já tem tradução, pulando...');
      return;
    }

    // 4. Verificar assinantes EN antes da tradução
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .eq('verified', true)
      .eq('subscribed', true);

    console.log('\n3️⃣ Estado dos assinantes EN-US antes da tradução:');
    subscribers?.forEach(sub => {
      console.log(`   📧 ${sub.email}: ${sub.last_email_sent_at || 'Never'}`);
    });

    // 5. Fazer a tradução via API
    console.log('\n4️⃣ Fazendo tradução via API...');
    
    const response = await fetch('http://localhost:3000/api/blog/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId: post.id,
        targetLocale: 'en-US'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API de tradução:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resultado da tradução:', result);

    // 6. Verificar assinantes EN depois da tradução
    console.log('\n5️⃣ Aguardando 3 segundos e verificando novamente...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { data: subscribersAfter, error: subAfterError } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .eq('verified', true)
      .eq('subscribed', true);

    console.log('\n6️⃣ Estado dos assinantes EN-US depois da tradução:');
    subscribersAfter?.forEach(sub => {
      console.log(`   📧 ${sub.email}: ${sub.last_email_sent_at || 'Never'}`);
    });

    // 7. Comparar para ver se houve mudança
    console.log('\n7️⃣ Análise de mudanças:');
    let changeDetected = false;
    
    for (const subAfter of subscribersAfter) {
      const subBefore = subscribers.find(s => s.email === subAfter.email);
      if (subBefore && subBefore.last_email_sent_at !== subAfter.last_email_sent_at) {
        console.log(`   ✅ ${subAfter.email}: Newsletter enviada!`);
        changeDetected = true;
      } else {
        console.log(`   ❌ ${subAfter.email}: Sem mudança`);
      }
    }

    if (!changeDetected) {
      console.log('\n⚠️ PROBLEMA: Nenhuma newsletter foi enviada apesar da tradução!');
    } else {
      console.log('\n🎉 SUCCESS: Newsletter enviada com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testTranslation();