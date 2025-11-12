#!/usr/bin/env node

// Script para testar newsletter diretamente sem servidor
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const resend = new Resend(process.env.RESEND_API_KEY);

// Template de email simplificado
function createEmailTemplate(postTitle, postSlug, postExcerpt, subscriberEmail) {
  return {
    to: [subscriberEmail],
    from: 'newsletter@catbytes.com',
    subject: `New Article: ${postTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Article: ${postTitle}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #7C3AED;">CatBytes</h1>
          <p style="color: #666;">New article published!</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">${postTitle}</h2>
          <p style="color: #666; line-height: 1.6;">${postExcerpt}</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://catbytes.site/en-US/blog/${postSlug}" 
               style="background: #7C3AED; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
              Read Article
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 40px; color: #666; font-size: 14px;">
          <p>You're receiving this because you subscribed to CatBytes newsletter.</p>
          <p><a href="https://catbytes.site/unsubscribe?email=${subscriberEmail}">Unsubscribe</a></p>
        </div>
      </body>
      </html>
    `
  };
}

async function testNewsletterDirect() {
  console.log('🧪 Testando newsletter diretamente (sem servidor)...');

  try {
    // 1. Buscar um post traduzido recente
    console.log('\n1️⃣ Buscando post traduzido recente...');
    const { data: enPosts, error: enError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, original_post_id')
      .eq('locale', 'en-US')
      .eq('published', true)
      .not('original_post_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (enError || !enPosts || enPosts.length === 0) {
      console.error('❌ Erro ao buscar posts EN ou nenhum encontrado:', enError);
      return;
    }

    const enPost = enPosts[0];
    console.log('✅ Post encontrado:', enPost.title);

    // 2. Buscar assinantes EN-US
    console.log('\n2️⃣ Buscando assinantes EN-US...');
    const { data: subscribers, error: subError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, last_email_sent_at')
      .eq('locale', 'en-US')
      .eq('verified', true)
      .eq('subscribed', true);

    if (subError || !subscribers || subscribers.length === 0) {
      console.error('❌ Erro ao buscar assinantes ou nenhum encontrado:', subError);
      return;
    }

    console.log(`✅ ${subscribers.length} assinantes encontrados`);
    
    // 3. Estado antes do email
    console.log('\n3️⃣ Estado antes do envio:');
    for (const sub of subscribers) {
      console.log(`   📧 ${sub.email}: ${sub.last_email_sent_at || 'Never'}`);
    }

    // 4. Enviar newsletter para cada assinante
    console.log('\n4️⃣ Enviando newsletters...');
    
    const emailTemplate = createEmailTemplate(
      enPost.title,
      enPost.slug,
      enPost.excerpt || 'New article available on CatBytes!',
      subscribers[0].email // Pegamos o primeiro para teste
    );

    console.log('📤 Enviando email para:', subscribers[0].email);
    
    const emailResult = await resend.emails.send(emailTemplate);
    console.log('✅ Resultado do envio:', emailResult);

    // 5. Atualizar timestamp do subscriber
    if (emailResult.data && emailResult.data.id) {
      console.log('\n5️⃣ Atualizando timestamp do subscriber...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ last_email_sent_at: new Date().toISOString() })
        .eq('id', subscribers[0].id)
        .select();

      if (updateError) {
        console.error('❌ Erro ao atualizar timestamp:', updateError);
      } else {
        console.log('✅ Timestamp atualizado:', updateData);
      }
    }

    // 6. Verificar estado depois
    console.log('\n6️⃣ Verificando estado após envio...');
    const { data: subscribersAfter, error: subAfterError } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .eq('verified', true)
      .eq('subscribed', true);

    console.log('\n7️⃣ Estado após o envio:');
    for (const sub of subscribersAfter) {
      console.log(`   📧 ${sub.email}: ${sub.last_email_sent_at || 'Never'}`);
    }

    console.log('\n🎉 Teste completo! Se o email foi enviado, o timestamp foi atualizado.');

  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testNewsletterDirect();