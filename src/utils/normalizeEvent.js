import { parseEventDate } from './parseEventDate'
import { normalizeTags } from './normalizeTags'

/**
 * Validates an email string.
 * Rejects known placeholders, double-@@ typos, and bare domain strings.
 */
function parseEmail(raw) {
  if (!raw || typeof raw !== 'string') return null
  const s = raw.trim()
  const placeholders = ['—', '-', 'ask organizer', 'none', 'n/a', '']
  if (placeholders.includes(s.toLowerCase())) return null

  // Must have exactly one @ with characters on both sides, and a dot in domain
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(s)) return null

  return s
}

/**
 * Extracts safe {lat, lng} coordinates from the four shapes observed:
 *   1. { latitude, longitude } object
 *   2. [ lat, lng ] array
 *   3. string — discard (can't reliably parse)
 *   4. null — discard
 */
function parseCoordinates(raw) {
  if (!raw) return null

  if (typeof raw === 'object' && !Array.isArray(raw)) {
    const lat = parseFloat(raw.latitude)
    const lng = parseFloat(raw.longitude)
    if (isFinite(lat) && isFinite(lng)) return { lat, lng }
    return null
  }

  if (Array.isArray(raw) && raw.length >= 2) {
    const lat = parseFloat(raw[0])
    const lng = parseFloat(raw[1])
    if (isFinite(lat) && isFinite(lng)) return { lat, lng }
    return null
  }

  return null
}

/**
 * Builds a human-readable location summary string.
 */
function buildLocationSummary(building, roomNumber, floor) {
  const parts = []

  if (building && building.trim() !== '' && building.trim().toLowerCase() !== 'tbd') {
    parts.push(building.trim())
  }

  if (roomNumber !== null && roomNumber !== undefined && String(roomNumber).trim() !== '') {
    parts.push(`Room ${roomNumber}`)
  }

  if (floor !== null && floor !== undefined) {
    parts.push(`Floor ${floor}`)
  }

  return parts.length > 0 ? parts.join(', ') : 'Location TBA'
}

/**
 * Extracts instagram/linkedin from the four shapes:
 *   1. { instagram, linkedin } dict
 *   2. [ "@handle" ] array
 *   3. "@handle" string
 *   4. null
 */
function parseSocials(raw) {
  const empty = { instagram: null, linkedin: null }
  if (!raw) return empty

  if (typeof raw === 'string') {
    const s = raw.trim()
    return { instagram: s.startsWith('@') ? s : null, linkedin: null }
  }

  if (Array.isArray(raw)) {
    const first = raw.find((x) => typeof x === 'string' && x.trim().startsWith('@'))
    return { instagram: first ? first.trim() : null, linkedin: null }
  }

  if (typeof raw === 'object') {
    const ig = typeof raw.instagram === 'string' && raw.instagram.trim() !== ''
      ? raw.instagram.trim()
      : null
    const li = typeof raw.linkedin === 'string' && raw.linkedin.trim() !== ''
      ? raw.linkedin.trim()
      : null
    return { instagram: ig, linkedin: li }
  }

  return empty
}

/**
 * Converts a raw event object from the dataset into a safe NormalizedEvent.
 * Returns null if the event is too incomplete to display.
 */
export function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null

  const id = typeof raw.id === 'string' ? raw.id : null
  if (!id) return null

  const title = (raw.title && raw.title.trim()) || 'Untitled Event'
  const hostClub = (raw.host_club && raw.host_club.trim()) || 'Unknown Organizer'
  const description = (raw.description && raw.description.trim()) || 'No description available.'

  const startTime = parseEventDate(raw.start_time)
  const endTime = parseEventDate(raw.end_time)

  const isCancelled = raw.is_cancelled === true
  const requiresTicket = raw.requires_ticket === true

  // Location
  const loc = raw.location && typeof raw.location === 'object' ? raw.location : {}
  const building = typeof loc.building === 'string' ? loc.building : null
  const roomNumber = loc.room_number !== undefined && loc.room_number !== null
    ? String(loc.room_number)
    : null
  const floor = typeof loc.floor === 'number' ? loc.floor : null
  const coordinates = parseCoordinates(loc.map_coordinates)
  const locationSummary = buildLocationSummary(building, roomNumber, floor)

  // Tags
  const tags = normalizeTags(raw.tags)

  // Contact
  const contactEmail = parseEmail(raw.contact_email)

  // Socials
  const socials = parseSocials(raw.organizer_socials)

  // Capacity
  const currentReg = typeof raw.current_registrations === 'number' ? raw.current_registrations : null
  const maxCap = typeof raw.max_capacity === 'number' ? raw.max_capacity : null
  const isFull = currentReg !== null && maxCap !== null && currentReg >= maxCap

  const createdAt = parseEventDate(raw.created_at)

  return {
    id,
    title,
    hostClub,
    description,
    startTime,
    endTime,
    isCancelled,
    requiresTicket,
    location: {
      summary: locationSummary,
      building,
      roomNumber,
      floor,
      coordinates,
    },
    tags,
    contactEmail,
    socials,
    capacity: {
      current: currentReg,
      max: maxCap,
      isFull,
    },
    createdAt,
  }
}
