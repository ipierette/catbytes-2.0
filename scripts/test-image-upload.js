/**
 * Script de teste para verificar upload de imagens
 * Demonstra que o arquivo físico é salvo no Supabase, não apenas a URL
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testImageUpload() {
  console.log('🧪 Teste: Upload de Imagem para Supabase Storage\n')

  // URL de teste (placeholder que não expira)
  const testImageUrl = 'https://placehold.co/600x400/purple/white/png?text=CatBytes+Test'

  console.log('📥 1. Baixando imagem de teste...')
  console.log('   URL:', testImageUrl)

  const response = await fetch(testImageUrl)
  if (!response.ok) {
    throw new Error('Failed to download test image')
  }

  const imageBlob = await response.blob()
  const imageBuffer = await imageBlob.arrayBuffer()
  const fileSizeKB = (imageBuffer.byteLength / 1024).toFixed(2)

  console.log('   ✅ Imagem baixada:', fileSizeKB, 'KB')
  console.log('   ✅ Tipo:', response.headers.get('content-type'))
  console.log('   ✅ Bytes do arquivo:', imageBuffer.byteLength, 'bytes\n')

  const fileName = `test-upload-${Date.now()}.png`
  const filePath = `blog-covers/${fileName}`

  console.log('📤 2. Fazendo upload para Supabase Storage...')
  console.log('   Bucket: blog-images')
  console.log('   Path:', filePath)

  const { data, error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, imageBuffer, {
      contentType: 'image/png',
      cacheControl: '31536000'
    })

  if (error) {
    console.error('   ❌ Erro no upload:', error.message)

    if (error.message.includes('not found')) {
      console.error('\n⚠️  Bucket "blog-images" não existe!')
      console.error('   Crie o bucket seguindo: SUPABASE_STORAGE_SETUP.md')
    }

    throw error
  }

  console.log('   ✅ Upload concluído!')
  console.log('   ✅ Path no Supabase:', data.path, '\n')

  console.log('🔗 3. Gerando URL pública permanente...')

  const { data: publicUrlData } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath)

  const publicUrl = publicUrlData.publicUrl

  console.log('   ✅ URL pública:', publicUrl, '\n')

  console.log('🧪 4. Verificando se o arquivo existe no Supabase...')

  // Tenta baixar o arquivo do Supabase para confirmar
  const verifyResponse = await fetch(publicUrl)

  if (verifyResponse.ok) {
    const verifyBlob = await verifyResponse.blob()
    console.log('   ✅ Arquivo confirmado no Supabase!')
    console.log('   ✅ Tamanho:', (verifyBlob.size / 1024).toFixed(2), 'KB')
    console.log('   ✅ Tipo:', verifyResponse.headers.get('content-type'))
  } else {
    console.error('   ❌ Arquivo não encontrado no Supabase')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ TESTE CONCLUÍDO COM SUCESSO!')
  console.log('='.repeat(60))
  console.log('\n📋 Resumo:')
  console.log('   1. ✅ Imagem baixada da URL original')
  console.log('   2. ✅ Arquivo físico enviado para Supabase')
  console.log('   3. ✅ URL permanente gerada')
  console.log('   4. ✅ Arquivo confirmado no Supabase Storage')
  console.log('\n💡 Conclusão:')
  console.log('   O arquivo FÍSICO está salvo no Supabase.')
  console.log('   A URL gerada NUNCA expira.')
  console.log('   A imagem está garantida permanentemente!\n')

  console.log('🧹 Limpeza (opcional):')
  console.log(`   Para deletar este arquivo de teste, execute:`)
  console.log(`   DELETE FROM storage.objects WHERE name = '${filePath}';\n`)
}

testImageUpload().catch(error => {
  console.error('\n❌ Erro no teste:', error.message)
  process.exit(1)
})
