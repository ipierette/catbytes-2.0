import { NextResponse } from 'next/server'

export const runtime = 'edge'
export const revalidate = 3600 // Cache for 1 hour

interface GitHubRepo {
  stargazers_count: number
  language: string | null
}

interface GitHubStats {
  totalCommits: number
  publicRepos: number
  totalStars: number
  topLanguage: string
}

export async function GET() {
  try {
    const username = 'ipierette'
    const token = process.env.GITHUB_TOKEN

    // Headers with authentication if token is available
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CatBytes-Portfolio',
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    console.log('[API] Fetching GitHub stats...', { hasToken: !!token })

    // Fetch user data
    const userResponse = await fetch(`https://api.github.com/users/${username}`, {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!userResponse.ok) {
      throw new Error(`GitHub API error: ${userResponse.status}`)
    }

    const userData = await userResponse.json()

    // Fetch repositories
    const reposResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    )

    if (!reposResponse.ok) {
      throw new Error(`GitHub Repos API error: ${reposResponse.status}`)
    }

    const repos: GitHubRepo[] = await reposResponse.json()

    // Calculate total stars
    const totalStars = repos.reduce((acc, repo) => acc + (repo.stargazers_count || 0), 0)

    // Get top language with priority for programming languages over markup/styling
    const languages: Record<string, number> = {}
    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })
    
    // Define priority order: programming languages > markup/styling languages
    const programmingLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin']
    
    // First, try to find a programming language
    const programmingLangEntries = Object.entries(languages)
      .filter(([lang]) => programmingLanguages.includes(lang))
      .sort(([, a], [, b]) => (b as number) - (a as number))
    
    const topLanguage = programmingLangEntries.length > 0
      ? programmingLangEntries[0][0]
      : Object.entries(languages).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'JavaScript'

    // Get commit count using multiple strategies
    let totalCommits = 0
    
    if (token) {
      try {
        // Strategy: Count PushEvents and estimate
        const eventsResponse = await fetch(
          `https://api.github.com/users/${username}/events/public?per_page=100`,
          {
            headers,
            next: { revalidate: 3600 },
          }
        )

        if (eventsResponse.ok) {
          const events = await eventsResponse.json()
          const pushEvents = events.filter((event: any) => event.type === 'PushEvent')
          
          // Count unique push events and estimate commits
          // Each push event typically represents 1-3 commits, using 2.5 as average
          const commitsFromEvents = Math.floor(pushEvents.length * 2.5)
          
          // Multiply by age factor to account for historical activity
          // Recent events only show last ~90 days of activity
          const accountAgeYears = (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
          const ageFactor = Math.max(1.5, Math.min(accountAgeYears, 4)) // Between 1.5x and 4x
          
          totalCommits = Math.floor(commitsFromEvents * ageFactor)
          console.log('[API] Commits calculation:', { 
            pushEvents: pushEvents.length, 
            commitsFromEvents,
            accountAgeYears: accountAgeYears.toFixed(2),
            ageFactor: ageFactor.toFixed(2),
            totalCommits 
          })
        }
      } catch (error) {
        console.error('[API] Error fetching commit count:', error)
      }
    }

    // Fallback to intelligent estimation based on repos and account age
    if (totalCommits === 0) {
      const accountAgeYears = (Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 365)
      const avgCommitsPerRepo = 20 // Conservative estimate
      totalCommits = Math.floor(repos.length * avgCommitsPerRepo * Math.min(accountAgeYears / 2, 1.5))
      console.log('[API] Using fallback estimation:', { repos: repos.length, accountAgeYears: accountAgeYears.toFixed(2), totalCommits })
    }

    const stats: GitHubStats = {
      totalCommits,
      publicRepos: userData.public_repos || repos.length,
      totalStars,
      topLanguage,
    }

    console.log('[API] GitHub stats fetched successfully:', stats)

    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error('[API] Error fetching GitHub stats:', error)

    // Return fallback data on error
    return NextResponse.json(
      {
        totalCommits: 250,
        publicRepos: 18,
        totalStars: 12,
        topLanguage: 'TypeScript',
      },
      {
        status: 200, // Still return 200 with fallback data
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  }
}
