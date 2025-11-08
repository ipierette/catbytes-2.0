#!/usr/bin/env node

/**
 * Script para testar incremento de views
 * Usage: node scripts/test-view-increment.js [POST_ID]
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

async function testViewIncrement(postId) {
  console.log('🔍 Testing view increment...\n')
  
  // Check environment
  console.log('Environment Variables:')
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')
  console.log('')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables')
    process.exit(1)
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  )

  try {
    // Get current views
    console.log('📊 Fetching current view count...')
    const { data: beforeData, error: beforeError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, views')
      .eq('id', postId)
      .single()

    if (beforeError) {
      console.error('❌ Error fetching post:', beforeError)
      process.exit(1)
    }

    console.log('Current post:', {
      title: beforeData.title,
      slug: beforeData.slug,
      views: beforeData.views
    })
    console.log('')

    // Increment views
    console.log('⬆️  Incrementing views...')
    const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc('increment_post_views', {
      post_id: postId,
    })

    if (rpcError) {
      console.error('❌ RPC Error:', rpcError)
      process.exit(1)
    }

    console.log('✅ RPC call successful')
    console.log('RPC returned:', rpcData)
    console.log('')

    // Get updated views
    console.log('📊 Fetching updated view count...')
    const { data: afterData, error: afterError } = await supabaseAdmin
      .from('blog_posts')
      .select('id, title, slug, views')
      .eq('id', postId)
      .single()

    if (afterError) {
      console.error('❌ Error fetching updated post:', afterError)
      process.exit(1)
    }

    console.log('Updated post:', {
      title: afterData.title,
      slug: afterData.slug,
      views: afterData.views
    })
    console.log('')

    // Compare
    const increment = afterData.views - beforeData.views
    console.log(`${increment > 0 ? '✅' : '❌'} Views incremented by: ${increment}`)
    
    if (increment > 0) {
      console.log('🎉 View increment working correctly!')
    } else {
      console.log('⚠️  Warning: Views did not increment')
    }

  } catch (err) {
    console.error('❌ Exception:', err)
    process.exit(1)
  }
}

// Get post ID from command line or use default
const postId = process.argv[2] || '93708c51-961e-4ca5-900e-40fbbab6cd1a'

testViewIncrement(postId)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
