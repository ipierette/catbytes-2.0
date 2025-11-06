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

  // Redirect locale admin routes to root admin routes
  const localeAdminPattern = /^\/(pt-BR|en-US)\/admin/
  if (localeAdminPattern.exec(pathname)) {
    const newPathname = pathname.replace(/^\/(pt-BR|en-US)/, '')
    return NextResponse.redirect(new URL(newPathname, request.url))
  }

  return intlMiddleware(request)
}

export const config = {
  // Match only internationalized pathnames
  // Exclude API routes from i18n middleware
  matcher: ['/', '/(pt-BR|en-US)/:path*', String.raw`/((?!api|_next|_vercel|.*\..*).*))`]
}
