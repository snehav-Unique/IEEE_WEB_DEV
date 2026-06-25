import { createContext, useContext, useEffect, useState } from 'react'
import { loadEvents } from '../utils/loadEvents'

const EventsContext = createContext(null)

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [bookmarkedIds, setBookmarkedIds] = useState(
    () => new Set(JSON.parse(localStorage.getItem('bookmarks') ?? '[]'))
  )

  useEffect(() => {
    loadEvents()
      .then(setEvents)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('bookmarks', JSON.stringify([...next]))
      return next
    })
  }

  const clearBookmarks = () => {
    localStorage.removeItem('bookmarks')
    setBookmarkedIds(new Set())
  }

  return (
    <EventsContext.Provider value={{ events, loading, error, bookmarkedIds, toggleBookmark, clearBookmarks }}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents must be used inside <EventsProvider>')
  return ctx
}
