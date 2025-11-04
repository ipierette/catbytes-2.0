import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// =====================================================
// GET /api/admin/verify
// Verify admin authentication
// =====================================================

export const runtime = 'edge'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this')

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    // Verify token
    await jwtVerify(token, JWT_SECRET)

    return NextResponse.json({
      authenticated: true,
      role: 'admin',
    })
  } catch {
    // Token invalid or expired
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    )
  }
}
