import React, { useCallback, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import { useEvents } from '../context/EventsContext'
import StackEventCard from '../components/StackEventCard'
import EmptyState from '../components/EmptyState'

export default function BookmarksPage() {
  const { events, loading, bookmarkedIds, toggleBookmark, clearBookmarks } = useEvents()
  const [expandedEventId, setExpandedEventId] = useState(null)
  const detailRefs = useRef({})

  const bookmarked = events.filter((event) => bookmarkedIds.has(event.id))

  useEffect(() => {
    if (expandedEventId && !bookmarkedIds.has(expandedEventId)) {
      setExpandedEventId(null)
    }
  }, [bookmarkedIds, expandedEventId])

  const handleCardClick = useCallback((eventId) => {
    const next = expandedEventId === eventId ? null : eventId
    setExpandedEventId(next)

    if (next) {
      setTimeout(() => {
        detailRefs.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 50)
    }
  }, [expandedEventId])

  const handleToggleBookmark = useCallback((eventId) => {
    toggleBookmark(eventId)
    setExpandedEventId((current) => (current === eventId ? null : current))
  }, [toggleBookmark])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-white rounded-xl w-48 border border-border" />
          <div className="space-y-6 mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-white border border-border" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <section className="mb-10 rounded-[1.75rem] border border-border bg-white/92 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9f3868]">Saved</p>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink">Bookmarks</h1>
            <p className="text-[#5f4453] text-sm mt-1">
              {bookmarked.length === 0
                ? 'No saved events yet'
                : `${bookmarked.length} saved event${bookmarked.length > 1 ? 's' : ''}`}
            </p>
          </div>

          {bookmarked.length > 0 && (
            <button
              onClick={clearBookmarks}
              className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-500 text-sm font-semibold hover:bg-red-500/10 transition-colors bg-white"
            >
              Clear All
            </button>
          )}
        </div>
      </section>

      {bookmarked.length === 0 ? (
        <EmptyState
          message="No bookmarks yet"
          sub="Go explore events and tap the bookmark icon to save them here!"
        />
      ) : (
        <div className="space-y-3">
          {bookmarked.map((event) => (
            <React.Fragment key={event.id}>
              <div
                className="cursor-pointer"
                onClick={() => handleCardClick(event.id)}
              >
                <StackEventCard
                  event={event}
                  isBookmarked={true}
                  onBookmark={(e) => {
                    e?.stopPropagation?.()
                    handleToggleBookmark(event.id)
                  }}
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
                    onBookmark={() => handleToggleBookmark(event.id)}
                    onClose={() => handleCardClick(event.id)}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  )
}

function InlineEventDetail({ event, isBookmarked, onBookmark, onClose }) {
  const start = event.startTime ? dayjs(event.startTime) : null
  const end = event.endTime ? dayjs(event.endTime) : null
  const dateDisplay = start?.isValid()
    ? start.isSame(end, 'day')
      ? `${start.format('MMMM D, YYYY')} - ${start.format('h:mm A')}${end?.isValid() ? ` to ${end.format('h:mm A')}` : ''}`
      : `${start.format('MMM D, YYYY h:mm A')}${end?.isValid() ? ` to ${end.format('MMM D, YYYY h:mm A')}` : ''}`
    : 'Date TBA'

  return (
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
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
            Close
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
                  ? `${event.capacity.max} - Full`
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

      <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-border/70 bg-[#fff8fb] flex items-start justify-center pt-8">
        <div className="w-full max-w-xs rounded-2xl border border-border bg-white p-5 shadow-sm space-y-4">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ink-dim">Quick actions</p>

          <button
            type="button"
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink hover:border-accent/30 hover:text-accent transition-colors text-sm font-medium"
            onClick={onBookmark}
          >
            {isBookmarked ? 'Remove Bookmark' : 'Bookmark Event'}
          </button>

          {event.registrationUrl && (
            <a
              href={event.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-4 py-3 rounded-xl bg-accent text-white text-sm font-semibold text-center hover:bg-accent-dim transition-colors shadow-[0_6px_20px_rgba(232,111,164,0.2)]"
            >
              Register
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
