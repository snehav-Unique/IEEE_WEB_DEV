import { normalizeEvent } from './normalizeEvent'

/**
 * Dual-mode data loader.
 * Supports:
 *   1. Network URL starting with 'http' or 'https'
 *   2. File path (e.g., '../events.json' or 'events.json') resolved at runtime.
 */
export async function loadEvents() {
  const src = import.meta.env.VITE_DATA_SOURCE
  if (!src) throw new Error('VITE_DATA_SOURCE is not set')

  // Handle absolute URL vs local paths (e.g., ../events.json, events.json)
  const url = src.startsWith('http') 
    ? src 
    : (src.startsWith('..') ? src : `/${src}`);

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load events: ${res.status} ${res.statusText}`)

  const data = await res.json()
  const raw = Array.isArray(data) ? data : (data.events ?? [])

  return raw
    .map(normalizeEvent)
    .filter(Boolean)
    .filter((e) => e.title !== 'Untitled Event' || e.startTime)
}
