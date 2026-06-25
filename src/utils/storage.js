const STORAGE_KEY = 'campus_events_bookmarks'

/**
 * Reads the set of bookmarked event IDs from localStorage.
 * Returns a Set<string>.
 */
export function loadBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return new Set()
    return new Set(parsed)
  } catch {
    return new Set()
  }
}

/**
 * Persists a Set<string> of event IDs to localStorage.
 */
export function saveBookmarks(bookmarkSet) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarkSet]))
  } catch {
    // localStorage may be unavailable (private browsing, storage full)
    console.warn('Could not save bookmarks to localStorage.')
  }
}

/**
 * Adds an event ID to the persisted bookmarks.
 * Returns the updated Set.
 */
export function addBookmark(id) {
  const current = loadBookmarks()
  current.add(id)
  saveBookmarks(current)
  return current
}

/**
 * Removes an event ID from the persisted bookmarks.
 * Returns the updated Set.
 */
export function removeBookmark(id) {
  const current = loadBookmarks()
  current.delete(id)
  saveBookmarks(current)
  return current
}

/**
 * Checks if an event ID is bookmarked.
 */
export function isBookmarked(id) {
  return loadBookmarks().has(id)
}
