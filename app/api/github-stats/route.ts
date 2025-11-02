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

    // Get top language
    const languages: Record<string, number> = {}
    repos.forEach((repo) => {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1
      }
    })
    const topLanguage =
      Object.entries(languages).sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] ||
      'TypeScript'

    // Get commit count if authenticated
    let totalCommits = 0
    if (token) {
      try {
        // Fetch recent commit activity (last year)
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

          // Count commits from push events
          totalCommits = pushEvents.reduce((acc: number, event: any) => {
            return acc + (event.payload?.commits?.length || 0)
          }, 0)

          // If we got commits from events, multiply by estimate factor
          // (events only show recent activity, not all-time)
          if (totalCommits > 0) {
            totalCommits = Math.floor(totalCommits * 2.5) // Rough estimate multiplier
          }
        }
      } catch (error) {
        console.error('[API] Error fetching commit count:', error)
      }
    }

    // Fallback to estimation if we couldn't get commits
    if (totalCommits === 0) {
      totalCommits = repos.length * 15 // Average 15 commits per repo
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
