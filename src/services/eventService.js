import { normalizeEvent } from '../utils/normalizeEvent'

/**
 * Loads and normalizes the events dataset.
 *
 * Reads VITE_DATA_SOURCE at runtime:
 *   - If it looks like a URL (starts with http:// or https://), fetch from network.
 *   - Otherwise treat as a local path (e.g. /events.json served from /public).
 *
 * In both cases, the raw JSON is fetched via the native fetch API and then
 * run through the normalization pipeline. The source file is never modified.
 *
 * Returns an array of NormalizedEvent objects.
 * Throws on network/parse failure so callers can show an error state.
 */
export async function fetchEvents() {
  const source = import.meta.env.VITE_DATA_SOURCE

  if (!source) {
    throw new Error(
      'VITE_DATA_SOURCE is not set. Add it to your .env file. ' +
        'It should be a URL or a path like /events.json.'
    )
  }

  const response = await fetch(source)

  if (!response.ok) {
    throw new Error(
      `Failed to load events: ${response.status} ${response.statusText} (source: ${source})`
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
