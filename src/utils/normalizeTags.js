/**
 * Maps raw tag variants (case-insensitive) to a single canonical label.
 * The dataset has significant inconsistency: "Workshop", "workshop",
 * "Work Shop", "TECH", "Tech", "Technology", etc.
 */
const TAG_CANON_MAP = {
  // Workshop variants
  'workshop': 'Workshop',
  'work shop': 'Workshop',

  // Tech variants
  'tech': 'Tech',
  'technology': 'Tech',
  'technical': 'Tech',

  // Free food variants
  'freefood': 'Free Food',
  'free food': 'Free Food',

  // Networking variants
  'networking': 'Networking',
  'network': 'Networking',

  // Keep these as-is (already clean)
  'sports': 'Sports',
  'cultural': 'Cultural',
  'research': 'Research',
  'internship': 'Internship',
  'competitive': 'Competitive',
  'certificates': 'Certificates',
  'hybrid': 'Hybrid',
  'online': 'Online',
  'prizes': 'Prizes',
  'guest speaker': 'Guest Speaker',
  'beginner friendly': 'Beginner Friendly',
  'open to all': 'Open to All',
  'general': 'General',
}

/**
 * Normalizes a single raw tag string to its canonical label.
 * Falls back to title-casing if not in the map.
 */
function canonicalizeTag(raw) {
  if (!raw || typeof raw !== 'string') return null
  const key = raw.trim().toLowerCase()
  if (key === '') return null
  return TAG_CANON_MAP[key] ?? toTitleCase(raw.trim())
}

function toTitleCase(str) {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/**
 * Takes a raw tags value (array, null, or anything else) and returns
 * a clean, deduplicated array of canonical tag strings.
 */
export function normalizeTags(rawTags) {
  if (!Array.isArray(rawTags)) return []

  const seen = new Set()
  const result = []

  for (const tag of rawTags) {
    const canonical = canonicalizeTag(tag)
    if (!canonical) continue
    if (seen.has(canonical)) continue
    seen.add(canonical)
    result.push(canonical)
  }

  return result
}
