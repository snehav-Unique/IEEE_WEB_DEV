import { normalizeEvent } from './normalizeEvent'

/**
 * Dual-mode data loader.
 * VITE_DATA_SOURCE = "events.json"          → fetch /events.json (served from public/)
 * VITE_DATA_SOURCE = "https://..."          → fetch remote URL
 */
export async function loadEvents() {
  const src = import.meta.env.VITE_DATA_SOURCE
  if (!src) throw new Error('VITE_DATA_SOURCE is not set')

  const url = src.startsWith('http') ? src : `/${src}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load events: ${res.status} ${res.statusText}`)

  const data = await res.json()
  const raw = Array.isArray(data) ? data : (data.events ?? [])

  return raw
    .map(normalizeEvent)
    .filter(Boolean)
    .filter((e) => e.title !== 'Untitled Event' || e.startTime)
}
