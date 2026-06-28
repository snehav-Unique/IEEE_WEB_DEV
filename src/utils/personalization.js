const STORAGE_KEY = 'campus_events_personalization_v1'

export const INTERESTS = [
  {
    id: 'ai-ml',
    label: 'AI & Machine Learning',
    emoji: '🤖',
    keywords: ['ai', 'machine learning', 'ml', 'artificial intelligence', 'deep learning', 'neural network'],
  },
  {
    id: 'programming-dsa',
    label: 'Programming & DSA',
    emoji: '💻',
    keywords: ['programming', 'data structures', 'algorithms', 'competitive programming', 'coding', 'python for beginners', 'system design'],
  },
  {
    id: 'web-development',
    label: 'Web Development',
    emoji: '🌐',
    keywords: ['web development', 'web dev', 'react', 'next.js', 'ui/ux', 'frontend', 'front end', 'rest apis', 'javascript'],
  },
  {
    id: 'cloud-devops',
    label: 'Cloud Computing & DevOps',
    emoji: '☁️',
    keywords: ['cloud computing', 'devops', 'aws', 'docker', 'kubernetes', 'ci/cd', 'cloud'],
  },
  {
    id: 'robotics-iot-embedded',
    label: 'Robotics, IoT & Embedded Systems',
    emoji: '🤖',
    keywords: ['robotics', 'iot', 'embedded systems', 'automation', 'arduino', 'sensors'],
  },
  {
    id: 'cybersecurity',
    label: 'Cybersecurity',
    emoji: '🔐',
    keywords: ['cybersecurity', 'security', 'network security', 'ethical hacking', 'cryptography', 'malware'],
  },
  {
    id: 'game-development',
    label: 'Game Development',
    emoji: '🎮',
    keywords: ['game development', 'game dev', 'gaming', 'unity', 'unreal', 'game design'],
  },
  {
    id: 'entrepreneurship-career',
    label: 'Entrepreneurship & Career',
    emoji: '🚀',
    keywords: ['entrepreneurship', 'career prep', 'placement', 'career fair', 'startup', 'internship', 'networking'],
  },
  {
    id: 'finance',
    label: 'Finance',
    emoji: '💰',
    keywords: ['finance', 'financial', 'investment', 'trading', 'stock market', 'portfolio'],
  },
  {
    id: 'blockchain',
    label: 'Blockchain',
    emoji: '⛓️',
    keywords: ['blockchain', 'web3', 'crypto', 'smart contract', 'ethereum', 'defi'],
  },
]

const INTEREST_BY_ID = new Map(INTERESTS.map((interest) => [interest.id, interest]))

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function includesAny(haystack, needles) {
  if (!haystack) return false
  return needles.some((needle) => {
    const normalizedNeedle = normalizeText(needle)
    return normalizedNeedle && haystack.includes(normalizedNeedle)
  })
}

function safeReadPreferences() {
  if (typeof window === 'undefined') {
    return { interests: [], seen: false, skipped: false }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { interests: [], seen: false, skipped: false }

    const parsed = JSON.parse(raw)
    const interests = Array.isArray(parsed?.interests)
      ? parsed.interests.filter((id) => INTEREST_BY_ID.has(id))
      : []

    return {
      interests,
      seen: parsed?.seen === true,
      skipped: parsed?.skipped === true,
    }
  } catch {
    return { interests: [], seen: false, skipped: false }
  }
}

export function loadPersonalizationPreferences() {
  return safeReadPreferences()
}

export function savePersonalizationPreferences(preferences) {
  if (typeof window === 'undefined') return

  try {
    const interests = Array.isArray(preferences?.interests)
      ? preferences.interests.filter((id) => INTEREST_BY_ID.has(id))
      : []

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        interests,
        seen: preferences?.seen === true,
        skipped: preferences?.skipped === true,
      })
    )
  } catch {
    console.warn('Could not save personalization preferences to localStorage.')
  }
}

export function clearPersonalizationPreferences() {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    console.warn('Could not clear personalization preferences from localStorage.')
  }
}

export function getInterestById(id) {
  return INTEREST_BY_ID.get(id) ?? null
}

export function scoreEventForInterests(event, selectedInterestIds = []) {
  const selected = selectedInterestIds
    .map((id) => getInterestById(id))
    .filter(Boolean)

  const title = normalizeText(event?.title)
  const description = normalizeText(event?.description)
  const hostClub = normalizeText(event?.hostClub)
  const tags = Array.isArray(event?.tags)
    ? event.tags.map((tag) => normalizeText(tag)).filter(Boolean)
    : []

  let score = 0
  const matchedInterests = []

  for (const interest of selected) {
    const categoryMatch = includesAny(`${title} ${hostClub}`, interest.keywords)
    const tagMatch = tags.some((tag) => includesAny(tag, interest.keywords))
    const titleMatch = includesAny(title, interest.keywords)
    const descriptionMatch = includesAny(description, interest.keywords)

    const matched = categoryMatch || tagMatch || titleMatch || descriptionMatch
    if (!matched) continue

    if (categoryMatch) score += 8
    if (tagMatch) score += 6
    if (titleMatch) score += 5
    if (descriptionMatch) score += 3

    matchedInterests.push({
      id: interest.id,
      label: interest.label,
      emoji: interest.emoji,
      categoryMatch,
      tagMatch,
      titleMatch,
      descriptionMatch,
    })
  }

  if (matchedInterests.length > 1) {
    score += 2
  }

  return {
    score,
    matchedInterests,
  }
}
