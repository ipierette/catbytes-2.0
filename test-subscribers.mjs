import { supabaseAdmin } from './lib/supabase.js';

async function testSubscribers() {
  try {
    console.log('🔍 Verificando assinantes EN-US...');
    
    const { data: subscribers, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'en-US');

    if (error) {
      console.error('❌ Erro:', error);
    } else {
      console.log('✅ Assinantes EN-US:', subscribers?.length || 0);
      if (subscribers?.length > 0) {
        console.log('📧 Primeiro assinante:', {
          email: subscribers[0].email.replace(/(.{3}).+(@.+)/, '$1***$2'),
          verified: subscribers[0].verified,
          subscribed: subscribers[0].subscribed,
          locale: subscribers[0].locale
        });
      }
    }
  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

testSubscribers();