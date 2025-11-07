import hsCodesData from "@/HSCodeList.json"

interface HSChapter {
  chapter: string
  headings: Record<string, string>
}

interface HSCodeMatch {
  code: string
  description: string
  chapter: string
  chapterDescription: string
}

/**
 * Search HS codes by description (fuzzy match)
 */
export function searchHSCodesByDescription(description: string, limit: number = 10): HSCodeMatch[] {
  if (!description || description.trim().length === 0) {
    return []
  }

  const searchTerms = description.toLowerCase().split(/\s+/)
  const matches: HSCodeMatch[] = []

  // Search through all chapters and headings
  for (const [chapterCode, chapterData] of Object.entries(hsCodesData)) {
    const chapter = chapterData as HSChapter
    
    for (const [headingCode, headingDescription] of Object.entries(chapter.headings)) {
      const fullDescription = headingDescription.toLowerCase()
      const fullCode = headingCode // 4-digit heading code
      
      // Calculate match score
      let score = 0
      for (const term of searchTerms) {
        if (fullDescription.includes(term)) {
          score += term.length
        }
      }

      if (score > 0) {
        matches.push({
          code: fullCode,
          description: headingDescription,
          chapter: chapterCode,
          chapterDescription: chapter.chapter,
        })
      }
    }
  }

  // Sort by relevance (simple scoring)
  matches.sort((a, b) => {
    const aScore = searchTerms.reduce((acc, term) => {
      return acc + (a.description.toLowerCase().includes(term) ? term.length : 0)
    }, 0)
    const bScore = searchTerms.reduce((acc, term) => {
      return acc + (b.description.toLowerCase().includes(term) ? term.length : 0)
    }, 0)
    return bScore - aScore
  })

  return matches.slice(0, limit)
}

/**
 * Get HS code by exact code match
 */
export function getHSCodeByCode(code: string): HSCodeMatch | null {
  if (!code) return null

  // Normalize code (remove non-digits, take first 4 digits)
  const normalized = code.replace(/[^\d]/g, "").substring(0, 4)
  if (normalized.length < 4) return null

  // Search through chapters
  for (const [chapterCode, chapterData] of Object.entries(hsCodesData)) {
    const chapter = chapterData as HSChapter
    
    if (chapter.headings[normalized]) {
      return {
        code: normalized,
        description: chapter.headings[normalized],
        chapter: chapterCode,
        chapterDescription: chapter.chapter,
      }
    }
  }

  return null
}

/**
 * Get all HS codes (for reference in prompts)
 */
export function getAllHSCodes(): HSCodeMatch[] {
  const allCodes: HSCodeMatch[] = []

  for (const [chapterCode, chapterData] of Object.entries(hsCodesData)) {
    const chapter = chapterData as HSChapter
    
    for (const [headingCode, headingDescription] of Object.entries(chapter.headings)) {
      allCodes.push({
        code: headingCode,
        description: headingDescription,
        chapter: chapterCode,
        chapterDescription: chapter.chapter,
      })
    }
  }

  return allCodes
}

/**
 * Format HS codes reference for AI prompts
 */
export function formatHSCodesForPrompt(codes: HSCodeMatch[]): string {
  if (codes.length === 0) return ""
  
  return codes
    .map((c) => `- ${c.code}: ${c.description} (Chapter ${c.chapter}: ${c.chapterDescription})`)
    .join("\n")
}

