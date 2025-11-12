import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lbjekucdxgouwgegpdhi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

async function checkPosts() {
  console.log('🔍 Verificando posts e traduções...');
  
  try {
    // Buscar todos os posts
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('id, slug, locale, title, translated_from')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro:', error);
      return;
    }

    console.log('📊 Total de posts:', posts?.length || 0);
    
    // Separar por idioma
    const ptPosts = posts?.filter(p => p.locale === 'pt-BR') || [];
    const enPosts = posts?.filter(p => p.locale === 'en-US') || [];
    
    console.log('🇧🇷 Posts PT-BR:', ptPosts.length);
    console.log('🇺🇸 Posts EN-US:', enPosts.length);
    
    // Mostrar alguns posts PT-BR
    console.log('\n📝 Posts PT-BR recentes:');
    ptPosts.slice(0, 3).forEach(post => {
      console.log(`  - ${post.slug} | "${post.title}"`);
    });
    
    // Mostrar posts EN-US e suas relações
    console.log('\n🌐 Posts EN-US e traduções:');
    enPosts.forEach(post => {
      console.log(`  - ${post.slug} | "${post.title}"`);
      console.log(`    Traduzido de: ${post.translated_from || 'N/A'}`);
      
      // Encontrar post original
      if (post.translated_from) {
        const original = ptPosts.find(p => p.id === post.translated_from);
        if (original) {
          console.log(`    Post original: ${original.slug}`);
        }
      }
      console.log('');
    });

  } catch (err) {
    console.error('❌ Erro:', err);
  }
}

checkPosts();