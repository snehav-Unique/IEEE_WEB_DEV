import { INTERESTS } from './personalization'

const SEARCH_SYNONYMS = new Map([
  ['ai', ['ai', 'artificial intelligence']],
  ['ml', ['ml', 'machine learning']],
  ['dsa', ['dsa', 'data structures', 'algorithms']],
  ['devops', ['devops', 'cloud']],
  ['ui', ['ui', 'ui/ux', 'user interface']],
  ['ux', ['ux', 'ui/ux', 'user experience']],
  ['iot', ['iot', 'internet of things']],
  ['web', ['web development', 'web dev', 'frontend']],
  ['cyber', ['cybersecurity', 'security']],
  ['sec', ['security', 'cybersecurity']],
  ['fin', ['finance', 'financial']],
  ['crypto', ['blockchain', 'web3', 'crypto']],
  ['startup', ['entrepreneurship', 'startup']],
])

export function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function tokenizeSearchText(value) {
  const normalized = normalizeText(value)
  if (!normalized) return []
  return normalized.split(' ').filter(Boolean)
}

export function expandSearchTerm(term) {
  const normalized = normalizeText(term)
  if (!normalized) return []
  const direct = [normalized]
  const synonyms = SEARCH_SYNONYMS.get(normalized) ?? []
  return [...new Set([...direct, ...synonyms.map(normalizeText)].filter(Boolean))]
}

export function levenshteinDistance(a, b, maxDistance = 3) {
  const left = normalizeText(a)
  const right = normalizeText(b)

  if (left === right) return 0
  if (!left || !right) return Math.max(left.length, right.length)
  if (Math.abs(left.length - right.length) > maxDistance) return maxDistance + 1

  let prev = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let i = 1; i <= left.length; i += 1) {
    const current = [i]

    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1
      current[j] = Math.min(
        current[j - 1] + 1,
        prev[j] + 1,
        prev[j - 1] + cost
      )
    }

    prev = current
  }

  return prev[right.length]
}

function scoreTokenAgainstWords(token, words) {
  const expandedTokens = expandSearchTerm(token)
  let best = 0

  for (const variant of expandedTokens) {
    if (!variant) continue

    for (const word of words) {
      if (!word) continue

      if (word === variant) {
        best = Math.max(best, 10)
        continue
      }

      if (word.startsWith(variant) || variant.startsWith(word)) {
        best = Math.max(best, 8)
        continue
      }

      if (word.includes(variant) || variant.includes(word)) {
        best = Math.max(best, 7)
        continue
      }

      const distance = levenshteinDistance(variant, word, 2)
      if (distance <= 1) {
        best = Math.max(best, 6)
      } else if (distance === 2) {
        best = Math.max(best, 4)
      }
    }
  }

  return best
}

export function scoreSearchQuery(query, haystack) {
  const normalizedQuery = normalizeText(query)
  const normalizedHaystack = normalizeText(haystack)
  if (!normalizedQuery || !normalizedHaystack) return 0

  const haystackWords = tokenizeSearchText(normalizedHaystack)
  const queryTokens = tokenizeSearchText(normalizedQuery)
  let score = 0
  let matchedTokens = 0

  if (normalizedHaystack.includes(normalizedQuery)) {
    score += 15
  }

  for (const token of queryTokens) {
    const tokenScore = scoreTokenAgainstWords(token, haystackWords)
    if (tokenScore > 0) {
      matchedTokens += 1
      score += tokenScore
    }
  }

  if (matchedTokens > 1) {
    score += 2 * (matchedTokens - 1)
  }

  if (matchedTokens === queryTokens.length && queryTokens.length > 0) {
    score += 4
  }

  return score
}

function collectEventSearchTerms(event) {
  return [
    event?.title,
    event?.description,
    event?.hostClub,
    event?.location?.summary,
    event?.type,
    ...(event?.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
}

function collectSuggestionCandidates(events = []) {
  const candidates = new Map()

  const addCandidate = (value, kind, helper = '') => {
    const label = String(value ?? '').trim()
    const normalized = normalizeText(label)
    if (!normalized) return

    const key = normalized
    if (!candidates.has(key)) {
      candidates.set(key, {
        value: label,
        label,
        kind,
        helper,
      })
    }
  }

  const addKeyword = (keyword) => {
    const label = String(keyword ?? '').trim()
    const normalized = normalizeText(label)
    if (!normalized) return
    addCandidate(label, 'keyword')
    const expanded = expandSearchTerm(label)
    expanded.forEach((term) => addCandidate(term, 'keyword'))
  }

  events.forEach((event) => {
    addCandidate(event?.title, 'event', event?.hostClub ?? '')
    addCandidate(event?.hostClub, 'club', event?.location?.summary ?? '')
    addCandidate(event?.location?.summary, 'location', event?.hostClub ?? '')
    addCandidate(event?.type, 'type')
    ;(event?.tags ?? []).forEach((tag) => addCandidate(tag, 'tag'))
  })

  INTERESTS.forEach((interest) => {
    addCandidate(interest.label, 'interest')
    interest.keywords.forEach(addKeyword)
  })

  return [...candidates.values()]
}

export function buildTitleSuggestions(titleIndex = [], query, limit = 8) {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return []

  const scored = []

  for (const item of titleIndex) {
    const title = item?.title ?? ''
    const normalizedTitle = item?.normalizedTitle ?? normalizeText(title)
    if (!normalizedTitle) continue

    let score = 0
    if (normalizedTitle === normalizedQuery) {
      score = 100
    } else if (normalizedTitle.startsWith(normalizedQuery)) {
      score = 90
    } else if (normalizedTitle.includes(normalizedQuery)) {
      score = 70
    } else {
      continue
    }

    scored.push({
      value: title,
      label: title,
      kind: 'event',
      helper: item?.helper ?? '',
      score,
    })
  }

  return scored
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.label.localeCompare(b.label)
    })
    .slice(0, limit)
}

export function buildSearchSuggestions(events = [], query, limit = 8) {
  const normalizedQuery = normalizeText(query)
  if (!normalizedQuery) return []

  const candidates = new Map()

  const addCandidate = (candidate, score) => {
    const label = String(candidate?.label ?? candidate?.value ?? '').trim()
    const normalizedLabel = normalizeText(label)
    if (!normalizedLabel) return

    const existing = candidates.get(normalizedLabel)
    if (!existing || score > existing.score) {
      candidates.set(normalizedLabel, {
        value: candidate?.value ?? label,
        label,
        kind: candidate?.kind ?? 'suggestion',
        helper: candidate?.helper ?? '',
        score,
      })
    }
  }

  const titleSuggestions = buildTitleSuggestions(
    events.map((event) => ({
      title: event?.title ?? '',
      helper: event?.hostClub ?? '',
    })),
    normalizedQuery,
    limit
  )

  titleSuggestions.forEach((candidate) => addCandidate(candidate, candidate.score))

  collectSuggestionCandidates(events).forEach((candidate) => {
    const labelScore = scoreSearchQuery(normalizedQuery, candidate.label)
    if (labelScore > 0) {
      addCandidate(candidate, labelScore)
    }
  })

  return [...candidates.values()]
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.label.localeCompare(b.label)
    })
    .slice(0, limit)
}

export function buildEventSearchSummary(event) {
  return collectEventSearchTerms(event)
}
