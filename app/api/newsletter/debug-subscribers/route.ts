/**
 * Debug endpoint to check all newsletter subscribers
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all subscribers
    const { data: subscribers, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('*')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const stats = {
      total: subscribers.length,
      verified: subscribers.filter(s => s.verified).length,
      notVerified: subscribers.filter(s => !s.verified).length,
      subscribed: subscribers.filter(s => s.subscribed).length,
      unsubscribed: subscribers.filter(s => !s.subscribed).length,
      active: subscribers.filter(s => s.verified && s.subscribed).length
    }

    return NextResponse.json({
      stats,
      subscribers: subscribers.map(s => ({
        email: s.email,
        name: s.name || 'N/A',
        verified: s.verified,
        subscribed: s.subscribed,
        verifiedAt: s.verified_at
      }))
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 })
  }
}
