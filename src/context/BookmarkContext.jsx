import { createContext, useContext, useState, useCallback } from 'react'
import { loadBookmarks, saveBookmarks } from '../utils/storage'

const BookmarkContext = createContext(null)

/**
 * Provides a shared bookmark state to the whole app.
 * Initialises from localStorage on mount.
 */
export function BookmarkProvider({ children }) {
  const [bookmarkedIds, setBookmarkedIds] = useState(() => loadBookmarks())

  const toggleBookmark = useCallback((id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      saveBookmarks(next)
      return next
    })
  }, [])

  const isBookmarked = useCallback(
    (id) => bookmarkedIds.has(id),
    [bookmarkedIds]
  )

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, toggleBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  )
}

export function useBookmarks() {
  const ctx = useContext(BookmarkContext)
  if (!ctx) throw new Error('useBookmarks must be used inside <BookmarkProvider>')
  return ctx
}
