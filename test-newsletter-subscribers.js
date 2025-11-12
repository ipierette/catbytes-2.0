const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key';

console.log('🔍 Testing newsletter subscribers...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testNewsletterSubscribers() {
  try {
    console.log('📊 Checking EN-US newsletter subscribers...');
    
    // Check EN-US subscribers
    const { data: enSubscribers, error: enError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'en-US');

    if (enError) {
      console.error('❌ Error fetching EN-US subscribers:', enError);
    } else {
      console.log('✅ EN-US subscribers found:', enSubscribers?.length || 0);
      if (enSubscribers && enSubscribers.length > 0) {
        console.log('📧 First subscriber:', {
          id: enSubscribers[0].id,
          email: enSubscribers[0].email.replace(/(.{3}).+(@.+)/, '$1***$2'),
          verified: enSubscribers[0].verified,
          subscribed: enSubscribers[0].subscribed,
          locale: enSubscribers[0].locale
        });
      }
    }

    // Check PT-BR subscribers for comparison
    const { data: ptSubscribers, error: ptError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('verified', true)
      .eq('subscribed', true)
      .eq('locale', 'pt-BR');

    if (ptError) {
      console.error('❌ Error fetching PT-BR subscribers:', ptError);
    } else {
      console.log('✅ PT-BR subscribers found:', ptSubscribers?.length || 0);
    }

    // Check recent blog posts
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('id, title, slug, locale, translated_from, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (postsError) {
      console.error('❌ Error fetching posts:', postsError);
    } else {
      console.log('📝 Recent posts:');
      posts?.forEach(post => {
        console.log(`  - ${post.locale}: ${post.title} (${post.slug})${post.translated_from ? ' [TRANSLATION]' : ''}`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNewsletterSubscribers();