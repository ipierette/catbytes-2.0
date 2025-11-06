/**
 * Script para verificar e criar tabela instagram_settings
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAndCreateSettings() {
  try {
    console.log('🔍 Verificando tabela instagram_settings...')

    // Tenta buscar configurações
    const { data, error } = await supabase
      .from('instagram_settings')
      .select('*')
      .limit(1)

    if (error) {
      console.log('❌ Tabela não existe:', error.message)
      console.log('🔧 Criando tabela...')

      // Cria tabela via RPC se não existir
      const createTable = `
        CREATE TABLE IF NOT EXISTS instagram_settings (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          setting_key VARCHAR(100) UNIQUE NOT NULL,
          setting_value TEXT NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        INSERT INTO instagram_settings (setting_key, setting_value)
        VALUES ('auto_generation_enabled', 'true')
        ON CONFLICT (setting_key) DO NOTHING;
      `

      // Executa SQL direto
      const { error: createError } = await supabase.rpc('execute_sql', { sql: createTable })

      if (createError) {
        console.log('❌ Erro ao criar tabela:', createError)
        
        // Tenta inserir manualmente se a tabela já existir
        console.log('🔄 Tentando inserir configuração padrão...')
        const { error: insertError } = await supabase
          .from('instagram_settings')
          .upsert({
            setting_key: 'auto_generation_enabled',
            setting_value: 'true'
          })

        if (insertError) {
          console.log('❌ Erro ao inserir:', insertError)
        } else {
          console.log('✅ Configuração padrão inserida!')
        }
      } else {
        console.log('✅ Tabela criada com sucesso!')
      }
    } else {
      console.log('✅ Tabela existe! Configurações:', data)
    }

    // Testa busca de configuração
    console.log('\n🧪 Testando busca de configurações...')
    const { data: testData, error: testError } = await supabase
      .from('instagram_settings')
      .select('*')

    if (testError) {
      console.log('❌ Erro ao buscar:', testError)
    } else {
      console.log('✅ Configurações encontradas:', testData)
    }

  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

checkAndCreateSettings()