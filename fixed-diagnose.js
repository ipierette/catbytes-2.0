#!/usr/bin/env node

// Script corrigido para diagnóstico usando o campo correto
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixedDiagnose() {
  console.log('🔧 Diagnóstico corrigido com campo translated_from...');

  try {
    // 1. Posts traduzidos (usando campo correto)
    console.log('\n1️⃣ Posts traduzidos (usando translated_from):');
    const { data: translations, error: transError } = await supabase
      .from('blog_posts')
      .select('id, title, locale, translated_from, created_at, published')
      .not('translated_from', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transError) {
      console.error('❌ Erro:', transError);
    } else {
      console.log(`✅ ${translations.length} traduções encontradas:`);
      translations.forEach(trans => {
        console.log(`   🔄 ${trans.title} (${trans.locale})`);
        console.log(`      Translated from: ${trans.translated_from}, Created: ${trans.created_at}`);
        console.log(`      Published: ${trans.published}`);
      });
    }

    // 2. Posts EN-US mais recentes
    console.log('\n2️⃣ Posts EN-US mais recentes:');
    const { data: recentEn, error: enError } = await supabase
      .from('blog_posts')
      .select('id, title, translated_from, created_at, published')
      .eq('locale', 'en-US')
      .order('created_at', { ascending: false })
      .limit(5);

    if (enError) {
      console.error('❌ Erro:', enError);
    } else {
      console.log(`✅ ${recentEn.length} posts EN-US recentes:`);
      recentEn.forEach(post => {
        console.log(`   📄 ${post.title}`);
        console.log(`      Translated from: ${post.translated_from || 'Não é tradução'}`);
        console.log(`      Published: ${post.published}, Created: ${post.created_at}`);
      });
    }

    // 3. Verificar se as traduções recentes deveriam ter enviado newsletter
    console.log('\n3️⃣ Análise de newsletter para traduções recentes:');
    
    const recentTranslations = translations.filter(t => 
      t.locale === 'en-US' && t.published && t.translated_from
    );

    console.log(`🔍 ${recentTranslations.length} traduções EN-US publicadas que deveriam enviar newsletter:`);
    
    if (recentTranslations.length > 0) {
      // Verificar assinantes
      const { data: subscribers, error: subError } = await supabase
        .from('newsletter_subscribers')
        .select('email, last_email_sent_at, verified, subscribed')
        .eq('locale', 'en-US')
        .eq('verified', true)
        .eq('subscribed', true);

      console.log(`📧 ${subscribers?.length || 0} assinantes EN-US ativos`);
      
      // Verificar qual foi a última tradução
      const latestTranslation = recentTranslations[0];
      console.log(`\n🕐 Última tradução: "${latestTranslation.title}"`);
      console.log(`   Created: ${latestTranslation.created_at}`);
      console.log(`   Translated from: ${latestTranslation.translated_from}`);
      
      if (subscribers && subscribers.length > 0) {
        subscribers.forEach(sub => {
          const lastEmailDate = sub.last_email_sent_at ? new Date(sub.last_email_sent_at) : null;
          const translationDate = new Date(latestTranslation.created_at);
          
          console.log(`\n   📧 ${sub.email}:`);
          console.log(`      Last email: ${sub.last_email_sent_at || 'Never'}`);
          
          if (!lastEmailDate) {
            console.log(`      ❌ NUNCA recebeu email - newsletter falhou`);
          } else if (translationDate > lastEmailDate) {
            console.log(`      ❌ Newsletter não enviada para última tradução`);
          } else {
            console.log(`      ✅ Newsletter pode ter sido enviada`);
          }
        });
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

fixedDiagnose();