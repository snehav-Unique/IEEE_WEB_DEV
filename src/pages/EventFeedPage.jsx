import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useEvents } from '../context/EventsContext'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import BlobCursor from '../components/BlobCursor/BlobCursor'
import ScrollStack from '../components/ScrollStack/ScrollStack'
import StackEventCard from '../components/StackEventCard'

dayjs.extend(isBetween)

const PAGE_SIZE = 12

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
    <div className="w-full">
      {/* Dynamic Proximity Liquid Sphere Hero Banner */}
      <div className="relative min-h-[48vh] flex flex-col items-center justify-center text-center overflow-hidden py-16 px-4 bg-obsidian border-b border-border/20">
        {/* Background ambient glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[90px] pointer-events-none z-0" />
        <div className="absolute top-[20%] left-[25%] w-[250px] h-[250px] bg-accent-glow/5 rounded-full blur-[80px] pointer-events-none z-0" />
        
        {/* Interactive Grid mask overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:48px_48px] bg-center [mask-image:radial-gradient(circle_at_center,white,transparent_80%)] pointer-events-none z-0" />

        <div className="relative z-10 flex flex-col items-center gap-8 max-w-4xl mx-auto w-full">
          {/* Liquid Orb containing BlobCursor */}
          <div className="flex justify-center items-center">
            <BlobCursor
              blobType="circle"
              fillColor="#7c6af7"
              trailCount={4}
              sizes={[110, 85, 65, 45]}
              innerSizes={[25, 20, 15, 10]}
              innerColor="rgba(255, 255, 255, 0.9)"
              opacities={[0.8, 0.75, 0.7, 0.65]}
              shadowColor="rgba(124, 106, 247, 0.4)"
              shadowBlur={20}
              useFilter={true}
              fastDuration={0.15}
              slowDuration={0.65}
              zIndex={10}
              proximityRadius={260}
            />
          </div>
          
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent-glow">
              RVCE Campus Events
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight text-gradient leading-tight">
              Organized Events Feed
            </h1>
            <p className="text-ink-dim text-sm sm:text-base max-w-xl leading-relaxed">
              Powering technical excellence, nurturing innovation, and building the engineering leaders of tomorrow. Scroll down to see the event stack.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Search + Filter sticky bar */}
        <div className="sticky top-20 z-30 bg-obsidian/90 backdrop-blur-md pb-4 mb-8 border-b border-border/10 space-y-3">
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
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-border bg-panel/50 animate-pulse h-64" />
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <EmptyState
            message="No events match your search"
            sub="Try a different keyword or remove some filters."
          />
        ) : (
          <>
            {/* ScrollStack Events */}
            <ScrollStack>
              {visibleEvents.map((event) => (
                <StackEventCard
                  key={event.id}
                  event={event}
                  isBookmarked={bookmarkedIds.has(event.id)}
                  onBookmark={() => toggleBookmark(event.id)}
                />
              ))}
            </ScrollStack>

            {hasMore && (
              <div className="mt-8 text-center relative z-20">
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-8 py-3 rounded-xl border border-border bg-panel text-ink text-sm
                             font-medium hover:border-accent hover:text-accent transition-all duration-300"
                >
                  Load more ({displayedEvents.length - visibleEvents.length} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
