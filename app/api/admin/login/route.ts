import { NextRequest, NextResponse } from 'next/server'
import { SignJWT } from 'jose'

// =====================================================
// POST /api/admin/login
// Admin authentication with rate limiting
// =====================================================

export const runtime = 'edge'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-this')

// Simple in-memory rate limiting (for edge runtime)
// In production, use Redis (Upstash) or similar
const loginAttempts = new Map<string, { count: number; resetTime: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number } {
  const now = Date.now()
  const record = loginAttempts.get(ip)

  // Reset if window expired
  if (record && now > record.resetTime) {
    loginAttempts.delete(ip)
  }

  const current = loginAttempts.get(ip)
  
  if (!current) {
    loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS - 1 }
  }

  if (current.count >= MAX_ATTEMPTS) {
    return { allowed: false }
  }

  current.count++
  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - current.count }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIP || 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again in 1 hour.' },
        { status: 429 }
      )
    }

    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Verify password
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { 
          error: 'Invalid password',
          remainingAttempts: rateLimit.remainingAttempts 
        },
        { status: 401 }
      )
    }

    // Clear rate limit on successful login
    loginAttempts.delete(ip)

    // Create JWT token
    const token = await new SignJWT({ role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    const response = NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
    })

    // Set cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response
  } catch (error) {
    console.error('[Admin Login] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
