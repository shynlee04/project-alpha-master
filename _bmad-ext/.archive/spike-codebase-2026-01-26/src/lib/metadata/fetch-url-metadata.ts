/**
 * @fileoverview URL metadata fetching with Open Graph support
 * @module lib/metadata/fetch-url-metadata
 *
 * E2-6: URL Fetching and Preview
 * - Fetches page title, description, OG image
 * - Handles CORS via no-cors mode fallback
 * - Timeout and error handling
 */

/**
 * URL metadata returned from fetch
 */
export interface URLMetadata {
  url: string
  title?: string
  description?: string
  image?: string
  favicon?: string
  domain: string
}

/**
 * Options for metadata fetching
 */
export interface FetchURLOptions {
  timeout?: number // Default: 10000ms
  signal?: AbortSignal
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

/**
 * Extract favicon URL from HTML
 */
function extractFavicon(html: string, baseUrl: string): string | undefined {
  // Try icon link tag
  const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i)
  if (iconMatch?.[1]) {
    try {
      return new URL(iconMatch[1], baseUrl).href
    } catch {
      return undefined
    }
  }

  // Fallback to /favicon.ico
  try {
    const urlObj = new URL(baseUrl)
    return `${urlObj.protocol}//${urlObj.host}/favicon.ico`
  } catch {
    return undefined
  }
}

/**
 * Extract Open Graph metadata from HTML
 */
function extractOpenGraph(html: string, baseUrl: string): Partial<URLMetadata> {
  const result: Partial<URLMetadata> = {}

  // Extract title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
  result.title = ogTitleMatch?.[1] || undefined

  // Fallback to page title
  if (!result.title) {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    result.title = titleMatch?.[1] || undefined
  }

  // Extract description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
  result.description = ogDescMatch?.[1] || undefined

  // Fallback to meta description
  if (!result.description) {
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    result.description = descMatch?.[1] || undefined
  }

  // Extract image
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)
  if (ogImageMatch?.[1]) {
    try {
      result.image = new URL(ogImageMatch[1], baseUrl).href
    } catch {
      result.image = undefined
    }
  }

  return result
}

/**
 * Fetch URL metadata with Open Graph parsing
 *
 * Note: Due to CORS restrictions, this uses no-cors mode which returns
 * an opaque response. We extract what we can from the URL itself.
 *
 * For full metadata fetching, a server-side proxy is recommended.
 */
export async function fetchURLMetadata(
  url: string,
  options: FetchURLOptions = {}
): Promise<URLMetadata> {
  const { timeout = 10000, signal } = options

  // Validate URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
    if (!parsedUrl.protocol.startsWith('http')) {
      throw new Error('Invalid URL protocol')
    }
  } catch {
    throw new Error('Invalid URL')
  }

  const domain = extractDomain(url)

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  // Combine with external signal if provided
  if (signal) {
    signal.addEventListener('abort', () => controller.abort())
  }

  try {
    // Try to fetch with CORS proxy for full metadata
    // Using a public CORS proxy for MVP
    const corsProxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    const response = await fetch(corsProxy, {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const html = await response.text()
    const ogData = extractOpenGraph(html, url)
    const favicon = extractFavicon(html, url)

    return {
      url,
      domain,
      title: ogData.title,
      description: ogData.description,
      image: ogData.image,
      favicon,
    }
  } catch (error) {
    // Fallback: return minimal metadata from URL
    return {
      url,
      domain,
      title: domain, // Fallback to domain as title
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Validate URL string
 */
export function isValidURL(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
