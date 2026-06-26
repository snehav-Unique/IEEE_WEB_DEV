import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import dayjs from 'dayjs'
import BookmarkButton from './BookmarkButton'
import StarBorder from './StarBorder/StarBorder'
import { IoCloseOutline, IoInformationCircleOutline, IoPeopleOutline, IoLocationOutline, IoLayersOutline } from 'react-icons/io5'

export default function StackEventCard({ event, isBookmarked, onBookmark }) {
  const [showPreview, setShowPreview] = useState(false)
  const start = event.startTime
  const end = event.endTime
  
  const dateStr = start && start.isValid()
    ? start.format('ddd, MMM D, YYYY')
    : 'Date TBA'
  const timeStr = start && start.isValid()
    ? start.format('h:mm A')
    : ''
  const endTimeStr = end && end.isValid() && start && start.isSame(end, 'day')
    ? end.format('h:mm A')
    : ''

  // Determine a theme color based on event type or index to make it vibrant
  const colors = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#8b5cf6'  // Purple
  ];
  
  const charSum = event.title.charCodeAt(0) + (event.type ? event.type.charCodeAt(0) : 0);
  const themeColor = colors[charSum % colors.length];

  // Calculate seats left
  const maxCap = event.capacity?.max;
  const currReg = event.capacity?.current;
  const isFull = event.capacity?.isFull;
  
  let seatsLeftText = "Open admission";
  if (isFull) {
    seatsLeftText = "Registration Full";
  } else if (maxCap !== null && maxCap !== undefined) {
    const remaining = maxCap - (currReg ?? 0);
    seatsLeftText = `${remaining > 0 ? remaining : 0} seats left (of ${maxCap})`;
  }

  return (
    <div className="relative w-full h-full group">
      {/* Quick Event Preview Drawer (Renders outside StarBorder to avoid overflow clipping on desktop) */}
      <div 
        className={`absolute z-30 bg-[#0f1a36]/98 border border-border rounded-2xl p-4 shadow-2xl transition-all duration-300 ease-out flex flex-col justify-between gap-3 top-3 left-3 w-[260px] md:top-0 md:right-full md:mr-5 md:w-[250px] ${
          showPreview 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto'
        }`
      >
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-border pb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent flex items-center gap-1">
              <IoLayersOutline /> Quick Preview
            </span>

          </div>

          <div className="space-y-2.5 text-xs">
            {/* Organizer */}
            {event.hostClub && (
              <div className="flex items-start gap-2">
                <IoPeopleOutline className="w-3.5 h-3.5 text-accent-glow mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] text-ink-dim uppercase tracking-wider">Organizer</p>
                  <p className="font-semibold text-ink line-clamp-1">{event.hostClub}</p>
                </div>
              </div>
            )}

            {/* Location */}
            {event.location?.summary && (
              <div className="flex items-start gap-2">
                <IoLocationOutline className="w-3.5 h-3.5 text-accent-glow mt-0.5 shrink-0" />
                <div>
                  <p className="text-[9px] text-ink-dim uppercase tracking-wider">Location</p>
                  <p className="text-ink line-clamp-1">{event.location.summary}</p>
                </div>
              </div>
            )}

            {/* Seats Left */}
            <div className="flex items-start gap-2">
              <IoPeopleOutline className="w-3.5 h-3.5 text-accent-glow mt-0.5 shrink-0" />
              <div>
                <p className="text-[9px] text-ink-dim uppercase tracking-wider">Seats Left</p>
                <p className={`font-semibold text-xs ${isFull ? 'text-red-400' : 'text-emerald-400'}`}>{seatsLeftText}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tags & Action Button in Drawer */}
        <div className="flex justify-between items-center gap-2 border-t border-border pt-2 mt-1">
          <div className="flex flex-wrap gap-1 max-w-[55%]">
            {event.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[9px] bg-subtle text-ink-dim border border-border">
                #{tag}
              </span>
            ))}
          </div>
        
        </div>
      </div>

      {/* Outer Card with StarBorder */}
      <StarBorder 
        className="w-full h-full"
        color={themeColor}
        speed="5s"
        thickness={1.5}
      >
        <div className="flex flex-col h-full justify-between gap-6 p-6 relative rounded-[calc(1.5rem-1px)] bg-panel">
          {/* Top Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              {event.type && (
                <span 
                  className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md border"
                  style={{ 
                    backgroundColor: `${themeColor}12`, 
                    color: themeColor,
                    borderColor: `${themeColor}30`
                  }}
                >
                  {event.type}
                </span>
              )}
              {event.isCancelled && (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-red-500/10 text-red-400 border border-red-500/20">
                  ✕ Cancelled
                </span>
              )}
              {event.capacity?.isFull && !event.isCancelled && (
                <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  ● Full
                </span>
              )}
            </div>
            
            {/* Bookmark & Mobile Preview Buttons */}
            <div className="flex items-center gap-2 shrink-0 relative z-30">
              <button
                type="button"
                className="sm:hidden p-2 rounded-full bg-subtle border border-border text-ink-dim hover:text-accent"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowPreview(true) }}
                title="Quick Preview"
              >
                <IoInformationCircleOutline className="w-5 h-5" />
              </button>
              <BookmarkButton isBookmarked={isBookmarked} onToggle={onBookmark} />
            </div>
          </div>

          {/* Title & Description */}
          <div className="flex-1 space-y-3">
            <Link 
              to={`/event/${event.id}`} 
              className="block"
            >
              <h3 className="font-display font-bold text-xl sm:text-2xl text-ink leading-snug hover:text-accent transition-colors line-clamp-2">
                {event.title}
              </h3>
            </Link>
            <p className="text-ink-dim text-sm line-clamp-3 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-dim/80 border-t border-white/5 pt-4">
            {/* Date / Time */}
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{dateStr}{timeStr ? ` · ${timeStr}${endTimeStr ? ` – ${endTimeStr}` : ''}` : ''}</span>
            </div>

            {/* Location */}
            {event.location?.summary && (
              <div className="flex items-center gap-1.5 max-w-[250px]">
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{event.location.summary}</span>
              </div>
            )}
          </div>

          {/* Tags & Action Button */}
          <div className="flex justify-between items-center flex-wrap gap-4 mt-2">
            <div className="flex flex-wrap gap-1.5">
              {event.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="px-2.5 py-0.5 rounded text-xs bg-subtle text-ink-dim/90 border border-border">
                  #{tag}
                </span>
              ))}
            </div>
            
            <Link 
              to={`/event/${event.id}`} 
              className="text-xs font-semibold text-white px-4 py-2 rounded-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              style={{ 
                background: `linear-gradient(135deg, ${themeColor} 0%, rgba(99, 102, 241, 0.1) 100%)`,
                border: `1px solid ${themeColor}50`,
                boxShadow: `0 4px 12px ${themeColor}20`
              }}
            >
              View Details
            </Link>
          </div>
        </div>
      </StarBorder>
    </div>
  )
}
