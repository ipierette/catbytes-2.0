import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, message } = await req.json()

    // Validação básica
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      )
    }

    // Salva lead no Supabase
    const { data, error } = await supabase
      .from('lp_leads')
      .insert([
        {
          name,
          email,
          phone: phone || null,
          message: message || null,
          source: 'lp_rica',
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('❌ Erro ao salvar lead:', error)
      
      // Se a tabela não existir, loga mas não falha
      if (error.code === '42P01') {
        console.warn('⚠️ Tabela lp_leads não existe. Criando fallback...')
        
        // Salva em tabela genérica de contatos se existir
        const { error: fallbackError } = await supabase
          .from('contacts')
          .insert([{ name, email, phone, message, type: 'lp_lead' }])
        
        if (fallbackError) {
          console.error('❌ Erro no fallback:', fallbackError)
          return NextResponse.json(
            { error: 'Erro ao salvar contato. Tente novamente.' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'Contato recebido com sucesso!',
        })
      }
      
      throw error
    }

    console.log('✅ Lead salvo com sucesso:', data)

    // Envia notificação por e-mail (opcional - implementar depois)
    // await sendLeadNotification({ name, email, phone, message })

    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!',
      lead: data[0],
    })
  } catch (error: any) {
    console.error('❌ Erro ao processar lead:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erro ao processar mensagem',
      },
      { status: 500 }
    )
  }
}
