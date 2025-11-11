/**
 * Google Indexing API - Auto-submit URLs to Google
 * Acelera indexação de novos posts (3h vs 3 dias)
 */

import { google } from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/indexing']

interface IndexingResult {
  success: boolean
  url: string
  error?: string
}

/**
 * Submit URL to Google Indexing API
 * Requires service account credentials in GOOGLE_APPLICATION_CREDENTIALS env or GOOGLE_INDEXING_KEY
 */
export async function submitUrlToGoogle(url: string, type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<IndexingResult> {
  try {
    // Check if credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_INDEXING_KEY) {
      console.warn('[Google Indexing] Credentials not configured - skipping auto-indexing')
      return {
        success: false,
        url,
        error: 'Credentials not configured',
      }
    }

    // Create auth client
    let credentials: any = undefined
    
    if (process.env.GOOGLE_INDEXING_KEY) {
      try {
        credentials = JSON.parse(process.env.GOOGLE_INDEXING_KEY)
      } catch (e) {
        console.error('[Google Indexing] Failed to parse GOOGLE_INDEXING_KEY:', e)
      }
    }

    const authClient = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      credentials,
      scopes: SCOPES,
    })

    const auth = await authClient.getClient()
    const indexing = google.indexing({ version: 'v3', auth: auth as any })

    // Submit URL
    const response = await indexing.urlNotifications.publish({
      requestBody: {
        url,
        type,
      },
    })

    console.log(`[Google Indexing] ✅ URL submitted successfully: ${url}`)
    console.log(`[Google Indexing] Response:`, response.data)

    return {
      success: true,
      url,
    }
  } catch (error: any) {
    console.error('[Google Indexing] ❌ Error submitting URL:', error.message)
    
    return {
      success: false,
      url,
      error: error.message,
    }
  }
}

/**
 * Get status of URL in Google Search
 */
export async function getUrlStatus(url: string) {
  try {
    const authClient = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: SCOPES,
    })

    const auth = await authClient.getClient()
    const indexing = google.indexing({ version: 'v3', auth: auth as any })

    const response = await indexing.urlNotifications.getMetadata({ url })
    
    console.log(`[Google Indexing] Status for ${url}:`, response.data)
    return response.data
  } catch (error: any) {
    console.error('[Google Indexing] Error getting URL status:', error.message)
    return null
  }
}

/**
 * Submit batch of URLs (up to 100 at once)
 */
export async function submitBatchUrls(urls: string[], type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'): Promise<IndexingResult[]> {
  console.log(`[Google Indexing] Submitting batch of ${urls.length} URLs...`)
  
  const results = await Promise.allSettled(
    urls.map(url => submitUrlToGoogle(url, type))
  )

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        success: false,
        url: urls[index],
        error: result.reason?.message || 'Unknown error',
      }
    }
  })
}

/**
 * Auto-submit new blog post to Google (called after post creation)
 */
export async function autoSubmitBlogPost(slug: string, locale: string = 'pt-BR'): Promise<IndexingResult> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  const url = `${baseUrl}/${locale}/blog/${slug}`
  
  console.log(`[Google Indexing] Auto-submitting new blog post: ${url}`)
  
  return submitUrlToGoogle(url, 'URL_UPDATED')
}

/**
 * Auto-submit new landing page to Google
 */
export async function autoSubmitLandingPage(slug: string): Promise<IndexingResult> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://catbytes.site'
  const url = `${baseUrl}/pt-BR/lp/${slug}`
  
  console.log(`[Google Indexing] Auto-submitting new landing page: ${url}`)
  
  return submitUrlToGoogle(url, 'URL_UPDATED')
}
