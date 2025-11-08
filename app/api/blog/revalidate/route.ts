import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

// =====================================================
// POST /api/blog/revalidate
// Revalidate blog post cache
// =====================================================

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    // Revalidate the specified path
    revalidatePath(path)

    return NextResponse.json({ revalidated: true, path }, { status: 200 })
  } catch (error) {
    console.error('[API] Error revalidating:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    )
  }
}
