/**
 * Script de Teste do Bucket Instagram
 * Verifica configuração e permissões do bucket Supabase
 */

import 'dotenv/config'
import { supabaseAdmin } from '../lib/supabase'

async function testInstagramBucket() {
  console.log('🧪 Testando Bucket Instagram do Supabase...\n')

  try {
    // 1. Verificar se o cliente Supabase está configurado
    console.log('1️⃣ Verificando cliente Supabase...')
    if (!supabaseAdmin) {
      console.error('❌ ERRO: Supabase Admin não está configurado')
      console.log('   Verifique as variáveis de ambiente:')
      console.log('   - NEXT_PUBLIC_SUPABASE_URL')
      console.log('   - SUPABASE_SERVICE_ROLE_KEY')
      return
    }
    console.log('✅ Cliente Supabase configurado\n')

    // 2. Listar todos os buckets
    console.log('2️⃣ Listando buckets existentes...')
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Erro ao listar buckets:', listError.message)
      return
    }

    console.log(`📦 Total de buckets: ${buckets?.length || 0}`)
    buckets?.forEach(bucket => {
      console.log(`   - ${bucket.name} (${bucket.public ? 'público' : 'privado'})`)
    })
    console.log('')

    // 3. Verificar se o bucket instagram-images existe
    console.log('3️⃣ Verificando bucket instagram-images...')
    const instagramBucket = buckets?.find(b => b.name === 'instagram-images')
    
    if (!instagramBucket) {
      console.log('⚠️  Bucket instagram-images NÃO encontrado')
      console.log('   Tentando criar automaticamente...\n')
      
      const { error: createError } = await supabaseAdmin.storage.createBucket('instagram-images', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      })

      if (createError) {
        console.error('❌ Erro ao criar bucket:', createError.message)
        console.log('\n📝 Siga as instruções em SUPABASE_BUCKET_SETUP.md para criar manualmente')
        return
      }

      console.log('✅ Bucket criado com sucesso!')
      console.log('⚠️  IMPORTANTE: Configure as políticas de acesso manualmente')
      console.log('   Veja instruções em: SUPABASE_BUCKET_SETUP.md\n')
    } else {
      console.log('✅ Bucket instagram-images encontrado')
      console.log(`   - Público: ${instagramBucket.public ? 'Sim ✅' : 'Não ❌'}`)
      console.log(`   - ID: ${instagramBucket.id}`)
      console.log(`   - Criado em: ${new Date(instagramBucket.created_at).toLocaleString('pt-BR')}`)
      console.log('')
    }

    // 4. Testar upload de imagem de teste
    console.log('4️⃣ Testando upload de arquivo...')
    const testFileName = `test-${Date.now()}.txt`
    const testContent = `Teste realizado em ${new Date().toISOString()}`

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('instagram-images')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      })

    if (uploadError) {
      console.error('❌ Erro no upload:', uploadError.message)
      console.log('\n⚠️  Possíveis causas:')
      console.log('   1. Bucket não existe')
      console.log('   2. Políticas de acesso não configuradas')
      console.log('   3. Service role key incorreta')
      console.log('\n📝 Verifique: SUPABASE_BUCKET_SETUP.md')
      return
    }

    console.log('✅ Upload realizado com sucesso!')
    console.log(`   - Path: ${uploadData.path}`)
    console.log('')

    // 5. Gerar URL pública
    console.log('5️⃣ Testando URL pública...')
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('instagram-images')
      .getPublicUrl(uploadData.path)

    console.log('✅ URL pública gerada:')
    console.log(`   ${publicUrl}`)
    console.log('')

    // 6. Testar acesso público (fetch)
    console.log('6️⃣ Testando acesso público...')
    try {
      const response = await fetch(publicUrl)
      if (response.ok) {
        console.log('✅ Acesso público funcionando!')
        console.log(`   Status: ${response.status} ${response.statusText}`)
      } else {
        console.error('❌ Erro no acesso público')
        console.log(`   Status: ${response.status} ${response.statusText}`)
        console.log('\n⚠️  Configure a política "Allow public read access"')
        console.log('   Veja: SUPABASE_BUCKET_SETUP.md')
      }
    } catch (fetchError) {
      console.error('❌ Erro ao acessar URL pública:', fetchError)
    }
    console.log('')

    // 7. Testar delete
    console.log('7️⃣ Testando delete (limpeza)...')
    const { error: deleteError } = await supabaseAdmin.storage
      .from('instagram-images')
      .remove([uploadData.path])

    if (deleteError) {
      console.error('❌ Erro ao deletar:', deleteError.message)
      console.log('\n⚠️  Configure a política "Allow authenticated deletes"')
      console.log('   Veja: SUPABASE_BUCKET_SETUP.md')
    } else {
      console.log('✅ Delete funcionando!')
    }
    console.log('')

    // 8. Listar arquivos no bucket
    console.log('8️⃣ Listando arquivos no bucket...')
    const { data: files, error: listFilesError } = await supabaseAdmin.storage
      .from('instagram-images')
      .list()

    if (listFilesError) {
      console.error('❌ Erro ao listar arquivos:', listFilesError.message)
    } else {
      console.log(`📁 Total de arquivos: ${files?.length || 0}`)
      if (files && files.length > 0) {
        console.log('   Últimos arquivos:')
        files.slice(0, 5).forEach(file => {
          console.log(`   - ${file.name} (${(file.metadata?.size / 1024).toFixed(2)} KB)`)
        })
      }
    }
    console.log('')

    // Resumo Final
    console.log('═══════════════════════════════════════════')
    console.log('📊 RESUMO DO TESTE')
    console.log('═══════════════════════════════════════════')
    
    const tests = {
      'Cliente Supabase': !!supabaseAdmin,
      'Bucket Existe': !!instagramBucket,
      'Bucket Público': instagramBucket?.public || false,
      'Upload Funciona': !uploadError,
      'URL Pública': !!publicUrl,
      'Delete Funciona': !deleteError
    }

    Object.entries(tests).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}`)
    })

    const allPassed = Object.values(tests).every(v => v)
    console.log('═══════════════════════════════════════════')
    
    if (allPassed) {
      console.log('\n🎉 TUDO FUNCIONANDO PERFEITAMENTE!')
      console.log('   O bucket está configurado corretamente.')
    } else {
      console.log('\n⚠️  ALGUNS PROBLEMAS ENCONTRADOS')
      console.log('   Veja as instruções em: SUPABASE_BUCKET_SETUP.md')
    }

  } catch (error) {
    console.error('\n❌ ERRO GERAL:', error)
    console.log('\n📝 Verifique:')
    console.log('   1. Variáveis de ambiente configuradas')
    console.log('   2. Bucket criado no Supabase')
    console.log('   3. Políticas de acesso configuradas')
    console.log('\nVeja: SUPABASE_BUCKET_SETUP.md')
  }
}

// Executar teste
testInstagramBucket()
  .then(() => {
    console.log('\n✨ Teste concluído!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n💥 Erro fatal:', error)
    process.exit(1)
  })
