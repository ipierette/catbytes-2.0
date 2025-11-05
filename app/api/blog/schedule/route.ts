import { NextRequest, NextResponse } from 'next/server'
import { getBlogScheduleInfo, getCurrentBlogTheme, getRandomTopicForTheme, isBlogPostDay } from '@/lib/blog-scheduler'

/**
 * GET /api/blog/schedule
 * Test endpoint to check blog theme scheduling
 */
export async function GET(request: NextRequest) {
  try {
    const scheduleInfo = getBlogScheduleInfo()
    
    // Get sample topics for each theme
    const sampleTopics = {
      'Automação e Negócios': getRandomTopicForTheme('Automação e Negócios'),
      'Programação e IA': getRandomTopicForTheme('Programação e IA'), 
      'Cuidados Felinos': getRandomTopicForTheme('Cuidados Felinos'),
    }
    
    const today = new Date()
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
    
    return NextResponse.json({
      success: true,
      currentDay: {
        date: today.toLocaleDateString('pt-BR'),
        dayOfWeek: today.getDay(),
        dayName: dayNames[today.getDay()],
      },
      scheduling: scheduleInfo,
      sampleTopics,
      postingSchedule: {
        tuesday: 'Automação e Negócios - Para clientes e recrutadores',
        thursday: 'Programação e IA - Dicas técnicas acessíveis',
        saturday: 'Cuidados Felinos - Gatinhos e cuidados',
      },
      nextPostDays: {
        nextTuesday: 'Automação empresarial, ROI digital, transformação',
        nextThursday: 'Programação para iniciantes, IA explicada, dicas dev',
        nextSaturday: 'Cuidados com gatos, saúde felina, bem-estar animal',
      }
    })
  } catch (error) {
    console.error('Error checking blog schedule:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/blog/schedule
 * Generate blog post for specific theme (for testing)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { theme } = body
    
    if (!theme || !['Automação e Negócios', 'Programação e IA', 'Cuidados Felinos'].includes(theme)) {
      return NextResponse.json(
        { error: 'Invalid theme. Must be: Automação e Negócios, Programação e IA, or Cuidados Felinos' },
        { status: 400 }
      )
    }
    
    // Redirect to main generate endpoint with theme parameter
    const generateUrl = new URL('/api/blog/generate', request.url)
    
    const generateResponse = await fetch(generateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ theme }),
    })
    
    const result = await generateResponse.json()
    
    return NextResponse.json({
      success: true,
      message: `Blog post generated for theme: ${theme}`,
      ...result,
    })
  } catch (error) {
    console.error('Error generating themed blog post:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}