/**
 * Script para exportar schema completo do Supabase
 * Gera arquivo supabase/current_schema.sql com todas as tabelas
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function exportSchema() {
  console.log('🔍 Buscando schema do Supabase...\n')

  try {
    // Query para pegar estrutura de todas as tabelas
    const { data: tables, error } = await supabase.rpc('get_table_definitions')

    if (error && error.code === '42883') {
      // Função não existe, criar query manual
      console.log('📝 Usando query manual...\n')
      return await exportSchemaManual()
    }

    if (error) throw error

    // Gerar SQL
    let sql = `-- =====================================================
-- Schema Export - ${new Date().toISOString()}
-- Generated automatically from Supabase
-- =====================================================

`

    tables.forEach(table => {
      sql += table.definition + '\n\n'
    })

    // Salvar arquivo
    const outputPath = path.join(__dirname, '../supabase/current_schema.sql')
    fs.writeFileSync(outputPath, sql)

    console.log('✅ Schema exportado com sucesso!')
    console.log(`📄 Arquivo: ${outputPath}`)
    console.log(`📊 Total de tabelas: ${tables.length}\n`)

  } catch (error) {
    console.error('❌ Erro ao exportar schema:', error.message)
    process.exit(1)
  }
}

async function exportSchemaManual() {
  // Query todas as tabelas
  const { data: tableNames, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name')

  if (tablesError) {
    console.error('❌ Erro ao listar tabelas:', tablesError)
    process.exit(1)
  }

  let sql = `-- =====================================================
-- Schema Export - ${new Date().toISOString()}
-- Generated automatically from Supabase
-- =====================================================

`

  console.log(`📊 Encontradas ${tableNames.length} tabelas:\n`)

  for (const { table_name } of tableNames) {
    console.log(`  📋 ${table_name}`)

    // Query estrutura da tabela
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', table_name)
      .order('ordinal_position')

    if (columnsError) {
      console.error(`❌ Erro ao ler colunas de ${table_name}:`, columnsError)
      continue
    }

    // Montar CREATE TABLE
    sql += `-- Table: ${table_name}\n`
    sql += `CREATE TABLE ${table_name} (\n`

    const columnDefs = columns.map(col => {
      let def = `  ${col.column_name} `

      // Tipo
      if (col.data_type === 'character varying') {
        def += `VARCHAR${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}`
      } else if (col.data_type === 'timestamp with time zone') {
        def += 'TIMESTAMP WITH TIME ZONE'
      } else if (col.data_type === 'ARRAY') {
        def += col.udt_name.toUpperCase()
      } else if (col.data_type === 'USER-DEFINED') {
        def += col.udt_name.toUpperCase()
      } else {
        def += col.data_type.toUpperCase()
      }

      // NOT NULL
      if (col.is_nullable === 'NO') {
        def += ' NOT NULL'
      }

      // DEFAULT
      if (col.column_default) {
        def += ` DEFAULT ${col.column_default}`
      }

      return def
    })

    sql += columnDefs.join(',\n')
    sql += '\n);\n\n'

    // Índices (se houver)
    const { data: indexes } = await supabase.rpc('pg_indexes', {
      schemaname: 'public',
      tablename: table_name
    }).catch(() => ({ data: null }))

    if (indexes && indexes.length > 0) {
      indexes.forEach(idx => {
        sql += `${idx.indexdef};\n`
      })
      sql += '\n'
    }
  }

  // Salvar arquivo
  const outputPath = path.join(__dirname, '../supabase/current_schema.sql')
  fs.writeFileSync(outputPath, sql)

  console.log('\n✅ Schema exportado com sucesso!')
  console.log(`📄 Arquivo: ${outputPath}`)
  console.log(`📊 Total de tabelas: ${tableNames.length}\n`)
}

// Executar
exportSchema()
