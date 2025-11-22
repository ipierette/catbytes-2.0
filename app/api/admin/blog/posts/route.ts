import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCookie } from '@/lib/api-security'
import { supabaseAdmin, generateSlug } from '@/lib/supabase'
import { Resend } from 'resend'
import { getNewPostEmailHTML } from '@/lib/email-templates'
import { promoteArticle } from '@/lib/blog-social-promoter'

const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// =====================================================
// GET /api/admin/blog/posts
// Get ALL blog posts (including drafts and unpublished) - Admin only
// =====================================================

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized', message: 'Admin authentication required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get ALL posts (including unpublished and drafts)
    const { data: posts, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*')
      .is('deleted_at', null) // Exclude soft-deleted posts
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Admin API] Error fetching posts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch posts', details: error.message },
        { status: 500 }
      )
    }

    // Map status field from 'published' boolean to status string
    const postsWithStatus = posts.map(post => {
      let status = 'draft'
      if (post.published) {
        status = 'published'
      } else if (post.scheduled_at) {
        status = 'scheduled'
      }
      
      return {
        ...post,
        status
      }
    })

    return NextResponse.json(
      { 
        success: true,
        posts: postsWithStatus,
        total: postsWithStatus.length 
      },
      {
        headers: {
          'Cache-Control': 'no-store', // Don't cache admin data
        },
      }
    )
  } catch (error) {
    console.error('[Admin API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// =====================================================
// DELETE /api/admin/blog/posts
// Delete a blog post - Admin only
// =====================================================

export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized', message: 'Admin authentication required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Get ID from query params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Post ID required' },
        { status: 400 }
      )
    }

    // Delete post
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('[Admin API] Error deleting post:', error)
      return NextResponse.json(
        { error: 'Failed to delete post', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Admin API] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// =====================================================
// POST /api/admin/blog/posts
// Create a new blog post manually - Admin only
// =====================================================

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminVerification = await verifyAdminCookie(request)
    if (!adminVerification.valid) {
      return adminVerification.error || NextResponse.json(
        { error: 'Unauthorized', message: 'Admin authentication required' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { 
      title, 
      excerpt, 
      content, 
      tags, 
      coverImageUrl, 
      contentImages, 
      highlight,
      saveAsDraft,
      scheduleForLater,
      scheduledDate,
      scheduledTime
    } = body

    console.log('[Manual Post] Request body:', JSON.stringify(body, null, 2))
    console.log('[Manual Post] Extracted fields:', { 
      title, 
      hasExcerpt: !!excerpt,
      hasContent: !!content, 
      hasCoverImageUrl: !!coverImageUrl,
      coverImageUrl,
      hasTags: !!tags,
      hasContentImages: !!contentImages,
      hasHighlight: !!highlight,
      saveAsDraft,
      scheduleForLater
    })

    if (!title || !content || !coverImageUrl) {
      console.log('[Manual Post] Validation failed:', { 
        hasTitle: !!title, 
        hasContent: !!content, 
        hasCoverImageUrl: !!coverImageUrl 
      })
      return NextResponse.json(
        { error: 'Title, content, and cover image are required' },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = generateSlug(title)

    // Check if slug already exists
    const { data: existingPost } = await supabaseAdmin
      .from('blog_posts')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existingPost) {
      return NextResponse.json(
        { error: 'A post with this title already exists. Please use a different title.' },
        { status: 409 }
      )
    }

    // Determinar status e data de agendamento
    let status: 'draft' | 'published' | 'scheduled' = 'published'
    let scheduledAt: string | null = null
    let published = true

    if (saveAsDraft) {
      // Salvar como rascunho - não publicado
      status = 'draft'
      published = false
      console.log('[Manual Post] Saving as draft (not published)')
    } else if (scheduleForLater && scheduledDate && scheduledTime) {
      // Agendar para data futura
      status = 'scheduled'
      scheduledAt = `${scheduledDate}T${scheduledTime}:00Z`
      published = false
      console.log('[Manual Post] Scheduling for:', scheduledAt)
    } else {
      // Publicar imediatamente
      status = 'published'
      published = true
      console.log('[Manual Post] Publishing immediately')
    }

    // Create post data
    const postData = {
      title,
      slug,
      excerpt: excerpt || content.substring(0, 200),
      content,
      cover_image_url: coverImageUrl,
      highlight: highlight || null,
      // content_images não existe na tabela, removido
      tags: tags || [],
      category: 'Manual',
      author: 'Izadora Cury Pierette',
      locale: 'pt-BR',
      published,
      status,
      scheduled_at: scheduledAt,
      ai_model: 'manual',
      generation_prompt: 'Manual post created by admin',
      seo_title: title,
      seo_description: excerpt || content.substring(0, 160),
      keywords: tags || [],
    }

    console.log('[Manual Post] Creating post with data:', JSON.stringify(postData, null, 2))

    // Insert post
    const { data: post, error } = await supabaseAdmin
      .from('blog_posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      console.error('[Manual Post] Error creating post:', error)
      return NextResponse.json(
        { error: 'Failed to create post', details: error.message },
        { status: 500 }
      )
    }

    console.log('[Manual Post] Post created successfully:', post.id)

    // Se for rascunho, apenas retornar sucesso sem enviar newsletter
    if (status === 'draft') {
      console.log('[Manual Post] ✅ Post salvo como rascunho')
      return NextResponse.json({ 
        success: true, 
        post,
        message: 'Post salvo como rascunho. Você pode visualizá-lo e publicá-lo depois.'
      })
    }

    // Se estiver agendado, apenas retornar sucesso
    if (status === 'scheduled') {
      console.log('[Manual Post] ✅ Post agendado para:', scheduledAt)
      return NextResponse.json({ 
        success: true, 
        post,
        message: `Post agendado para ${scheduledDate} às ${scheduledTime}. Newsletter e posts sociais serão enviados automaticamente no horário agendado.`
      })
    }

    // ====== ENVIAR NEWSLETTER ======
    if (resend && post.published) {
      try {
        console.log('[Manual Post] Fetching verified newsletter subscribers...')
        
        // Filtrar assinantes pelo mesmo locale do post
        const { data: subscribers, error: subError } = await supabaseAdmin
          .from('newsletter_subscribers')
          .select('email, name, locale')
          .eq('verified', true)
          .eq('subscribed', true)
          .eq('locale', post.locale)

        if (subError) {
          console.error('[Manual Post] Error fetching subscribers:', subError)
        } else if (subscribers && subscribers.length > 0) {
          console.log(`[Manual Post] ✅ Sending new post notification to ${subscribers.length} ${post.locale} subscribers...`)
          
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
          
          // Send emails in batches to avoid rate limits
          const batchSize = 50
          for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize)
            
            const emailPromises = batch.map(subscriber => {
              const locale = subscriber.locale || post.locale
              const isEnglish = locale === 'en-US'
              const postUrl = `${baseUrl}/${locale}/blog/${post.slug}`
              
              return resend.emails.send({
                from: 'CatBytes <contato@catbytes.site>',
                to: subscriber.email,
                subject: isEnglish 
                  ? `🚀 New Article: ${post.title}`
                  : `🚀 Novo Artigo: ${post.title}`,
                html: getNewPostEmailHTML(
                  subscriber.name || (isEnglish ? 'Friend' : 'Amigo'),
                  post.title,
                  post.excerpt,
                  post.cover_image_url,
                  postUrl,
                  locale,
                  baseUrl
                ),
              })
            })
            
            await Promise.allSettled(emailPromises)
            console.log(`[Manual Post] ✅ Sent batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(subscribers.length / batchSize)}`)
          }
          
          console.log('[Manual Post] ✅✅✅ Newsletter emails sent successfully!')
        } else {
          console.log('[Manual Post] ⚠️ No verified subscribers to notify')
        }
      } catch (emailError) {
        console.error('[Manual Post] ❌ Error sending newsletter emails:', emailError)
        // Don't fail post creation if email fails
      }
    } else if (!post.published) {
      console.log('[Manual Post] ⚠️ Post is draft - skipping newsletter')
    } else {
      console.log('[Manual Post] ⚠️ Resend not configured - skipping newsletter')
    }

    // ====== PROMOVER NAS REDES SOCIAIS ======
    if (post.published && post.cover_image_url) {
      try {
        console.log('[Manual Post] 📱 Promoting article on social media...')
        
        const promotionResults = await promoteArticle(
          {
            id: post.id,
            title: post.title,
            excerpt: post.excerpt || '',
            slug: post.slug,
            cover_image_url: post.cover_image_url,
            category: post.category,
            tags: post.tags
          },
          ['instagram', 'linkedin']
        )
        
        const successes: string[] = []
        const failures: string[] = []
        
        if (promotionResults.instagram?.success) {
          successes.push('Instagram')
        } else if (promotionResults.instagram?.error) {
          failures.push(`Instagram: ${promotionResults.instagram.error}`)
        }
        
        if (promotionResults.linkedin?.success) {
          successes.push('LinkedIn')
        } else if (promotionResults.linkedin?.error) {
          failures.push(`LinkedIn: ${promotionResults.linkedin.error}`)
        }
        
        if (successes.length > 0) {
          console.log(`[Manual Post] ✅ Article promoted on: ${successes.join(', ')}`)
        }
        if (failures.length > 0) {
          console.log(`[Manual Post] ⚠️ Failed to promote on: ${failures.join(', ')}`)
        }
        
      } catch (promoError) {
        console.error('[Manual Post] ❌ Error promoting on social media:', promoError)
        // Não falha a criação do post se a promoção falhar
      }
    } else if (!post.cover_image_url) {
      console.log('[Manual Post] ⚠️ No cover image - skipping social media promotion')
    }

    return NextResponse.json({ 
      success: true, 
      post 
    })
  } catch (error) {
    console.error('[Manual Post] Error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}