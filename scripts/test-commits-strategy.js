require('dotenv').config({ path: '.env.local' })

const username = 'ipierette'
const token = process.env.GITHUB_TOKEN

async function testNewApproach() {
  console.log('🧪 Testando nova abordagem para commits\n')

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'CatBytes-Portfolio',
    'Authorization': `Bearer ${token}`
  }

  try {
    // Get user data first
    const userResponse = await fetch(`https://api.github.com/users/${username}`, { headers })
    const userData = await userResponse.json()
    console.log(`📅 Conta criada em: ${userData.created_at}`)
    
    const accountAgeYears = (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
    console.log(`📆 Idade da conta: ${accountAgeYears.toFixed(2)} anos\n`)

    // Get repos
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      { headers }
    )
    const repos = await reposResponse.json()
    console.log(`📂 Total de repos: ${repos.length}\n`)

    // Strategy 1: Participation stats
    console.log('📊 Estratégia 1: Stats de participação')
    const statsResponse = await fetch(
      `https://api.github.com/users/${username}/stats/participation`,
      { headers }
    )
    
    console.log(`   Status: ${statsResponse.status}`)
    
    let totalCommits = 0
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json()
      console.log(`   Owner data:`, statsData.owner || 'N/A')
      console.log(`   All data:`, statsData.all || 'N/A')
      
      if (statsData.all && Array.isArray(statsData.all)) {
        const recentCommits = statsData.all.reduce((acc, val) => acc + val, 0)
        totalCommits = Math.floor(recentCommits * Math.max(accountAgeYears, 1))
        console.log(`   ✅ Commits recentes (52 semanas): ${recentCommits}`)
        console.log(`   ✅ Estimativa total: ${totalCommits}`)
      } else {
        console.log(`   ❌ Estrutura inesperada`)
      }
    } else {
      console.log(`   ❌ API não disponível (${statsResponse.status})`)
    }
    console.log('')

    // Strategy 2: Events fallback
    if (totalCommits === 0) {
      console.log('📊 Estratégia 2: Contar PushEvents')
      const eventsResponse = await fetch(
        `https://api.github.com/users/${username}/events/public?per_page=100`,
        { headers }
      )

      const events = await eventsResponse.json()
      const pushEvents = events.filter((event) => event.type === 'PushEvent')
      
      totalCommits = Math.floor(pushEvents.length * 2.5)
      console.log(`   Push events: ${pushEvents.length}`)
      console.log(`   ✅ Estimativa: ${totalCommits}`)
      console.log('')
    }

    // Strategy 3: Intelligent estimation
    if (totalCommits === 0) {
      console.log('📊 Estratégia 3: Estimativa inteligente')
      const avgCommitsPerRepo = 20
      totalCommits = Math.floor(repos.length * avgCommitsPerRepo * Math.min(accountAgeYears / 2, 1.5))
      console.log(`   Repos: ${repos.length}`)
      console.log(`   Média por repo: ${avgCommitsPerRepo}`)
      console.log(`   Fator idade: ${Math.min(accountAgeYears / 2, 1.5).toFixed(2)}`)
      console.log(`   ✅ Estimativa: ${totalCommits}`)
    }

    console.log('\n' + '─'.repeat(50))
    console.log(`🎯 TOTAL FINAL DE COMMITS: ${totalCommits}`)
    console.log('─'.repeat(50))

  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

testNewApproach()
