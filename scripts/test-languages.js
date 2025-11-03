require('dotenv').config({ path: '.env.local' })

const username = 'ipierette'
const token = process.env.GITHUB_TOKEN

async function testLanguages() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CatBytes-Portfolio',
    'Authorization': `Bearer ${token}`
  }

  try {
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    )
    const repos = await reposResponse.json()

    console.log('📂 Analisando linguagens dos repositórios:\n')
    
    const reposByLanguage = {}
    
    for (const repo of repos) {
      const lang = repo.language || 'Unknown'
      if (!reposByLanguage[lang]) {
        reposByLanguage[lang] = []
      }
      reposByLanguage[lang].push(repo.name)
    }

    // Mostrar todos os repos agrupados por linguagem
    for (const [lang, reposList] of Object.entries(reposByLanguage).sort(([, a], [, b]) => b.length - a.length)) {
      console.log(`\n${lang} (${reposList.length} repos):`)
      reposList.forEach(name => console.log(`  - ${name}`))
    }

    console.log('\n' + '═'.repeat(50))
    console.log('📊 RESUMO POR LINGUAGEM:')
    console.log('═'.repeat(50))
    
    const sorted = Object.entries(reposByLanguage).sort(([, a], [, b]) => b.length - a.length)
    sorted.forEach(([lang, repos]) => {
      console.log(`${lang.padEnd(15)} → ${repos.length} repos`)
    })

    const topLanguage = sorted[0][0]
    console.log(`\n🏆 Top Language detectada: ${topLanguage}`)

    // Agora vamos pegar as linguagens de alguns repos específicos
    console.log('\n' + '═'.repeat(50))
    console.log('🔍 Analisando linguagens detalhadas de alguns repos...')
    console.log('═'.repeat(50))

    const samplesToCheck = repos.slice(0, 5) // Primeiros 5 repos
    
    for (const repo of samplesToCheck) {
      console.log(`\n📦 ${repo.name}`)
      console.log(`   Linguagem principal (API): ${repo.language || 'N/A'}`)
      
      // Buscar linguagens detalhadas
      const langResponse = await fetch(repo.languages_url, { headers })
      if (langResponse.ok) {
        const languages = await langResponse.json()
        const total = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0)
        
        console.log(`   Distribuição detalhada:`)
        for (const [lang, bytes] of Object.entries(languages).sort(([,a], [,b]) => b - a)) {
          const percentage = ((bytes / total) * 100).toFixed(1)
          console.log(`     - ${lang}: ${percentage}%`)
        }
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testLanguages()
