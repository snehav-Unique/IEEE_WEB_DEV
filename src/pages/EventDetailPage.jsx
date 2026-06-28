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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white rounded-xl w-3/4 mx-auto border border-border" />
          <div className="h-4 bg-white rounded w-1/2 mx-auto border border-border" />
          <div className="h-48 bg-white rounded-2xl mt-8 border border-border" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-[1.75rem] border border-border bg-white/92 p-8 text-center space-y-4 shadow-sm">
          <div className="text-5xl">🔎</div>
          <h1 className="font-display font-semibold text-2xl text-ink">Event not found</h1>
          <p className="text-[#5f4453] text-sm">This event may have been removed or the link is incorrect.</p>
          <Link
            to="/events"
            className="inline-block mt-4 px-6 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-dim transition-colors"
          >
            ← Back to Events
          </Link>
        </div>
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
    <div ref={containerRef} className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm text-ink-dim hover:text-ink transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Events
        </Link>
      </div>

      <section className="rounded-[1.75rem] border border-border bg-white/92 overflow-hidden shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
          <div className="p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-[#9f3868] font-semibold">
                Event Details
              </span>
              {event.type && (
                <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[#fff1f7] text-[#9f3868] border border-border">
                  {event.type}
                </span>
              )}
            </div>

            <div className="flex items-start justify-between gap-4">
              <h1 className="font-display font-bold text-3xl text-ink leading-tight">{event.title}</h1>
              <div className="shrink-0 mt-1">
                <BookmarkButton
                  isBookmarked={bookmarkedIds.has(event.id)}
                  onToggle={() => toggleBookmark(event.id)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#5f4453]">
              {event.hostClub && <DetailLine label="Organizer" value={event.hostClub} />}
              {event.location?.summary && <DetailLine label="Location" value={event.location.summary} />}
              {event.startTime?.isValid?.() && (
                <DetailLine label="Starts" value={event.startTime.format('ddd, MMM D • h:mm A')} />
              )}
              {event.capacity?.max != null && (
                <DetailLine
                  label="Capacity"
                  value={
                    event.capacity.isFull
                      ? `${event.capacity.max} full`
                      : `${event.capacity.current ?? 0} / ${event.capacity.max}`
                  }
                />
              )}
              {event.contactEmail && <DetailLine label="Contact" value={event.contactEmail} />}
              {event.requiresTicket && <DetailLine label="Ticket" value="Required" />}
            </div>

            {event.description && (
              <p className="text-sm sm:text-base leading-relaxed text-[#5f4453]">
                {event.description}
              </p>
            )}

            {event.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#fff1f7] text-[#7d4d67] border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 border-t lg:border-t-0 lg:border-l border-border/70 bg-[#fff8fb] flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl border border-border bg-white p-5 shadow-sm">
              {event.imageUrl && !imgError ? (
                <img
                  src={event.imageUrl}
                  alt={event.title}
                  onError={() => setImgError(true)}
                  className="w-full h-56 object-cover rounded-2xl mb-5 border border-border"
                />
              ) : null}

              {event.isCancelled && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm font-medium">
                  This event has been cancelled.
                </div>
              )}

              <p className="text-[11px] uppercase tracking-[0.2em] text-[#9f3868] mb-2">
                Quick actions
              </p>
              <div className="space-y-3 text-sm text-[#5f4453]">
                <p>Bookmark this event to keep it in your shortlist.</p>
                <p>Use the search suggestions to jump straight to keywords like free food or workshop.</p>
                <p>{dateDisplay}</p>
              </div>
              <div className="mt-5">
                <button
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-ink hover:border-accent/30 hover:text-accent transition-colors"
                  onClick={() => toggleBookmark(event.id)}
                >
                  {bookmarkedIds.has(event.id) ? 'Remove Bookmark' : 'Bookmark Event'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function DetailLine({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <span className="min-w-[72px] text-[11px] uppercase tracking-[0.16em] text-ink-dim/80 pt-0.5">
        {label}
      </span>
      <span className="text-ink">{value}</span>
    </div>
  )
}
