#!/usr/bin/env node

/**
 * Teste de INSERT em instagram_posts
 * Descobre qual erro real o Supabase retorna
 */

import { createClient } from '@supabase/supabase-js'

// Configuração Supabase (mesma do frontend)
const supabaseUrl = 'https://lbjekucdxgouwgegpdhi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiamVrdWNkeGdvdXdnZWdwZGhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMTY0NDEsImV4cCI6MjA3NzY5MjQ0MX0.IHvBFOggnPwASsMKA3C2-g3Pc-HCvUD6f26LS1ESueI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('🧪 Testando INSERT em instagram_posts...\n')

// Teste 1: Status 'draft'
console.log('📝 Teste 1: Status = "draft"')
const testPost1 = {
  nicho: 'Teste API',
  titulo: 'Post de Teste Draft',
  texto_imagem: 'Imagem de teste gerada via API',
  caption: 'Caption de teste #teste',
  image_url: 'https://picsum.photos/1080/1080',
  generation_method: 'SMART_GENERATE',
  status: 'draft',
  scheduled_for: null
}

const { data: data1, error: error1 } = await supabase
  .from('instagram_posts')
  .insert(testPost1)
  .select()

if (error1) {
  console.error('❌ ERRO:', error1)
  console.error('   Code:', error1.code)
  console.error('   Message:', error1.message)
  console.error('   Details:', error1.details)
  console.error('   Hint:', error1.hint)
} else {
  console.log('✅ Sucesso! ID:', data1?.[0]?.id)
}

console.log('\n---\n')

// Teste 2: Status 'scheduled'
console.log('📅 Teste 2: Status = "scheduled"')
const testPost2 = {
  nicho: 'Teste API',
  titulo: 'Post de Teste Scheduled',
  texto_imagem: 'Imagem de teste gerada via API',
  caption: 'Caption de teste #teste',
  image_url: 'https://picsum.photos/1080/1080',
  generation_method: 'SMART_GENERATE',
  status: 'scheduled',
  scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
}

const { data: data2, error: error2 } = await supabase
  .from('instagram_posts')
  .insert(testPost2)
  .select()

if (error2) {
  console.error('❌ ERRO:', error2)
  console.error('   Code:', error2.code)
  console.error('   Message:', error2.message)
  console.error('   Details:', error2.details)
  console.error('   Hint:', error2.hint)
} else {
  console.log('✅ Sucesso! ID:', data2?.[0]?.id)
}

console.log('\n---\n')

// Teste 3: Status 'approved' (controle)
console.log('👍 Teste 3: Status = "approved" (controle)')
const testPost3 = {
  nicho: 'Teste API',
  titulo: 'Post de Teste Approved',
  texto_imagem: 'Imagem de teste gerada via API',
  caption: 'Caption de teste #teste',
  image_url: 'https://picsum.photos/1080/1080',
  generation_method: 'SMART_GENERATE',
  status: 'approved',
  scheduled_for: null
}

const { data: data3, error: error3 } = await supabase
  .from('instagram_posts')
  .insert(testPost3)
  .select()

if (error3) {
  console.error('❌ ERRO:', error3)
  console.error('   Code:', error3.code)
  console.error('   Message:', error3.message)
  console.error('   Details:', error3.details)
  console.error('   Hint:', error3.hint)
} else {
  console.log('✅ Sucesso! ID:', data3?.[0]?.id)
}

console.log('\n🏁 Testes concluídos!')
