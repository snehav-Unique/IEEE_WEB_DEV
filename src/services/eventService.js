import { normalizeEvent } from '../utils/normalizeEvent'

/**
 * Loads and normalizes the events dataset at runtime.
 *
 * The source can be a remote URL or a runtime-served local path. The JSON is
 * never imported or bundled, and the original file is left untouched.
 *
 * Returns an array of NormalizedEvent objects.
 * Throws on network/parse failure so callers can show an error state.
 */
export async function fetchEvents() {
  const source = import.meta.env.VITE_DATA_SOURCE?.trim() || '/events.json'

  const resolvedSource = source.startsWith('http')
    ? source
    : source.startsWith('/')
      ? source
      : `/${source}`

  const response = await fetch(resolvedSource)

  if (!response.ok) {
    throw new Error(
      `Failed to load events: ${response.status} ${response.statusText} (source: ${resolvedSource})`
    )
  }

  let raw
  try {
    raw = await response.json()
  } catch (err) {
    throw new Error(`Could not parse events JSON: ${err.message}`)
  }

  if (!Array.isArray(raw)) {
    throw new Error('Expected an array of events but got: ' + typeof raw)
  }

  // Normalize each event; drop nulls (events too incomplete to display)
  const events = raw
    .map((item) => {
      try {
        return normalizeEvent(item)
      } catch {
        return null
      }
    })
    .filter(Boolean)

  return events
}

/**
 * Finds a single normalized event by its ID.
 * Returns the event or null.
 */
export function findEventById(events, id) {
  if (!id || !Array.isArray(events)) return null
  return events.find((e) => e.id === id) ?? null
}
