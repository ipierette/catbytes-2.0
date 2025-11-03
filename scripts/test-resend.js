#!/usr/bin/env node

/**
 * Script para testar o envio de email com Resend
 * Usage: node scripts/test-resend.js seu@email.com
 */

require('dotenv').config({ path: '.env.local' })
const { Resend } = require('resend')

const resendApiKey = process.env.RESEND_API_KEY
const testEmail = process.argv[2]

if (!testEmail) {
  console.error('❌ Uso: node scripts/test-resend.js seu@email.com')
  process.exit(1)
}

if (!resendApiKey) {
  console.error('❌ RESEND_API_KEY não encontrada no .env.local')
  process.exit(1)
}

console.log('🔍 Testando Resend...\n')
console.log(`📧 Email de teste: ${testEmail}`)
console.log(`🔑 API Key: ${resendApiKey.substring(0, 10)}...${resendApiKey.substring(resendApiKey.length - 5)}\n`)

const resend = new Resend(resendApiKey)

async function sendTestEmail() {
  try {
    console.log('📤 Enviando email de teste...\n')
    
    const { data, error } = await resend.emails.send({
      from: 'CatBytes <contato@catbytes.site>',
      to: [testEmail],
      subject: '🧪 Teste de Email - CatBytes Newsletter',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8A2BE2 0%, #FF69B4 50%, #00BFFF 100%); padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="color: white; margin: 0;">🧪 Teste de Email</h1>
            </div>
            <div style="padding: 30px; background: #f5f5f5; border-radius: 10px; margin-top: 20px;">
              <h2>Email de Teste - CatBytes</h2>
              <p>Este é um email de teste para verificar se o Resend está funcionando corretamente.</p>
              <p><strong>Se você recebeu este email, a configuração está OK! ✅</strong></p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
              <p style="font-size: 12px; color: #666;">
                Enviado via Resend API<br>
                CatBytes © 2025
              </p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Erro ao enviar email:', error)
      console.error('\n🔍 Detalhes do erro:', JSON.stringify(error, null, 2))
      
      if (error.message && error.message.includes('domain')) {
        console.error('\n⚠️  PROBLEMA: O domínio catbytes.site não está verificado no Resend!')
        console.error('   Acesse: https://resend.com/domains')
        console.error('   E verifique o domínio contato@catbytes.site')
      }
      
      process.exit(1)
    }

    console.log('✅ Email enviado com sucesso!\n')
    console.log('📊 Resposta da API:')
    console.log(JSON.stringify(data, null, 2))
    console.log('\n🎉 Verifique sua caixa de entrada (e pasta de spam)!')
    console.log(`📧 Email enviado para: ${testEmail}`)
    console.log('\n💡 Dica: Adicione contato@catbytes.site aos seus contatos para evitar spam.')
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error)
    process.exit(1)
  }
}

sendTestEmail()
