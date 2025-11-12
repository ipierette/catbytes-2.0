#!/usr/bin/env node

// Teste rápido para verificar se a correção do timestamp funcionou
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function quickTestTimestamp() {
  console.log('⚡ Teste rápido: timestamp fix...');

  try {
    // 1. Estado antes
    const { data: before } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .single();

    console.log(`📧 Estado antes: ${before.last_email_sent_at}`);

    // 2. Pegar um post PT qualquer para forçar tradução
    const { data: ptPost } = await supabase
      .from('blog_posts')
      .select('id, title')
      .eq('locale', 'pt-BR')
      .eq('published', true)
      .limit(1)
      .single();

    console.log(`📝 Testando com: "${ptPost.title}"`);

    // 3. Fazer nova tradução
    const response = await fetch('http://localhost:3000/api/blog/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: ptPost.id,
        targetLocale: 'en-US'
      })
    });

    const result = await response.json();
    console.log(`📤 API Response: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    if (result.newsletter) {
      console.log(`📊 Newsletter: sent=${result.newsletter.sent}, count=${result.newsletter.successfullySent}`);
    }

    // 4. Verificar estado depois
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data: after } = await supabase
      .from('newsletter_subscribers')
      .select('email, last_email_sent_at')
      .eq('locale', 'en-US')
      .single();

    console.log(`📧 Estado depois: ${after.last_email_sent_at}`);

    // 5. Comparar
    if (before.last_email_sent_at !== after.last_email_sent_at) {
      console.log('🎉 FIX FUNCIONOU: Timestamp foi atualizado!');
    } else {
      console.log('❌ Problema ainda existe: Timestamp não mudou');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

quickTestTimestamp();