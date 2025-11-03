import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export interface TranslatablePost {
  title: string
  content: string
  excerpt: string
  category: string
}

export interface TranslatedPost {
  title: string
  content: string
  excerpt: string
  category: string
}

/**
 * Translates a blog post from Portuguese to English using OpenAI GPT-4o-mini
 * Maintains formatting, code blocks, and technical terminology
 * 
 * @param post - The post in Portuguese to translate
 * @returns Translated post in English
 */
export async function translatePostToEnglish(
  post: TranslatablePost
): Promise<TranslatedPost> {
  try {
    const prompt = `You are a professional translator specializing in technology and programming content.

Translate the following blog post from Portuguese (PT-BR) to English (EN-US).

IMPORTANT RULES:
1. Maintain all Markdown formatting (headers, lists, code blocks, links, bold, italic)
2. Keep technical terms accurate (API, framework names, programming concepts)
3. Preserve code blocks EXACTLY as they are (do not translate code)
4. Use natural, fluent English suitable for tech professionals
5. Maintain the same tone and style (professional but friendly)
6. Keep SEO keywords relevant in English

BLOG POST TO TRANSLATE:

**Title:** ${post.title}

**Category:** ${post.category}

**Excerpt:** ${post.excerpt}

**Content:**
${post.content}

---

Respond ONLY with a valid JSON object in this exact format:
{
  "title": "translated title here",
  "category": "translated category here",
  "excerpt": "translated excerpt here",
  "content": "translated content here with all markdown preserved"
}

Do not include any other text outside the JSON object.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a professional translator specializing in technical content. You always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent translations
      response_format: { type: 'json_object' }
    })

    const translatedText = completion.choices[0]?.message?.content
    if (!translatedText) {
      throw new Error('No translation received from OpenAI')
    }

    const translated = JSON.parse(translatedText)

    // Validate required fields
    if (!translated.title || !translated.content || !translated.excerpt || !translated.category) {
      throw new Error('Translation missing required fields')
    }

    return {
      title: translated.title,
      content: translated.content,
      excerpt: translated.excerpt,
      category: translated.category
    }

  } catch (error) {
    console.error('Translation error:', error)
    throw new Error(`Failed to translate post: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Translates category name from Portuguese to English
 */
export function translateCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'Inteligência Artificial': 'Artificial Intelligence',
    'Desenvolvimento Web': 'Web Development',
    'DevOps': 'DevOps',
    'Mobile': 'Mobile',
    'Cloud Computing': 'Cloud Computing',
    'Segurança': 'Security',
    'Data Science': 'Data Science',
    'Backend': 'Backend',
    'Frontend': 'Frontend',
    'Tutoriais': 'Tutorials',
    'Notícias': 'News',
    'Carreira': 'Career'
  }

  return categoryMap[category] || category
}

/**
 * Estimates the cost of translating a post
 * GPT-4o-mini pricing: $0.150/1M input tokens, $0.600/1M output tokens
 */
export function estimateTranslationCost(post: TranslatablePost): number {
  const inputText = `${post.title} ${post.category} ${post.excerpt} ${post.content}`
  const estimatedInputTokens = Math.ceil(inputText.length / 4) // Rough estimate: 4 chars per token
  const estimatedOutputTokens = estimatedInputTokens // Similar length expected
  
  const inputCost = (estimatedInputTokens / 1_000_000) * 0.150
  const outputCost = (estimatedOutputTokens / 1_000_000) * 0.600
  
  return inputCost + outputCost
}
