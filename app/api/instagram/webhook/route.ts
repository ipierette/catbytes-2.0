/**
 * 🔗 WEBHOOK DO INSTAGRAM
 * 
 * Recebe notificações do Instagram sobre interações nos posts
 * Permite tracking em tempo real de likes, comentários, etc.
 */

import { NextRequest, NextResponse } from 'next/server'
import { instagramDB } from '@/lib/instagram-db'

export async function GET(request: NextRequest) {
  // Verificação do webhook (Meta requirement)
  const { searchParams } = new URL(request.url)
  
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN) {
    console.log('✅ Instagram webhook verified')
    return new Response(challenge, { status: 200 })
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('📬 Instagram webhook received:', JSON.stringify(body, null, 2))

    // Processar cada entrada do webhook
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'comments') {
          await handleCommentChange(change.value)
        } else if (change.field === 'mentions') {
          await handleMentionChange(change.value)
        } else if (change.field === 'story_insights') {
          await handleStoryInsights(change.value)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Instagram webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

/**
 * Processa mudanças em comentários
 */
async function handleCommentChange(value: any) {
  try {
    const { media_id, text, from } = value
    
    console.log('💬 New comment received:', {
      mediaId: media_id,
      author: from?.username,
      text: text?.substring(0, 50) + '...'
    })

    // Salvar o comentário no banco de dados
    // await instagramDB.saveComment({
    //   media_id,
    //   author: from?.username,
    //   text,
    //   timestamp: new Date().toISOString()
    // })

    // Resposta automática se necessário
    if (text?.toLowerCase().includes('contato') || text?.toLowerCase().includes('orçamento')) {
      // await sendAutoReply(media_id, from.id, 'Obrigado pelo interesse! Entre em contato via WhatsApp: https://wa.me/5567984098786')
    }

  } catch (error) {
    console.error('Error handling comment:', error)
  }
}

/**
 * Processa menções
 */
async function handleMentionChange(value: any) {
  try {
    const { media_id, comment_id } = value
    
    console.log('📢 New mention received:', {
      mediaId: media_id,
      commentId: comment_id
    })

    // Aqui você pode implementar lógica para responder a menções
    
  } catch (error) {
    console.error('Error handling mention:', error)
  }
}

/**
 * Processa insights de stories
 */
async function handleStoryInsights(value: any) {
  try {
    console.log('📊 Story insights received:', value)
    
    // Salvar métricas de story
    // await instagramDB.saveStoryInsights(value)
    
  } catch (error) {
    console.error('Error handling story insights:', error)
  }
}