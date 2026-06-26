import React, { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import dayjs from 'dayjs'
import gsap from 'gsap'
import { useEvents } from '../context/EventsContext'
import BookmarkButton from '../components/BookmarkButton'

export default function EventDetailPage() {
  const { id } = useParams()
  const { events, loading, bookmarkedIds, toggleBookmark } = useEvents()
  const [imgError, setImgError] = useState(false)
  const containerRef = useRef(null)

  const event = events.find((e) => e.id === id)

  useEffect(() => {
    if (!event) return
    localStorage.setItem('lastViewedEventId', event.id)
    
    if (!containerRef.current) return
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 32 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
    )
  }, [event])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-panel rounded-xl w-3/4 mx-auto" />
          <div className="h-4 bg-panel rounded w-1/2 mx-auto" />
          <div className="h-48 bg-panel rounded-2xl mt-8" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4">
        <div className="text-5xl">🔎</div>
        <h1 className="font-display font-semibold text-2xl text-ink">Event not found</h1>
        <p className="text-ink-dim text-sm">This event may have been removed or the link is incorrect.</p>
        <Link to="/events" className="inline-block mt-4 px-6 py-2 rounded-xl bg-accent text-white text-sm hover:bg-accent/80 transition-colors">
          ← Back to Events
        </Link>
      </div>
    )
  }

  const start = event.startTime ? dayjs(event.startTime) : null
  const end = event.endTime ? dayjs(event.endTime) : null
  const dateDisplay = start?.isValid()
    ? start.isSame(end, 'day')
      ? `${start.format('MMMM D, YYYY')} · ${start.format('h:mm A')} – ${end?.format('h:mm A') ?? ''}`
      : `${start.format('MMM D, YYYY h:mm A')} – ${end?.format('MMM D, YYYY h:mm A') ?? ''}`
    : 'Date TBA'

  return (
    <div ref={containerRef} className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Back link */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Events
      </Link>

      {/* Hero image */}
      {event.imageUrl && !imgError && (
        <img
          src={event.imageUrl}
          alt={event.title}
          onError={() => setImgError(true)}
          className="w-full h-56 object-cover rounded-2xl mb-8 border border-border"
        />
      )}

      {/* Cancelled banner */}
      {event.isCancelled && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          This event has been cancelled.
        </div>
      )}

      {/* Type badge */}
      {event.type && (
        <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20 capitalize">
          {event.type}
        </span>
      )}

      {/* Title + Bookmark */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="font-display font-bold text-3xl text-ink leading-tight">{event.title}</h1>
        <div className="shrink-0 mt-1">
          <BookmarkButton
            isBookmarked={bookmarkedIds.has(event.id)}
            onToggle={() => toggleBookmark(event.id)}
          />
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-5 rounded-2xl bg-panel border border-border">
        <MetaItem icon="📅" label="Date & Time" value={dateDisplay} />
        {event.location?.summary && (
          <MetaItem icon="📍" label="Location" value={event.location.summary} />
        )}
        {event.hostClub && (
          <MetaItem icon="🏛️" label="Organiser" value={event.hostClub} />
        )}
        {event.capacity?.max && (
          <MetaItem
            icon="👥"
            label="Capacity"
            value={
              event.capacity.isFull
                ? `${event.capacity.max} (Registration Full)`
                : `${event.capacity.current ?? 0} / ${event.capacity.max}`
            }
          />
        )}
        {event.contactEmail && (
          <MetaItem icon="✉️" label="Contact" value={event.contactEmail} />
        )}
        {event.requiresTicket && (
          <MetaItem icon="🎟️" label="Ticket" value="Required" />
        )}
      </div>

      {/* Description */}
      {event.description && (
        <section className="mb-8">
          <h2 className="font-display font-semibold text-lg text-ink mb-3">About</h2>
          <p className="text-ink-dim text-sm leading-relaxed whitespace-pre-line">{event.description}</p>
        </section>
      )}

      {/* Tags */}
      {event.tags?.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-lg text-ink mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-subtle text-ink-dim border border-border"
              >
                #{tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function MetaItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg leading-none mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-ink-dim font-medium mb-0.5">{label}</p>
        <p className="text-sm text-ink">{value}</p>
      </div>
    </div>
  )
}
