import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useEvents } from '../context/EventsContext'
import EventCard from '../components/EventCard'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'

dayjs.extend(isBetween)

const PAGE_SIZE = 30

export default function EventFeedPage() {
  const { events, loading, error, bookmarkedIds, toggleBookmark } = useEvents()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ type: '', dateRange: 'all' })
  const [page, setPage] = useState(1)

  // Derive unique types from dataset at runtime — never hardcoded
  const eventTypes = useMemo(() => {
    const set = new Set()
    events.forEach((e) => { if (e.type) set.add(e.type) })
    return [...set].sort()
  }, [events])

  // Filter + search pipeline
  const displayedEvents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    const now = dayjs()

    return events.filter((e) => {
      // Search: title + description + location
      if (q) {
        const haystack = [
          e.title,
          e.description,
          e.location?.summary,
          e.hostClub,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }

      // Type filter
      if (filters.type && e.type !== filters.type) return false

      // Date range filter
      if (filters.dateRange && filters.dateRange !== 'all') {
        const t = e.startTime ? dayjs(e.startTime) : null
        if (!t || !t.isValid()) return false
        if (filters.dateRange === 'today') {
          if (!t.isSame(now, 'day')) return false
        } else if (filters.dateRange === 'week') {
          if (!t.isBetween(now.startOf('week'), now.endOf('week'), 'day', '[]')) return false
        } else if (filters.dateRange === 'month') {
          if (!t.isBetween(now.startOf('month'), now.endOf('month'), 'day', '[]')) return false
        }
      }

      return true
    })
  }, [events, searchQuery, filters])

  // Load more pagination
  const visibleEvents = displayedEvents.slice(0, page * PAGE_SIZE)
  const hasMore = visibleEvents.length < displayedEvents.length

  const handleSearchChange = (val) => { setSearchQuery(val); setPage(1) }
  const handleFilterChange = (newFilters) => { setFilters(newFilters); setPage(1) }

  if (error) return <ErrorState error={error} />

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-ink mb-1">Campus Events</h1>
        <p className="text-ink-dim text-sm">
          {loading ? 'Loading…' : `${displayedEvents.length.toLocaleString()} events`}
        </p>
      </div>

      {/* Search + Filter sticky bar */}
      <div className="sticky top-16 z-30 bg-obsidian/90 backdrop-blur-md pb-4 mb-6 space-y-3">
        <SearchBar value={searchQuery} onChange={handleSearchChange} />
        {!loading && (
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            eventTypes={eventTypes}
          />
        )}
      </div>

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-panel animate-pulse h-52" />
          ))}
        </div>
      ) : displayedEvents.length === 0 ? (
        <EmptyState
          message="No events match your search"
          sub="Try a different keyword or remove some filters."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                isBookmarked={bookmarkedIds.has(event.id)}
                onBookmark={() => toggleBookmark(event.id)}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="px-8 py-3 rounded-xl border border-border bg-panel text-ink text-sm
                           font-medium hover:border-accent hover:text-accent transition-all"
              >
                Load more ({displayedEvents.length - visibleEvents.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
