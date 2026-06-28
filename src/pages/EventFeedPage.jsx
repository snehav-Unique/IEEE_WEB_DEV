import React, { useEffect, useMemo, useRef, useState, useCallback, useDeferredValue } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import { useEvents } from '../context/EventsContext'
import SearchBar from '../components/SearchBar'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import ErrorState from '../components/ErrorState'
import CampusPulse from '../components/CampusPulse'
import ScrollStack from '../components/ScrollStack/ScrollStack'
import StackEventCard from '../components/StackEventCard'
import PersonalizationModal from '../components/PersonalizationModal'
import {
  buildEventSearchSummary,
  buildSearchSuggestions,
  scoreSearchQuery,
} from '../utils/searchRanking'
import {
  INTERESTS,
  clearPersonalizationPreferences,
  loadPersonalizationPreferences,
  savePersonalizationPreferences,
  scoreEventForInterests,
} from '../utils/personalization'

dayjs.extend(isBetween)

const PAGE_SIZE = 12
const RECOMMENDED_LIMIT = 6

export default function EventFeedPage() {
  const { id: urlEventId } = useParams()
  const navigate = useNavigate()
  const { events, loading, error, bookmarkedIds, toggleBookmark } = useEvents()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({ type: '', dateRange: 'all' })
  const [page, setPage] = useState(1)
  // Track which event is expanded inline
  const [expandedEventId, setExpandedEventId] = useState(urlEventId ?? null)
  const detailRefs = useRef({})
  const browseRef = useRef(null)

  // committedQuery is set only on explicit Search/Enter — scoring never runs on raw typing
  const [committedQuery, setCommittedQuery] = useState('')
  const deferredQuery = useDeferredValue(committedQuery)
  const isStale = committedQuery !== deferredQuery

  // Spinner: true from commit until React finishes deferred render
  const [isSearching, setIsSearching] = useState(false)
  const scrollPendingRef = useRef(false)

  useEffect(() => {
    if (!isStale && isSearching) {
      setIsSearching(false)
      if (scrollPendingRef.current) {
        scrollPendingRef.current = false
        setTimeout(() => {
          browseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 80)
      }
    }
  }, [isStale, isSearching])

  const [personalization, setPersonalization] = useState(() => loadPersonalizationPreferences())
  const [showPersonalizationModal, setShowPersonalizationModal] = useState(() => !loadPersonalizationPreferences().seen)

  // Sync URL param → expanded state on initial load
  useEffect(() => {
    if (urlEventId) setExpandedEventId(urlEventId)
  }, [urlEventId])

  useEffect(() => {
    if (loading) return
    if (!personalization.seen && !showPersonalizationModal) {
      setShowPersonalizationModal(true)
    }
  }, [loading, personalization.seen, showPersonalizationModal])

  const selectedInterestIds = personalization.interests ?? []
  const selectedInterests = useMemo(
    () => INTERESTS.filter((interest) => selectedInterestIds.includes(interest.id)),
    [selectedInterestIds]
  )

  const eventTypes = useMemo(() => {
    const set = new Set()
    events.forEach((event) => { if (event.type) set.add(event.type) })
    return [...set].sort()
  }, [events])

  // Pre-compute search summaries once — avoids rebuilding per keystroke
  const summaryIndex = useMemo(
    () => events.map((event) => ({ event, summary: buildEventSearchSummary(event) })),
    [events]
  )

  const displayedEvents = useMemo(() => {
    const q = deferredQuery.toLowerCase().trim()
    const now = dayjs()

    const ranked = summaryIndex
      .map(({ event, summary }) => {
        const searchScore = q ? scoreSearchQuery(q, summary) : 0
        return { event, searchScore }
      })
      .filter(({ event, searchScore }) => {
        if (q && searchScore === 0) return false
        if (filters.type && event.type !== filters.type) return false
        if (filters.dateRange && filters.dateRange !== 'all') {
          const t = event.startTime ? dayjs(event.startTime) : null
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
      .sort((a, b) => {
        if (!q) return 0
        if (b.searchScore !== a.searchScore) return b.searchScore - a.searchScore
        return String(a.event.title ?? '').localeCompare(String(b.event.title ?? ''))
      })

    return ranked.map(({ event }) => event)
  }, [summaryIndex, deferredQuery, filters])

  const recommendedEvents = useMemo(() => {
    if (!selectedInterestIds.length) return []
    return events
      .map((event) => {
        const { score, matchedInterests } = scoreEventForInterests(event, selectedInterestIds)
        return {
          ...event,
          recommendationScore: score,
          recommendationBadges: matchedInterests.map((interest) => `${interest.emoji} ${interest.label}`),
        }
      })
      .filter((event) => event.recommendationScore > 0)
      .sort((a, b) => {
        if (b.recommendationScore !== a.recommendationScore) return b.recommendationScore - a.recommendationScore
        return String(a.title ?? '').localeCompare(String(b.title ?? ''))
      })
      .slice(0, RECOMMENDED_LIMIT)
  }, [events, selectedInterestIds])

  // Suggestions scan titles against live typing (cheap). Scoring only runs on committedQuery.
  const searchSuggestions = useMemo(() => buildSearchSuggestions(events, searchQuery, 8), [events, searchQuery])

  const visibleEvents = displayedEvents.slice(0, page * PAGE_SIZE)
  const hasMore = visibleEvents.length < displayedEvents.length
  const hasRecommendations = selectedInterestIds.length > 0 && recommendedEvents.length > 0
  const hasPersonalization = selectedInterestIds.length > 0

  // Typing: only update the display value — zero scoring cost
  const handleSearchChange = (value) => {
    setSearchQuery(value)
  }

  // Enter / Search button: commit the query and trigger scoring
  const handleSearchCommit = (value) => {
    const v = value ?? searchQuery
    setSearchQuery(v)
    setCommittedQuery(v)
    setPage(1)
    if (v.trim()) {
      setIsSearching(true)
      scrollPendingRef.current = true
    }
  }

  const handleSearchClear = () => {
    setSearchQuery('')
    setCommittedQuery('')
    setPage(1)
  }

  const handleFilterChange = (newFilters) => { setFilters(newFilters); setPage(1) }

  // Toggle inline expansion; update URL too so deep-links still work
  const handleCardClick = useCallback((eventId) => {
    const next = expandedEventId === eventId ? null : eventId
    setExpandedEventId(next)
    navigate(next ? `/event/${next}` : '/events', { replace: true })

    // Scroll to the detail panel after a short delay for render
    if (next) {
      setTimeout(() => {
        detailRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 50)
    }
  }, [expandedEventId, navigate])

  const handleContinuePersonalization = (nextInterestIds) => {
    const normalized = [...new Set(nextInterestIds.filter((id) => INTERESTS.some((interest) => interest.id === id)))]
    const nextPreferences = { interests: normalized, seen: true, skipped: normalized.length === 0 }
    savePersonalizationPreferences(nextPreferences)
    setPersonalization(nextPreferences)
    setShowPersonalizationModal(false)
  }

  const handleSkipPersonalization = () => {
    const nextPreferences = { interests: [], seen: true, skipped: true }
    savePersonalizationPreferences(nextPreferences)
    setPersonalization(nextPreferences)
    setShowPersonalizationModal(false)
  }

  const handleTogglePersonalization = (interestId) => {
    setPersonalization((current) => {
      const currentInterests = current.interests ?? []
      const nextInterests = currentInterests.includes(interestId)
        ? currentInterests.filter((id) => id !== interestId)
        : [...currentInterests, interestId]
      return { ...current, interests: nextInterests }
    })
  }

  const handleResetPersonalization = () => {
    clearPersonalizationPreferences()
    setPersonalization({ interests: [], seen: false, skipped: false })
    setShowPersonalizationModal(true)
  }

  if (error) return <ErrorState error={error} />

  return (
    <div className="w-full">
      <PersonalizationModal
        open={showPersonalizationModal}
        selectedInterestIds={personalization.interests ?? []}
        onToggleInterest={handleTogglePersonalization}
        onContinue={() => handleContinuePersonalization(personalization.interests ?? [])}
        onSkip={handleSkipPersonalization}
      />

      <div className="sticky top-4 z-50 px-4 sm:px-6 pt-4">
        <div className="mx-auto w-full max-w-5xl rounded-[1.75rem] border border-border bg-white/92 px-4 py-4 shadow-[0_18px_55px_rgba(232,111,164,0.08)] backdrop-blur-xl sm:px-5">
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onSearch={handleSearchCommit}
            onClear={handleSearchClear}
            suggestions={searchSuggestions}
            onSuggestionClick={(suggestion) => handleSearchCommit(suggestion)}
            isSearching={isSearching}
          />
        </div>
      </div>

      <CampusPulse events={events} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md pb-4 mb-8 border-b border-border/70">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            {!loading && (
              <FilterBar filters={filters} onFilterChange={handleFilterChange} eventTypes={eventTypes} />
            )}
            <button
              type="button"
              onClick={handleResetPersonalization}
              className="self-start lg:self-auto px-4 py-2 rounded-full border border-accent/30 bg-white text-accent-dim text-sm font-semibold hover:bg-[#fff1f7] hover:border-accent transition-colors"
            >
              {hasPersonalization ? 'Update Interests' : 'Personalize Recommendations'}
            </button>
          </div>
        </div>

        {!hasPersonalization && (
          <div className="mb-8 rounded-[1.75rem] border border-border bg-[#fff8fb] p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f3868]">Recommended Events</p>
                <h2 className="mt-1 font-display text-2xl font-bold text-ink">Turn on personalized recommendations</h2>
                <p className="mt-2 text-sm text-[#5f4453] max-w-2xl">
                  Pick a few interests to surface events that match what you like most, while keeping the full catalogue available below.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPersonalizationModal(true)}
                className="px-5 py-3 rounded-xl border border-accent bg-accent text-white font-semibold shadow-[0_10px_24px_rgba(232,111,164,0.24)] hover:bg-accent-dim transition-colors"
              >
                Choose interests
              </button>
            </div>
          </div>
        )}

        {hasRecommendations && (
          <section className="mb-12">
            <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f3868]">Tailored for you</p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">⭐ Recommended Events</h2>
                <p className="mt-1 text-sm text-ink-dim">
                  Based on {selectedInterests.map((i) => i.label).join(', ')}.
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetPersonalization}
                className="px-4 py-2 rounded-full border border-border bg-white text-ink-dim text-sm font-semibold hover:border-accent hover:text-accent transition-colors"
              >
                Reset preferences
              </button>
            </div>
            <div className="space-y-3">
              {recommendedEvents.map((event) => (
                <React.Fragment key={event.id}>
                  <div
                    className="cursor-pointer"
                    onClick={() => handleCardClick(event.id)}
                  >
                    <StackEventCard
                      event={event}
                      isBookmarked={bookmarkedIds.has(event.id)}
                      onBookmark={(e) => { e?.stopPropagation?.(); toggleBookmark(event.id) }}
                      onViewDetails={() => handleCardClick(event.id)}
                      isExpanded={expandedEventId === event.id}
                    />
                  </div>
                  {expandedEventId === event.id && (
                    <div
                      ref={(el) => { detailRefs.current[event.id] = el }}
                      className="rounded-3xl border border-accent/25 bg-white/95 backdrop-blur-md overflow-hidden shadow-[0_8px_40px_rgba(232,111,164,0.10)] animate-expand"
                    >
                      <InlineEventDetail
                        event={event}
                        isBookmarked={bookmarkedIds.has(event.id)}
                        onBookmark={() => toggleBookmark(event.id)}
                        onClose={() => handleCardClick(event.id)}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </section>
        )}

        {hasPersonalization && !hasRecommendations && !loading && (
          <section className="mb-12 rounded-[1.75rem] border border-border bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f3868]">Recommended Events</p>
            <h2 className="mt-1 font-display font-bold text-2xl text-ink">We are still learning your preferences</h2>
            <p className="mt-2 text-sm text-[#5f4453]">
              We could not find a strong match yet, but the full event feed is still available below. You can update your interests anytime.
            </p>
            <button
              type="button"
              onClick={handleResetPersonalization}
              className="mt-4 px-5 py-3 rounded-xl border border-accent bg-accent text-white font-semibold hover:bg-accent-dim transition-colors"
            >
              Update interests
            </button>
          </section>
        )}

        <section ref={browseRef} className="mb-4">
          <div className="flex items-end justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f3868]">Catalogue</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink">Browse All Events</h2>
            </div>
            <span className={`text-sm transition-opacity ${isStale ? 'opacity-40' : 'opacity-100'} text-ink-dim`}>
              {isStale ? 'Searching…' : `${displayedEvents.length.toLocaleString()} events`}
            </span>
          </div>
        </section>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-3xl border border-border bg-white animate-pulse h-64" />
            ))}
          </div>
        ) : displayedEvents.length === 0 ? (
          <EmptyState
            message="No events match your search"
            sub="Try a different keyword or remove some filters."
          />
        ) : (
          <>
            {/* Inline list — cards + detail panels interleaved */}
            <div className="space-y-3">
              {visibleEvents.map((event) => (
                <React.Fragment key={event.id}>
                  {/* Card — clicking anywhere on it toggles detail */}
                  <div
                    className="cursor-pointer"
                    onClick={() => handleCardClick(event.id)}
                  >
                    <StackEventCard
                      event={event}
                      isBookmarked={bookmarkedIds.has(event.id)}
                      onBookmark={(e) => {
                        e?.stopPropagation?.()
                        toggleBookmark(event.id)
                      }}
                      onViewDetails={() => handleCardClick(event.id)}
                      isExpanded={expandedEventId === event.id}
                    />
                  </div>

                  {/* Inline detail panel — shown immediately after the clicked card */}
                  {expandedEventId === event.id && (
                    <div
                      ref={(el) => { detailRefs.current[event.id] = el }}
                      className="rounded-3xl border border-accent/25 bg-white/95 backdrop-blur-md overflow-hidden shadow-[0_8px_40px_rgba(232,111,164,0.10)] animate-expand"
                    >
                      <InlineEventDetail
                        event={event}
                        isBookmarked={bookmarkedIds.has(event.id)}
                        onBookmark={() => toggleBookmark(event.id)}
                        onClose={() => handleCardClick(event.id)}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center relative z-20">
                <button
                  onClick={() => setPage((current) => current + 1)}
                  className="px-8 py-3 rounded-xl border border-border bg-white text-ink text-sm font-medium hover:border-accent hover:text-accent transition-all duration-300"
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

// ---------------------------------------------------------------------------
// Inline detail panel — renders right after the card in the list
// ---------------------------------------------------------------------------
function InlineEventDetail({ event, isBookmarked, onBookmark, onClose }) {
  const start = event.startTime ? dayjs(event.startTime) : null
  const end = event.endTime ? dayjs(event.endTime) : null
  const dateDisplay = start?.isValid()
    ? start.isSame(end, 'day')
      ? `${start.format('MMMM D, YYYY')} · ${start.format('h:mm A')}${end?.isValid() ? ` – ${end.format('h:mm A')}` : ''}`
      : `${start.format('MMM D, YYYY h:mm A')}${end?.isValid() ? ` – ${end.format('MMM D, YYYY h:mm A')}` : ''}`
    : 'Date TBA'

  return (
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
      {/* Left: details */}
      <div className="p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Event Details</span>
          {event.type && (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#fff1f7] text-accent-dim border border-border">
              {event.type}
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-ink leading-tight">
            {event.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-xs font-semibold px-3 py-2 rounded-lg border border-border bg-white text-ink-dim hover:text-accent hover:border-accent/30 transition-colors"
            aria-label="Close details"
          >
            ✕ Close
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-ink-dim">
          {event.hostClub && <DetailLine label="Organizer" value={event.hostClub} />}
          {event.location?.summary && <DetailLine label="Location" value={event.location.summary} />}
          <DetailLine label="When" value={dateDisplay} />
          {event.capacity?.max != null && (
            <DetailLine
              label="Capacity"
              value={
                event.capacity.isFull
                  ? `${event.capacity.max} · Full`
                  : `${event.capacity.current ?? 0} / ${event.capacity.max}`
              }
            />
          )}
          {event.contactEmail && <DetailLine label="Contact" value={event.contactEmail} />}
          {event.requiresTicket && <DetailLine label="Ticket" value="Required" />}
        </div>

        {event.description && (
          <p className="text-sm sm:text-base leading-relaxed text-ink-dim">{event.description}</p>
        )}

        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#fff1f7] text-accent-dim border border-border"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {event.isCancelled && (
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">
            This event has been cancelled.
          </div>
        )}
      </div>

      {/* Right: actions */}
      <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-border/70 bg-[#fff8fb] flex items-start justify-center pt-8">
        <div className="w-full max-w-xs rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">Quick actions</p>

          <button
            type="button"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink hover:border-accent/30 hover:text-accent transition-colors text-sm font-medium"
            onClick={onBookmark}
          >
            {isBookmarked ? '🔖 Remove Bookmark' : '🔖 Bookmark Event'}
          </button>

          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 rounded-xl bg-accent text-white text-sm font-semibold text-center hover:bg-accent-dim transition-colors shadow-[0_6px_20px_rgba(232,111,164,0.2)]"
            >
              Register →
            </a>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full px-4 py-2 rounded-xl border border-border bg-white text-ink-dim text-sm hover:border-accent/30 hover:text-accent transition-colors"
          >
            Collapse
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailLine({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="min-w-[72px] text-[11px] uppercase tracking-[0.16em] text-ink-dim/80 pt-0.5">{label}</span>
      <span className="text-ink">{value}</span>
    </div>
  )
}