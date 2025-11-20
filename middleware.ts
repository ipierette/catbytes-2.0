import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip i18n for admin routes - they don't need locale
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Skip for API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  // Skip for static files
  if (pathname.includes('.') && !pathname.startsWith('/.well-known')) {
    return NextResponse.next()
  }

  // Redirect locale admin routes to root admin routes
  const localeAdminPattern = /^\/(pt-BR|en-US)\/admin/
  if (localeAdminPattern.exec(pathname)) {
    const newPathname = pathname.replace(/^\/(pt-BR|en-US)/, '')
    return NextResponse.redirect(new URL(newPathname, request.url), 301)
  }

  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames
  // Exclude API, admin, and static files from middleware
  matcher: [
    '/(pt-BR|en-US)/:path*',
    '/((?!api|admin|_next|_vercel|.*\\..*).*)'
  ]
}
