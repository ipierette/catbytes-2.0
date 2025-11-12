#!/usr/bin/env node

// Teste final: simular exatamente o processo da API de tradução
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Template simplificado (igual ao da API)
function getTranslationNotificationEmailHTML(
  subscriberName,
  enTitle,
  ptTitle,
  excerpt,
  coverImageUrl,
  enPostUrl,
  ptPostUrl,
  locale,
  baseUrl
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Article: ${enTitle}</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #7C3AED;">CatBytes</h1>
    <p style="color: #666;">New article published!</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h2 style="color: #333; margin-top: 0;">${enTitle}</h2>
    <p style="color: #666; line-height: 1.6;">${excerpt}</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${enPostUrl}" 
         style="background: #7C3AED; color: white; padding: 12px 30px; 
                text-decoration: none; border-radius: 5px; display: inline-block;">
        Read Article
      </a>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 40px; color: #666; font-size: 14px;">
    <p>You're receiving this because you subscribed to CatBytes newsletter.</p>
  </div>
</body>
</html>
  `;
}

async function testExactAPIFlow() {
  console.log('🎯 Simulando exatamente o fluxo da API de tradução...');

  try {
    // 1. Pegar uma tradução recente (igual ao que a API acabou de criar)
    console.log('\n1️⃣ Pegando última tradução criada...');
    const { data: recentTranslation, error: transError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, excerpt, slug, translated_from')
      .eq('locale', 'en-US')
      .not('translated_from', 'is', null)
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (transError || !recentTranslation) {
      console.error('❌ Erro ao buscar tradução:', transError);
      return;
    }

    console.log('✅ Tradução encontrada:', recentTranslation.title);
    console.log('   ID:', recentTranslation.id);
    console.log('   Translated from:', recentTranslation.translated_from);

    // 2. Pegar post original (como a API faz)
    console.log('\n2️⃣ Buscando post original...');
    const { data: originalPost, error: origError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug')
      .eq('id', recentTranslation.translated_from)
      .single();

    if (origError || !originalPost) {
      console.error('❌ Erro ao buscar post original:', origError);
      return;
    }

    console.log('✅ Post original encontrado:', originalPost.title);

    // 3. Buscar assinantes EN-US (exatamente como a API)
    console.log('\n3️⃣ Buscando assinantes EN-US...');
    const { data: subscribers, error: fetchError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, verified, subscribed')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'en-US');

    if (fetchError) {
      console.error('❌ Erro ao buscar assinantes:', fetchError);
      return;
    }

    console.log('✅ Assinantes encontrados:', subscribers?.length || 0);
    
    if (!subscribers || subscribers.length === 0) {
      console.log('❌ Nenhum assinante encontrado - parando');
      return;
    }

    // 4. Preparar email (exatamente como a API)
    console.log('\n4️⃣ Preparando emails...');
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site';
    const htmlContent = getTranslationNotificationEmailHTML(
      'Dear Reader',
      recentTranslation.title,
      originalPost.title,
      recentTranslation.excerpt || 'New article available!',
      null,
      `${baseUrl}/en-US/blog/${recentTranslation.slug}`,
      `${baseUrl}/blog/${originalPost.slug}`,
      'en-US',
      baseUrl
    );

    // 5. Enviar emails em lote (como a API faz)
    console.log('\n5️⃣ Enviando emails...');
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'CatBytes <contato@catbytes.site>';
    console.log('📧 Usando email remetente:', fromEmail);
    
    const emails = subscribers.map(subscriber => ({
      from: fromEmail,
      to: subscriber.email,
      subject: `New Article: ${recentTranslation.title}`,
      html: htmlContent,
    }));

    console.log('📤 Preparando', emails.length, 'emails para envio...');

    // Enviar em lotes de 50 (como a API)
    const batchSize = 50;
    let sentCount = 0;
    let errors = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      console.log(`   📦 Enviando lote ${Math.floor(i/batchSize) + 1} (${batch.length} emails)...`);

      try {
        const batchResult = await resend.batch.send(batch);
        console.log(`   ✅ Lote ${Math.floor(i/batchSize) + 1} enviado:`, batchResult);
        sentCount += batch.length;
      } catch (batchError) {
        console.error(`   ❌ Erro no lote ${Math.floor(i/batchSize) + 1}:`, batchError);
        errors.push(batchError);
      }
    }

    console.log(`\n6️⃣ Resultado do envio:`);
    console.log(`   ✅ Enviados: ${sentCount}/${emails.length}`);
    console.log(`   ❌ Erros: ${errors.length}`);

    // 6. Atualizar timestamps dos assinantes (como a API faz)
    if (sentCount > 0) {
      console.log('\n7️⃣ Atualizando timestamps...');
      
      const subscriberIds = subscribers.map(s => s.id);
      const { data: updateData, error: updateError } = await supabaseAdmin
        .from('newsletter_subscribers')
        .update({ last_email_sent_at: new Date().toISOString() })
        .in('id', subscriberIds)
        .select();

      if (updateError) {
        console.error('❌ Erro ao atualizar timestamps:', updateError);
      } else {
        console.log('✅ Timestamps atualizados:', updateData?.length);
      }
    }

    // 7. Verificar resultado final
    console.log('\n8️⃣ Verificando resultado final...');
    const { data: finalCheck, error: finalError } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .eq('verified', true);

    if (!finalError && finalCheck) {
      console.log('📊 Estado final dos assinantes:');
      finalCheck.forEach(sub => {
        console.log(`   📧 ${sub.email}: ${sub.last_email_sent_at || 'Never'}`);
      });
    }

    console.log('\n🎉 Teste completo! Se chegou até aqui, o processo está funcionando.');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testExactAPIFlow();