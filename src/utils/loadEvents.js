import { normalizeEvent } from './normalizeEvent'

/**
 * Runtime-only data loader.
 * Supports:
 *   1. Network URL starting with 'http' or 'https'
 *   2. Local runtime path served from /public (e.g. /events.json)
 *
 * No JSON is imported into the bundle; everything is fetched at runtime.
 */
export async function loadEvents() {
  const src = import.meta.env.VITE_DATA_SOURCE?.trim() || '/events.json'

  // Handle absolute URL vs runtime-served local path.
  const url = src.startsWith('http')
    ? src
    : src.startsWith('/')
      ? src
      : src.startsWith('..')
        ? src
        : `/${src}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load events: ${res.status} ${res.statusText}`)

  const data = await res.json()
  const raw = Array.isArray(data) ? data : (data.events ?? [])

  return raw
    .map(normalizeEvent)
    .filter(Boolean)
    .filter((e) => e.title !== 'Untitled Event' || e.startTime)
}
