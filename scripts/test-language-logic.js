require('dotenv').config({ path: '.env.local' })

const username = 'ipierette'
const token = process.env.GITHUB_TOKEN

async function testNewLanguageLogic() {
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

    console.log('🔍 Testando nova lógica de linguagem:\n')

    // Contar linguagens
    const languages = {}
    for (const repo of repos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    }

    console.log('📊 Todas as linguagens encontradas:')
    for (const [lang, count] of Object.entries(languages).sort(([,a], [,b]) => b - a)) {
      console.log(`   ${lang.padEnd(15)} → ${count} repos`)
    }

    // Aplicar lógica de prioridade
    const programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin']
    
    const programmingLangEntries = Object.entries(languages)
      .filter(([lang]) => programmingLanguages.includes(lang))
      .sort(([, a], [, b]) => b - a)
    
    console.log('\n💻 Linguagens de programação filtradas:')
    for (const [lang, count] of programmingLangEntries) {
      console.log(`   ${lang.padEnd(15)} → ${count} repos`)
    }

    const topLanguage = programmingLangEntries.length > 0
      ? programmingLangEntries[0][0]
      : Object.entries(languages).sort(([, a], [, b]) => b - a)[0]?.[0] || 'JavaScript'

    console.log('\n' + '═'.repeat(50))
    console.log(`🏆 Top Language (nova lógica): ${topLanguage}`)
    console.log('═'.repeat(50))

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testNewLanguageLogic()
