import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Match only internationalized pathnames
  // Exclude API routes from i18n middleware
  matcher: ['/', '/(pt-BR|en-US)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
}
