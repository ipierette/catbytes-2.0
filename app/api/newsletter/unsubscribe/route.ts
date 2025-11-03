import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * GET /api/newsletter/unsubscribe?email=user@example.com
 * Unsubscribes a user from the newsletter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Erro - Newsletter CatBytes</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 16px;
              padding: 40px;
              max-width: 500px;
              box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
              text-align: center;
            }
            h1 { color: #EF4444; margin-bottom: 20px; }
            p { color: #6B7280; line-height: 1.6; }
            a {
              display: inline-block;
              margin-top: 20px;
              padding: 12px 24px;
              background: linear-gradient(135deg, #8A2BE2, #00BFFF);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ Erro</h1>
            <p>Email não fornecido. Por favor, use o link completo do email que você recebeu.</p>
            <a href="https://catbytes.site">Voltar para o site</a>
          </div>
        </body>
        </html>
        `,
        {
          status: 400,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }

    // Update subscriber status
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ subscribed: false })
      .eq('email', email)

    if (error) {
      console.error('Unsubscribe error:', error)
      throw error
    }

    // Return success HTML page
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cancelamento Confirmado - Newsletter CatBytes</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
          }
          .icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h1 {
            color: #1F2937;
            margin-bottom: 16px;
            font-size: 28px;
          }
          p {
            color: #6B7280;
            line-height: 1.6;
            margin-bottom: 12px;
          }
          .email {
            background: #F3F4F6;
            padding: 8px 16px;
            border-radius: 8px;
            color: #374151;
            font-weight: bold;
            display: inline-block;
            margin: 16px 0;
          }
          a {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #8A2BE2, #00BFFF);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            transition: transform 0.2s;
          }
          a:hover {
            transform: scale(1.05);
          }
          .sad-cat {
            font-size: 48px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">✅</div>
          <h1>Inscrição Cancelada</h1>
          <p>Você foi removido da nossa lista de newsletter.</p>
          <div class="email">${email}</div>
          <p>Sentiremos sua falta! 😿</p>
          <p>Se você mudou de ideia, pode se inscrever novamente a qualquer momento visitando nosso blog.</p>
          <a href="https://catbytes.site/pt-BR/blog">Visitar o Blog</a>
          <div class="sad-cat">🐱💔</div>
        </div>
      </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    )

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Erro - Newsletter CatBytes</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 16px;
            padding: 40px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
          }
          h1 { color: #EF4444; margin-bottom: 20px; }
          p { color: #6B7280; line-height: 1.6; }
          a {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: linear-gradient(135deg, #8A2BE2, #00BFFF);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>❌ Erro</h1>
          <p>Ocorreu um erro ao processar seu pedido. Por favor, tente novamente mais tarde ou entre em contato conosco.</p>
          <a href="mailto:contato@catbytes.site">Contatar Suporte</a>
        </div>
      </body>
      </html>
      `,
      {
        status: 500,
        headers: { 'Content-Type': 'text/html' }
      }
    )
  }
}
