// =====================================================
// API Route: Send Manual Newsletter
// POST /api/admin/newsletter/send
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyAdminCookie } from '@/lib/api-security'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 300 // 5 minutes for batch sending

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendNewsletterRequest {
  subject: string
  content: string
  language?: 'pt-BR' | 'en-US' | 'all'
  testMode?: boolean // Send only to admin email for testing
}

interface Subscriber {
  id: string
  email: string
  locale: string
}

// ========================================
// Helper: Validate Request Body
// ========================================
function validateRequest(body: SendNewsletterRequest) {
  const { subject, content } = body

  if (!subject || !content) {
    return { valid: false, error: 'Subject and content are required' }
  }

  if (subject.length < 5 || subject.length > 100) {
    return { valid: false, error: 'Subject must be between 5 and 100 characters' }
  }

  if (content.length < 50) {
    return { valid: false, error: 'Content must be at least 50 characters' }
  }

  return { valid: true }
}

// ========================================
// Helper: Send Test Email
// ========================================
async function sendTestEmail(
  subject: string,
  content: string,
  subscribersCount: number,
  startTime: number
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@catbytes.site'

  try {
    await resend.emails.send({
      from: 'CatBytes <contato@catbytes.site.site>',
      to: adminEmail,
      subject: `[TESTE] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; margin-bottom: 20px;">
            <strong>🧪 MODO DE TESTE</strong><br>
            Este é um envio de teste. Em produção, seria enviado para ${subscribersCount} subscribers.
          </div>
          ${content}
        </div>
      `,
    })

    return NextResponse.json({
      success: true,
      testMode: true,
      message: `Email de teste enviado para ${adminEmail}`,
      wouldSendTo: subscribersCount,
      executionTime: Date.now() - startTime,
    })
  } catch (error) {
    console.error('[Newsletter Send] Test email error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    )
  }
}

// ========================================
// Helper: Create Email Batches
// ========================================
function createBatches(subscribers: Subscriber[], batchSize: number): string[][] {
  const batches: string[][] = []
  for (let i = 0; i < subscribers.length; i += batchSize) {
    batches.push(subscribers.slice(i, i + batchSize).map((s) => s.email))
  }
  return batches
}

// ========================================
// Helper: Send Email Batches
// ========================================
async function sendBatches(
  batches: string[][],
  subject: string,
  content: string
): Promise<{ sentCount: number; failedCount: number; errors: string[] }> {
  let sentCount = 0
  let failedCount = 0
  const errors: string[] = []

  console.log(`[Newsletter Send] Sending to ${batches.reduce((a, b) => a + b.length, 0)} subscribers in ${batches.length} batches`)

  for (const batch of batches) {
    try {
      await resend.emails.send({
        from: 'CatBytes <contato@catbytes.site.site>',
        to: batch,
        subject,
        html: content,
      })

      sentCount += batch.length
      console.log(`[Newsletter Send] Batch sent: ${batch.length} emails`)
    } catch (error) {
      failedCount += batch.length
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push(errorMsg)
      console.error('[Newsletter Send] Batch error:', errorMsg)
    }
  }

  return { sentCount, failedCount, errors }
}

// ========================================
// Helper: Update Subscriber Stats
// ========================================
async function updateSubscriberStats(subscribers: Subscriber[], sentCount: number) {
  if (sentCount === 0) return
  if (!supabaseAdmin) return

  const subscriberIds = subscribers.slice(0, sentCount).map((s) => s.id)

  await supabaseAdmin
    .from('newsletter_subscribers')
    .update({
      last_email_sent_at: new Date().toISOString(),
    })
    .in('id', subscriberIds)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Verify Admin Authentication
    const authCheck = await verifyAdminCookie(request)
    if (!authCheck.valid) {
      return authCheck.error || NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Check Resend API Key
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Resend API key not configured' },
        { status: 500 }
      )
    }

    // 3. Check Supabase Admin
    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Supabase admin not configured' },
        { status: 500 }
      )
    }

    // 4. Parse and Validate Request
    const body: SendNewsletterRequest = await request.json()
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { subject, content, language = 'all', testMode = false } = body

    // 5. Fetch Subscribers
    let query = supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')
      .eq('verified', true)
      .eq('subscribed', true)

    if (language && language !== 'all') {
      query = query.eq('locale', language)
    }

    const { data: subscribers, error: subscribersError } = await query

    if (subscribersError) {
      console.error('[Newsletter Send] Error fetching subscribers:', subscribersError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch subscribers' },
        { status: 500 }
      )
    }

    const subscribersList = subscribers || []

    // 6. Test Mode
    if (testMode) {
      return await sendTestEmail(subject, content, subscribersList.length, startTime)
    }

    // 7. Send to All Subscribers
    const batches = createBatches(subscribersList, 50)
    const result = await sendBatches(batches, subject, content)

    // 8. Update Stats
    await updateSubscriberStats(subscribersList, result.sentCount)

    // 9. Return Response
    return NextResponse.json({
      success: true,
      sentCount: result.sentCount,
      failedCount: result.failedCount,
      totalSubscribers: subscribersList.length,
      errors: result.errors.length > 0 ? result.errors : undefined,
      executionTime: Date.now() - startTime,
      sentAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[Newsletter Send] Unexpected error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// ========================================
// OPTIONS for CORS
// ========================================
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  )
}
