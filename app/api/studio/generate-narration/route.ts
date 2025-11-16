import { NextRequest, NextResponse } from 'next/server'

const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY
const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1'

export async function POST(request: NextRequest) {
  try {
    const { text, voiceId, modelId, voiceSettings } = await request.json()

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Missing required fields: text, voiceId' },
        { status: 400 }
      )
    }

    if (!ELEVEN_LABS_API_KEY) {
      return NextResponse.json(
        { error: 'Eleven Labs API key not configured' },
        { status: 500 }
      )
    }

    // Call Eleven Labs API
    const response = await fetch(
      `${ELEVEN_LABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVEN_LABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: modelId || 'eleven_multilingual_v2',
          voice_settings: voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      console.error('Eleven Labs API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate narration' },
        { status: response.status }
      )
    }

    // Get audio buffer
    const audioBuffer = await response.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString('base64')

    // Calculate duration (approximate based on text length)
    const wordsPerMinute = 150
    const words = text.split(/\s+/).length
    const estimatedDuration = (words / wordsPerMinute) * 60

    return NextResponse.json({
      success: true,
      narration: {
        audioData: audioBase64,
        audioUrl: '', // Will be set after upload to Supabase
        duration: estimatedDuration,
        voiceId,
        modelId: modelId || 'eleven_multilingual_v2',
        text,
        characterCount: text.length,
      },
    })
  } catch (error) {
    console.error('Generate narration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get available voices
export async function GET() {
  try {
    if (!ELEVEN_LABS_API_KEY) {
      return NextResponse.json(
        { error: 'Eleven Labs API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${ELEVEN_LABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': ELEVEN_LABS_API_KEY,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch voices' },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      voices: data.voices.map((voice: any) => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        previewUrl: voice.preview_url,
        labels: voice.labels,
      })),
    })
  } catch (error) {
    console.error('Get voices error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
