#!/usr/bin/env node

// Teste específico para investigar por que a newsletter não foi enviada
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateLatestTranslation() {
  console.log('🔍 Investigando a última tradução...');

  try {
    // 1. Verificar a última tradução criada
    console.log('\n1️⃣ Última tradução criada:');
    const { data: latestTranslation, error: transError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('locale', 'en-US')
      .not('translated_from', 'is', null)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (transError || !latestTranslation) {
      console.error('❌ Erro ao buscar última tradução:', transError);
      return;
    }

    console.log(`✅ Título: "${latestTranslation.title}"`);
    console.log(`   ID: ${latestTranslation.id}`);
    console.log(`   Slug: ${latestTranslation.slug}`);
    console.log(`   Criado: ${latestTranslation.created_at}`);
    console.log(`   Traduzido de: ${latestTranslation.translated_from}`);

    // 2. Verificar estado atual do assinante
    console.log('\n2️⃣ Estado do assinante EN-US:');
    const { data: subscriber, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at, verified, subscribed')
      .eq('locale', 'en-US')
      .single();

    if (subError || !subscriber) {
      console.error('❌ Erro ao buscar assinante:', subError);
      return;
    }

    console.log(`   📧 Email: ${subscriber.email}`);
    console.log(`   ✅ Verified: ${subscriber.verified}, Subscribed: ${subscriber.subscribed}`);
    console.log(`   🕐 Last email: ${subscriber.last_email_sent_at || 'Never'}`);

    // 3. Comparar timestamps
    const translationDate = new Date(latestTranslation.created_at);
    const lastEmailDate = subscriber.last_email_sent_at ? new Date(subscriber.last_email_sent_at) : null;

    console.log('\n3️⃣ Análise de timestamps:');
    console.log(`   📅 Tradução criada: ${translationDate.toISOString()}`);
    console.log(`   📧 Último email: ${lastEmailDate?.toISOString() || 'Never'}`);

    if (!lastEmailDate) {
      console.log('   ❌ PROBLEMA: Nunca foi enviado email');
    } else if (translationDate > lastEmailDate) {
      const diffMinutes = (translationDate - lastEmailDate) / (1000 * 60);
      console.log(`   ❌ PROBLEMA: Newsletter não enviada (diferença: ${diffMinutes.toFixed(1)} minutos)`);
    } else {
      console.log('   ✅ Newsletter pode ter sido enviada');
    }

    // 4. Testar se a API de tradução está funcionando corretamente agora
    console.log('\n4️⃣ Testando sistema de newsletter atual...');
    
    // Simular o mesmo processo que a API de tradução faz
    const { data: currentSubscribers, error: currentSubError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, verified, subscribed')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'en-US');

    console.log(`   📊 Assinantes EN-US ativos: ${currentSubscribers?.length || 0}`);

    // 5. Verificar configurações do Resend
    console.log('\n5️⃣ Configurações:');
    console.log(`   🔑 RESEND_API_KEY: ${process.env.RESEND_API_KEY ? 'Configurado' : 'FALTANDO'}`);
    console.log(`   📧 RESEND_FROM_EMAIL: ${process.env.RESEND_FROM_EMAIL || 'NÃO CONFIGURADO'}`);
    console.log(`   🌐 SITE_URL: ${process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000'}`);

    // 6. Verificar se foi usado o endpoint correto
    console.log('\n6️⃣ Verificação do processo de tradução:');
    console.log('   ❓ Como você criou a tradução?');
    console.log('   📝 Via API /api/blog/translate?');
    console.log('   📝 Via painel admin?');
    console.log('   📝 Outro método?');

    // 7. Sugerir próximos passos
    console.log('\n7️⃣ Próximos passos para diagnóstico:');
    console.log('   1️⃣ Verificar logs do servidor Next.js durante tradução');
    console.log('   2️⃣ Testar envio manual de newsletter');
    console.log('   3️⃣ Verificar se API de tradução está usando endpoint correto');

  } catch (error) {
    console.error('❌ Erro na investigação:', error);
  }
}

investigateLatestTranslation();