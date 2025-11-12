#!/usr/bin/env node

// Script para diagnosticar o estado da base de dados
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function diagnoseBlogDatabase() {
  console.log('🔍 Diagnóstico completo da base de dados...');

  try {
    // 1. Posts em português
    console.log('\n1️⃣ Posts em português (PT-BR):');
    const { data: ptPosts, error: ptError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, locale, published, created_at, original_post_id')
      .eq('locale', 'pt-BR')
      .order('created_at', { ascending: false })
      .limit(5);

    if (ptError) {
      console.error('❌ Erro:', ptError);
    } else {
      console.log(`✅ ${ptPosts.length} posts PT encontrados:`);
      ptPosts.forEach(post => {
        console.log(`   📄 ${post.title} (${post.id})`);
        console.log(`      Published: ${post.published}, Created: ${post.created_at}`);
      });
    }

    // 2. Posts em inglês
    console.log('\n2️⃣ Posts em inglês (EN-US):');
    const { data: enPosts, error: enError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, locale, published, created_at, original_post_id')
      .eq('locale', 'en-US')
      .order('created_at', { ascending: false })
      .limit(5);

    if (enError) {
      console.error('❌ Erro:', enError);
    } else {
      console.log(`✅ ${enPosts.length} posts EN encontrados:`);
      enPosts.forEach(post => {
        console.log(`   📄 ${post.title} (${post.id})`);
        console.log(`      Original ID: ${post.original_post_id}, Published: ${post.published}`);
      });
    }

    // 3. Todos os locales disponíveis
    console.log('\n3️⃣ Todos os locales na base:');
    const { data: allLocales, error: localeError } = await supabase
      .from('blog_posts')
      .select('locale, published')
      .order('locale');

    if (localeError) {
      console.error('❌ Erro:', localeError);
    } else {
      const localeStats = {};
      allLocales.forEach(post => {
        if (!localeStats[post.locale]) {
          localeStats[post.locale] = { total: 0, published: 0 };
        }
        localeStats[post.locale].total++;
        if (post.published) {
          localeStats[post.locale].published++;
        }
      });

      console.log('📊 Estatísticas por locale:');
      Object.entries(localeStats).forEach(([locale, stats]) => {
        console.log(`   ${locale}: ${stats.published}/${stats.total} publicados`);
      });
    }

    // 4. Assinantes por locale
    console.log('\n4️⃣ Assinantes por locale:');
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('locale, verified, subscribed, last_email_sent_at')
      .order('locale');

    if (subError) {
      console.error('❌ Erro:', subError);
    } else {
      const subStats = {};
      subscribers.forEach(sub => {
        if (!subStats[sub.locale]) {
          subStats[sub.locale] = { total: 0, verified: 0, active: 0, sentEmail: 0 };
        }
        subStats[sub.locale].total++;
        if (sub.verified) subStats[sub.locale].verified++;
        if (sub.verified && sub.subscribed) subStats[sub.locale].active++;
        if (sub.last_email_sent_at) subStats[sub.locale].sentEmail++;
      });

      console.log('📊 Estatísticas de assinantes:');
      Object.entries(subStats).forEach(([locale, stats]) => {
        console.log(`   ${locale}: ${stats.active} ativos (${stats.verified} verificados, ${stats.sentEmail} receberam emails)`);
      });
    }

    // 5. Posts traduzidos (relacionamento)
    console.log('\n5️⃣ Relacionamento de traduções:');
    const { data: translations, error: transError } = await supabase
      .from('blog_posts')
      .select('id, title, locale, original_post_id, created_at')
      .not('original_post_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transError) {
      console.error('❌ Erro:', transError);
    } else {
      console.log(`✅ ${translations.length} traduções encontradas:`);
      translations.forEach(trans => {
        console.log(`   🔄 ${trans.title} (${trans.locale})`);
        console.log(`      Original: ${trans.original_post_id}, Created: ${trans.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

diagnoseBlogDatabase();