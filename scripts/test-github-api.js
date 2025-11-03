require('dotenv').config({ path: '.env.local' })

const username = 'ipierette'
const token = process.env.GITHUB_TOKEN

async function testGitHubAPI() {
  console.log('🔍 Testando GitHub API...\n')
  console.log(`👤 Username: ${username}`)
  console.log(`🔑 Token: ${token ? token.substring(0, 20) + '...' : '❌ NÃO ENCONTRADO'}\n`)

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CatBytes-Portfolio',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    // Test 1: User data
    console.log('📊 Teste 1: Dados do usuário')
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers })
    
    console.log(`Status: ${userResponse.status} ${userResponse.statusText}`)
    console.log(`Rate Limit Remaining: ${userResponse.headers.get('x-ratelimit-remaining')}/${userResponse.headers.get('x-ratelimit-limit')}`)
    
    if (!userResponse.ok) {
      const errorData = await userResponse.text()
      console.error('❌ Erro na resposta:', errorData)
      return
    }

    const userData = await userResponse.json()
    console.log('✅ Dados do usuário:')
    console.log(`   - Nome: ${userData.name}`)
    console.log(`   - Repos públicos: ${userData.public_repos}`)
    console.log(`   - Followers: ${userData.followers}`)
    console.log(`   - Created: ${userData.created_at}`)
    console.log('')

    // Test 2: Repositories
    console.log('📂 Teste 2: Repositórios')
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    )

    console.log(`Status: ${reposResponse.status} ${reposResponse.statusText}`)
    console.log(`Rate Limit Remaining: ${reposResponse.headers.get('x-ratelimit-remaining')}/${reposResponse.headers.get('x-ratelimit-limit')}`)

    if (!reposResponse.ok) {
      const errorData = await reposResponse.text()
      console.error('❌ Erro na resposta:', errorData)
      return
    }

    const repos = await reposResponse.json()
    console.log(`✅ Total de repos encontrados: ${repos.length}`)

    // Calculate stats
    const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)
    console.log(`   - Total de stars: ${totalStars}`)

    const languages = {}
    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })
    const topLanguage = Object.entries(languages).sort(([, a], [, b]) => b - a)[0]
    console.log(`   - Top language: ${topLanguage ? topLanguage[0] : 'N/A'} (${topLanguage ? topLanguage[1] : 0} repos)`)
    console.log(`   - Linguagens: ${Object.keys(languages).join(', ')}`)
    console.log('')

    // Test 3: Events (commits)
    console.log('📝 Teste 3: Eventos/Commits')
    const eventsResponse = await fetch(
      `https://api.github.com/users/${username}/events/public?per_page=100`,
      { headers }
    )

    console.log(`Status: ${eventsResponse.status} ${eventsResponse.statusText}`)
    console.log(`Rate Limit Remaining: ${eventsResponse.headers.get('x-ratelimit-remaining')}/${eventsResponse.headers.get('x-ratelimit-limit')}`)

    if (!eventsResponse.ok) {
      const errorData = await eventsResponse.text()
      console.error('❌ Erro na resposta:', errorData)
      return
    }

    const events = await eventsResponse.json()
    console.log(`✅ Total de eventos encontrados: ${events.length}`)

    const pushEvents = events.filter((event) => event.type === 'PushEvent')
    console.log(`   - Push events: ${pushEvents.length}`)

    const totalCommitsFromEvents = pushEvents.reduce((acc, event) => {
      return acc + (event.payload?.commits?.length || 0)
    }, 0)
    console.log(`   - Commits nos push events: ${totalCommitsFromEvents}`)
    console.log(`   - Estimativa total: ${Math.floor(totalCommitsFromEvents * 2.5)}`)
    console.log('')

    // Final stats
    console.log('📊 ESTATÍSTICAS FINAIS:')
    console.log('─'.repeat(50))
    const finalStats = {
      totalCommits: totalCommitsFromEvents > 0 ? Math.floor(totalCommitsFromEvents * 2.5) : repos.length * 15,
      publicRepos: userData.public_repos,
      totalStars: totalStars,
      topLanguage: topLanguage ? topLanguage[0] : 'TypeScript',
    }
    console.log(JSON.stringify(finalStats, null, 2))

  } catch (error) {
    console.error('❌ Erro geral:', error.message)
    console.error(error)
  }
}

testGitHubAPI()
