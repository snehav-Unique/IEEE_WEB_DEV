import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import gsap from 'gsap'
import BookmarkButton from './BookmarkButton'

/**
 * EventCard — displays a normalized event in the feed / bookmarks grid.
 * Props:
 *   - event: normalized event object
 *   - isBookmarked: boolean
 *   - onBookmark: () => void
 */
export default function EventCard({ event, isBookmarked, onBookmark }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
    )
  }, [])

  const start = event.startTime ? dayjs(event.startTime) : null
  const dateStr = start && start.isValid()
    ? start.format('MMM D, YYYY')
    : 'Date TBA'
  const timeStr = start && start.isValid()
    ? start.format('h:mm A')
    : ''

  return (
    <div ref={ref} className="group relative flex flex-col rounded-2xl border border-border bg-panel
                               hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5
                               transition-all duration-300 overflow-hidden">
      {/* Bookmark button */}
      <div className="absolute top-3 right-3 z-10">
        <BookmarkButton isBookmarked={isBookmarked} onToggle={onBookmark} />
      </div>

      <Link to={`/event/${event.id}`} className="flex flex-col flex-1 p-5 pr-12">
        {/* Type badge */}
        {event.type && (
          <span className="inline-block self-start mb-3 px-2.5 py-0.5 rounded-full text-xs font-medium
                           bg-accent/10 text-accent border border-accent/20 capitalize">
            {event.type}
          </span>
        )}

        {/* Title */}
        <h2 className="font-display font-semibold text-ink text-base leading-snug mb-2
                        group-hover:text-accent transition-colors line-clamp-2">
          {event.title}
        </h2>

        {/* Description */}
        {event.description && (
          <p className="text-ink-dim text-sm line-clamp-2 mb-4 flex-1">
            {event.description}
          </p>
        )}

        {/* Meta */}
        <div className="mt-auto space-y-1.5 text-xs text-ink-dim">
          {/* Date + time */}
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{dateStr}{timeStr ? ` · ${timeStr}` : ''}</span>
          </div>

          {/* Location */}
          {event.location?.summary && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{event.location.summary}</span>
            </div>
          )}

          {/* Host */}
          {event.hostClub && (
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{event.hostClub}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {event.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-subtle text-ink-dim border border-border">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      {/* Cancelled banner */}
      {event.isCancelled && (
        <div className="bg-red-500/10 border-t border-red-500/20 px-5 py-1.5 text-xs text-red-400 font-medium">
          ✕ Cancelled
        </div>
      )}

      {/* Full badge */}
      {event.capacity?.isFull && !event.isCancelled && (
        <div className="bg-yellow-500/10 border-t border-yellow-500/20 px-5 py-1.5 text-xs text-yellow-400 font-medium">
          ● Registration Full
        </div>
      )}
    </div>
  )
}
