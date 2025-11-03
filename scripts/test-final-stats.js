require('dotenv').config({ path: '.env.local' })

const username = 'ipierette'
const token = process.env.GITHUB_TOKEN

async function testFinalImplementation() {
  console.log('🎯 Testando implementação final da API\n')

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CatBytes-Portfolio',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    // Step 1: Get user data
    console.log('📊 Buscando dados do usuário...')
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers })
    const userData = await userResponse.json()
    
    console.log(`✅ Nome: ${userData.name}`)
    console.log(`✅ Repos públicos: ${userData.public_repos}`)
    console.log(`✅ Conta criada: ${userData.created_at}\n`)

    // Step 2: Get repositories
    console.log('📂 Buscando repositórios...')
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    )
    const repos = await reposResponse.json()
    
    console.log(`✅ Total de repos: ${repos.length}\n`)

    // Calculate stars
    const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)
    console.log(`⭐ Total de stars: ${totalStars}\n`)

    // Get top language with priority for programming languages
    const languages = {}
    for (const repo of repos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    }
    
    // Define priority for programming languages
    const programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin']
    
    // Filter and sort programming languages
    const programmingLangEntries = Object.entries(languages)
      .filter(([lang]) => programmingLanguages.includes(lang))
      .sort(([, a], [, b]) => b - a)
    
    const topLanguage = programmingLangEntries.length > 0
      ? programmingLangEntries[0][0]
      : Object.entries(languages).sort(([, a], [, b]) => b - a)[0]?.[0] || 'JavaScript'
    
    console.log(`💻 Top language: ${topLanguage}`)
    console.log(`💻 Todas as linguagens:`, Object.entries(languages).map(([lang, count]) => `${lang} (${count})`).join(', '))
    console.log(`💻 Linguagens de programação: ${programmingLangEntries.map(([lang, count]) => `${lang} (${count})`).join(', ')}`)
    console.log('')

    // Step 3: Calculate commits
    console.log('📝 Calculando commits...')
    let totalCommits = 0
    
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      { headers }
    )

    const events = await eventsResponse.json()
    const pushEvents = events.filter((event) => event.type === 'PushEvent')
    
    const commitsFromEvents = Math.floor(pushEvents.length * 2.5)
    
    const accountAgeYears = (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
    const ageFactor = Math.max(1.5, Math.min(accountAgeYears, 4))
    
    totalCommits = Math.floor(commitsFromEvents * ageFactor)
    
    console.log(`   Push events encontrados: ${pushEvents.length}`)
    console.log(`   Commits dos eventos: ${commitsFromEvents}`)
    console.log(`   Idade da conta: ${accountAgeYears.toFixed(2)} anos`)
    console.log(`   Fator de multiplicação: ${ageFactor.toFixed(2)}x`)
    console.log(`   ✅ Total de commits: ${totalCommits}\n`)

    // Final stats
    const stats = {
      totalCommits,
      publicRepos: userData.public_repos,
      totalStars,
      topLanguage,
    }

    console.log('\n' + '═'.repeat(50))
    console.log('📊 ESTATÍSTICAS FINAIS DO GITHUB')
    console.log('═'.repeat(50))
    console.log(JSON.stringify(stats, null, 2))
    console.log('═'.repeat(50))

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testFinalImplementation()
