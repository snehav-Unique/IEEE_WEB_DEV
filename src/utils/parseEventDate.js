import dayjs from 'dayjs'

/**
 * Parses a raw start_time / end_time value into a dayjs object or null.
 *
 * The dataset contains three formats:
 *   1. Unix millisecond timestamp (integer)
 *   2. ISO 8601 string
 *   3. null / undefined / invalid
 *
 * Returns a valid dayjs instance, or null if the value cannot be parsed.
 */
export function parseEventDate(raw) {
  if (raw === null || raw === undefined) return null

  // Unix ms timestamp (integer)
  if (typeof raw === 'number') {
    const d = dayjs(raw)
    return d.isValid() ? d : null
  }

  // ISO string
  if (typeof raw === 'string' && raw.trim() !== '') {
    const d = dayjs(raw)
    return d.isValid() ? d : null
  }

  return null
}

/**
 * Formats a dayjs date for display.
 * Returns "Date TBA" if date is null.
 */
export function formatDate(dayjsDate) {
  if (!dayjsDate) return 'Date TBA'
  return dayjsDate.format('ddd, MMM D YYYY')
}

/**
 * Formats a dayjs date with time for display.
 * Returns "Date TBA" if date is null.
 */
export function formatDateTime(dayjsDate) {
  if (!dayjsDate) return 'Date TBA'
  return dayjsDate.format('ddd, MMM D YYYY · h:mm A')
}

/**
 * Formats a time-only string from a dayjs date.
 */
export function formatTime(dayjsDate) {
  if (!dayjsDate) return null
  return dayjsDate.format('h:mm A')
}

/**
 * Builds a human-readable date range string.
 * e.g. "Mon, Oct 4 2026 · 5:05 PM – 6:05 PM"
 * Falls back gracefully if end is missing.
 */
export function formatDateRange(startDayjs, endDayjs) {
  if (!startDayjs) return 'Date TBA'

  const dateStr = startDayjs.format('ddd, MMM D YYYY')
  const startTime = startDayjs.format('h:mm A')

  if (!endDayjs) return `${dateStr} · ${startTime}`

  // If same day, show one date with a time range
  if (startDayjs.isSame(endDayjs, 'day')) {
    const endTime = endDayjs.format('h:mm A')
    return `${dateStr} · ${startTime} – ${endTime}`
  }

  // Different days
  return `${startDayjs.format('MMM D')} – ${endDayjs.format('MMM D, YYYY')}`
}
