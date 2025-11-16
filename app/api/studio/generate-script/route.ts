import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ScriptRequest {
  topic: string
  tone: 'educational' | 'casual' | 'professional' | 'humorous'
  duration: number
  platform: 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'podcast'
  locale: 'pt-BR' | 'en-US'
  keywords?: string[]
  targetAudience?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ScriptRequest
    const { topic, tone, duration, platform, locale, keywords, targetAudience } = body

    // Platform-specific prompts
    const platformPrompts = {
      youtube: 'Create a detailed, engaging script with a strong hook in the first 3 seconds, informative main content, and a compelling call-to-action. Structure it for maximum viewer retention.',
      tiktok: 'Create a viral, fast-paced script under 60 seconds. Start with an immediate hook, deliver value quickly, and end with engagement bait (comment, like, follow).',
      instagram: 'Create an engaging script for a 60-90 second reel. Focus on visual storytelling, use captions strategically, and include a strong CTA.',
      linkedin: 'Create a professional, informative script that provides genuine value. Be direct, data-driven, and actionable. Professional tone throughout.',
      podcast: 'Create a conversational, in-depth script with natural pauses for breathing and emphasis. Include intro, main talking points, and outro. Friendly and engaging.',
    }

    const toneDescriptions = {
      educational: 'clear, informative, and teaching-focused',
      casual: 'friendly, conversational, and approachable',
      professional: 'polished, authoritative, and business-like',
      humorous: 'entertaining, witty, and light-hearted',
    }

    const languageInstructions = {
      'pt-BR': 'Write in Brazilian Portuguese (pt-BR). Use natural Brazilian expressions and colloquialisms.',
      'en-US': 'Write in American English (en-US). Use natural American expressions.',
    }

    // Build system prompt
    const systemPrompt = `You are a professional scriptwriter for ${platform} content. ${platformPrompts[platform]}

TONE: ${toneDescriptions[tone]}
LANGUAGE: ${languageInstructions[locale]}
TARGET DURATION: ${duration} seconds
${targetAudience ? `TARGET AUDIENCE: ${targetAudience}` : ''}
${keywords?.length ? `KEYWORDS TO INCLUDE: ${keywords.join(', ')}` : ''}

Return a JSON object with this exact structure:
{
  "title": "Catchy title for the content",
  "hook": "First 3 seconds script - must grab attention immediately",
  "body": [
    {
      "timestamp": 0,
      "text": "Script segment",
      "visualSuggestion": "What should appear on screen",
      "emotionTone": "neutral | excited | serious"
    }
  ],
  "cta": "Call-to-action at the end",
  "metadata": {
    "wordCount": 0,
    "estimatedDuration": 0,
    "seoScore": 0
  }
}

IMPORTANT: 
- Make the hook incredibly compelling
- Structure body as timed segments
- Provide specific visual suggestions
- Estimate duration based on normal speaking pace (150 words/minute)
- Calculate SEO score based on keyword usage and structure (0-100)`

    const userPrompt = `Create a ${duration}-second ${platform} script about: "${topic}"

Remember:
- ${tone} tone
- Target ${duration} seconds
- Platform: ${platform}
- Language: ${locale}`

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    })

    const scriptData = JSON.parse(completion.choices[0].message.content || '{}')

    return NextResponse.json({
      success: true,
      script: scriptData,
    })

  } catch (error) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate script' 
      },
      { status: 500 }
    )
  }
}
