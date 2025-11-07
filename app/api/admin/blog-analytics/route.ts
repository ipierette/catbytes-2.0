import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  // Total de visualizações (blog_posts.views)
  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, views, created_at');

  // Leituras reais (analytics_blog_views)
  const { data: reads, error: readsError } = await supabase
    .from('analytics_blog_views')
    .select('post_id, read_time_seconds, scroll_depth_percent, session_id, locale, timestamp');

  // Métricas agregadas
  const totalViews = posts?.reduce((acc, p) => acc + (p.views || 0), 0) || 0;
  const totalReads = reads?.length || 0;
  const avgReadTime = reads && reads.length > 0 ? reads.reduce((acc, r) => acc + (r.read_time_seconds || 0), 0) / reads.length : 0;
  const avgScrollDepth = reads && reads.length > 0 ? reads.reduce((acc, r) => acc + (r.scroll_depth_percent || 0), 0) / reads.length : 0;

  // Top posts
  const topPosts = posts
    ?.map(post => {
      const postReads = reads?.filter(r => r.post_id === post.id) || [];
      const qualityReads = postReads.filter(r => r.read_time_seconds > 30).length;
      const bounceRate = postReads.length > 0 ? (postReads.filter(r => r.read_time_seconds < 30).length / postReads.length) * 100 : 0;
      return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.views,
        reads: postReads.length,
        avgReadTime: postReads.length > 0 ? postReads.reduce((acc, r) => acc + (r.read_time_seconds || 0), 0) / postReads.length : 0,
        bounceRate: Math.round(bounceRate),
      };
    })
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);

  // Views por dia
  const viewsByDay: Record<string, { views: number; reads: number }> = {};
  reads?.forEach(r => {
    const date = r.timestamp?.slice(0, 10);
    if (!date) return;
    if (!viewsByDay[date]) viewsByDay[date] = { views: 0, reads: 0 };
    viewsByDay[date].reads += 1;
  });
  posts?.forEach(p => {
    // Supondo que blog_posts tem campo created_at
    const date = p.created_at?.slice(0, 10);
    if (!date) return;
    if (!viewsByDay[date]) viewsByDay[date] = { views: 0, reads: 0 };
    viewsByDay[date].views += p.views || 0;
  });

  // Views por idioma
  const viewsByLanguage: Record<string, number> = {};
  reads?.forEach(r => {
    const lang = r.locale || 'unknown';
    if (!viewsByLanguage[lang]) viewsByLanguage[lang] = 0;
    viewsByLanguage[lang] += 1;
  });

  // Métricas de engajamento
  const engagementMetrics = {
    totalSessions: new Set(reads?.map(r => r.session_id)).size,
    qualityReads: reads?.filter(r => r.read_time_seconds > 30).length || 0,
    completionRate: reads && reads.length > 0 ? (reads.filter(r => r.scroll_depth_percent > 80).length / reads.length) * 100 : 0,
  };

  return NextResponse.json({
    success: true,
    data: {
      totalViews,
      totalReads,
      avgReadTime: Math.round(avgReadTime),
      avgScrollDepth: Math.round(avgScrollDepth),
      topPosts,
      viewsByDay: Object.entries(viewsByDay).map(([date, v]) => ({ date, ...v })),
      viewsByLanguage,
      engagementMetrics,
    },
  });
}
