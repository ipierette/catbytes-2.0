import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lbjekucdxgouwgegpdhi.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
);

async function debugTranslation() {
  console.log('🔍 Debugando problema de tradução...');
  
  try {
    const testSlug = 'a-arte-de-criar-conteudo-que-converte-tendencias-e-ferramentas';
    
    // 1. Buscar post original
    const { data: originalPost, error: originalError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, slug, locale, translated_from, title')
      .eq('slug', testSlug)
      .eq('published', true)
      .single();

    if (originalError) {
      console.error('❌ Erro buscando post original:', originalError);
      return;
    }

    console.log('📝 Post original encontrado:', {
      id: originalPost.id,
      slug: originalPost.slug,
      locale: originalPost.locale,
      title: originalPost.title.substring(0, 50) + '...'
    });

    // 2. Buscar tradução usando translated_from
    console.log('\n🌐 Buscando tradução EN-US...');
    const { data: translation, error: translationError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, slug, locale, translated_from, title')
      .eq('translated_from', originalPost.id)
      .eq('locale', 'en-US')
      .eq('published', true);

    if (translationError) {
      console.error('❌ Erro buscando tradução:', translationError);
      return;
    }

    console.log('📊 Resultado da busca de tradução:', {
      encontradas: translation?.length || 0,
      dados: translation
    });

    if (translation && translation.length > 0) {
      console.log('✅ Tradução encontrada:', {
        id: translation[0].id,
        slug: translation[0].slug,
        locale: translation[0].locale,
        title: translation[0].title.substring(0, 50) + '...'
      });
    } else {
      console.log('❌ Nenhuma tradução encontrada!');
      
      // 3. Vamos buscar TODOS os posts EN-US para ver o que existe
      console.log('\n📋 Buscando TODOS os posts EN-US...');
      const { data: allEnPosts, error: allEnError } = await supabaseAdmin
        .from('blog_posts')
        .select('slug, title, translated_from')
        .eq('locale', 'en-US')
        .eq('published', true);

      if (allEnError) {
        console.error('❌ Erro:', allEnError);
      } else {
        console.log('📚 Posts EN-US encontrados:', allEnPosts?.length || 0);
        allEnPosts?.forEach(post => {
          if (post.slug.includes('arte-de-criar-conteudo')) {
            console.log('🎯 Post relacionado encontrado:', {
              slug: post.slug,
              title: post.title.substring(0, 50) + '...',
              translated_from: post.translated_from
            });
          }
        });
      }
    }

  } catch (err) {
    console.error('❌ Erro geral:', err);
  }
}

debugTranslation();