import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: Request) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('[Migration] Iniciando aplicação de migration...')

    // 1. Adicionar coluna generation_method se não existe
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE instagram_posts ADD COLUMN IF NOT EXISTS generation_method TEXT DEFAULT 'ai-traditional';`
    }).catch(() => {
      // Ignora erro se coluna já existe
      console.log('[Migration] Coluna generation_method já existe')
    })

    // 2. Remover constraint antiga
    await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE instagram_posts DROP CONSTRAINT IF EXISTS check_generation_method;`
    }).catch(() => {
      console.log('[Migration] Constraint check_generation_method não existia')
    })

    // 3. Criar nova constraint com SMART_GENERATE
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE instagram_posts
        ADD CONSTRAINT check_generation_method 
        CHECK (generation_method IN (
          'ai-traditional', 
          'dalle-3', 
          'stability-ai', 
          'text-only-manual',
          'leonardo-ai',
          'nanobanana',
          'SMART_GENERATE'
        ));
      `
    })

    // 4. Atualizar posts existentes
    await supabase.rpc('exec_sql', {
      sql: `UPDATE instagram_posts SET generation_method = 'ai-traditional' WHERE generation_method IS NULL;`
    })

    // 5. Criar índice
    await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_instagram_posts_generation_method ON instagram_posts(generation_method);`
    })

    console.log('[Migration] Migration aplicada com sucesso!')

    return NextResponse.json({
      success: true,
      message: 'Migration aplicada com sucesso'
    })

  } catch (error: any) {
    console.error('[Migration] Erro ao aplicar migration:', error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error
    }, { status: 500 })
  }
}
