import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { renderId, platforms } = await request.json()

    if (!renderId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: renderId, platforms' },
        { status: 400 }
      )
    }

    // Get render record
    const { data: render, error: renderError } = await supabaseAdmin
      .from('video_renders')
      .select('*, video_projects(*)')
      .eq('id', renderId)
      .eq('user_id', user.id)
      .single()

    if (renderError || !render) {
      return NextResponse.json(
        { error: 'Render not found' },
        { status: 404 }
      )
    }

    if (render.status !== 'completed') {
      return NextResponse.json(
        { error: 'Render not completed yet' },
        { status: 400 }
      )
    }

    if (!render.video_url) {
      return NextResponse.json(
        { error: 'Video URL not available' },
        { status: 400 }
      )
    }

    // Publish to each platform
    const results = []
    
    for (const platform of platforms) {
      try {
        let publishResult
        
        switch (platform) {
          case 'youtube':
            publishResult = await publishToYouTube(render, user.id)
            break
          case 'tiktok':
            publishResult = await publishToTikTok(render, user.id)
            break
          case 'instagram':
            publishResult = await publishToInstagram(render, user.id)
            break
          case 'linkedin':
            publishResult = await publishToLinkedIn(render, user.id)
            break
          default:
            throw new Error(`Unsupported platform: ${platform}`)
        }
        
        results.push({
          platform,
          success: true,
          url: publishResult.url,
          postId: publishResult.postId,
        })
      } catch (error: any) {
        console.error(`Error publishing to ${platform}:`, error)
        results.push({
          platform,
          success: false,
          error: error.message,
        })
      }
    }

    // Create blog_video_posts record
    const publishedPlatforms = results
      .filter(r => r.success)
      .map(r => r.platform)

    if (publishedPlatforms.length > 0) {
      const { error: postError } = await supabaseAdmin
        .from('blog_video_posts')
        .insert({
          project_id: render.project_id,
          render_id: render.id,
          user_id: user.id,
          title: render.video_projects.title,
          description: render.video_projects.description || '',
          platforms: publishedPlatforms,
          published_urls: results.filter(r => r.success).map(r => ({
            platform: r.platform,
            url: r.url,
            postId: r.postId,
          })),
          status: 'published',
        })

      if (postError) {
        console.error('Error creating blog_video_posts record:', postError)
      }

      // Delete video file from storage after successful publish
      if (render.video_url.includes('supabase')) {
        try {
          const urlParts = render.video_url.split('/')
          const filePath = urlParts.slice(urlParts.indexOf('renders')).join('/')
          
          await supabaseAdmin.storage
            .from('studio-videos')
            .remove([filePath])
          
          console.log('Deleted temporary video file:', filePath)
        } catch (deleteError) {
          console.error('Error deleting video file:', deleteError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      totalPublished: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length,
    })
  } catch (error) {
    console.error('Publish video error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// YouTube Publishing
async function publishToYouTube(render: any, userId: string) {
  // In production, you would:
  // 1. Use Google OAuth2 to get user credentials
  // 2. Upload video using YouTube Data API v3
  // 3. Set title, description, tags, category
  // 4. Set privacy status (public, unlisted, private)
  
  console.log('Publishing to YouTube:', render.video_projects.title)
  
  // Simulated response
  return {
    url: `https://youtube.com/watch?v=simulated-${render.id}`,
    postId: `yt-${render.id}`,
  }
}

// TikTok Publishing
async function publishToTikTok(render: any, userId: string) {
  // In production, you would:
  // 1. Use TikTok Content Posting API
  // 2. Upload video chunks
  // 3. Set caption, privacy level, allow comments/duet/stitch
  // 4. Add hashtags and mentions
  
  console.log('Publishing to TikTok:', render.video_projects.title)
  
  return {
    url: `https://tiktok.com/@user/video/simulated-${render.id}`,
    postId: `tt-${render.id}`,
  }
}

// Instagram Publishing
async function publishToInstagram(render: any, userId: string) {
  // In production, you would:
  // 1. Use Instagram Graph API
  // 2. Create media container with video URL
  // 3. Set caption, location, user tags
  // 4. Publish the container
  // 5. Handle Reels vs Feed posts based on aspect ratio
  
  console.log('Publishing to Instagram:', render.video_projects.title)
  
  const isReel = render.aspect_ratio === '9:16'
  
  return {
    url: `https://instagram.com/p/simulated-${render.id}`,
    postId: `ig-${render.id}`,
    type: isReel ? 'reel' : 'feed',
  }
}

// LinkedIn Publishing
async function publishToLinkedIn(render: any, userId: string) {
  // In production, you would:
  // 1. Use LinkedIn Share API
  // 2. Register video upload
  // 3. Upload video in chunks
  // 4. Create share with video URN
  // 5. Set commentary (description)
  
  console.log('Publishing to LinkedIn:', render.video_projects.title)
  
  return {
    url: `https://linkedin.com/posts/user-simulated-${render.id}`,
    postId: `li-${render.id}`,
  }
}
