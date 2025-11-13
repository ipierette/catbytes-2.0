import { NextRequest, NextResponse } from 'next/server'

/**
 * Rota de redirecionamento simples para verificação de email
 * Resolve problemas com deep links no iOS Mail
 * 
 * GET /api/newsletter/redirect-verify?token=xxx&locale=pt-BR
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')
  const locale = searchParams.get('locale') || 'pt-BR'

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirecionar para a página de verificação
  const verifyUrl = new URL(`/${locale}/newsletter/verify`, request.url)
  verifyUrl.searchParams.set('token', token)

  return NextResponse.redirect(verifyUrl, {
    status: 302,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  })
}
