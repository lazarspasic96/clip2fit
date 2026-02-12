export type SupportedPlatform = 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'twitter' | 'unknown'

interface UrlValidationResult {
  isValid: boolean
  platform: SupportedPlatform
  cleanUrl: string
}

const PLATFORM_PATTERNS: { platform: SupportedPlatform; pattern: RegExp }[] = [
  { platform: 'instagram', pattern: /instagram\.com/ },
  { platform: 'tiktok', pattern: /tiktok\.com/ },
  { platform: 'youtube', pattern: /(?:youtube\.com|youtu\.be)/ },
  { platform: 'facebook', pattern: /(?:facebook\.com|fb\.watch)/ },
  { platform: 'twitter', pattern: /(?:twitter\.com|x\.com)/ },
]

const URL_REGEX = /https?:\/\/[^\s]+/

/** Extract a URL from text that may contain surrounding words (e.g. "Check out this video: https://...") */
const extractUrl = (input: string): string | null => {
  const match = input.match(URL_REGEX)
  return match ? match[0] : null
}

export const validateWorkoutUrl = (input: string): UrlValidationResult => {
  const trimmed = input.trim()

  // Try to extract URL from text (social apps often share "Check out: https://...")
  const rawUrl = extractUrl(trimmed) ?? trimmed

  let url: URL
  try {
    url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`)
  } catch {
    return { isValid: false, platform: 'unknown', cleanUrl: trimmed }
  }

  const matched = PLATFORM_PATTERNS.find((p) => p.pattern.test(url.hostname))

  return {
    isValid: matched !== undefined,
    platform: matched?.platform ?? 'unknown',
    cleanUrl: url.toString(),
  }
}
