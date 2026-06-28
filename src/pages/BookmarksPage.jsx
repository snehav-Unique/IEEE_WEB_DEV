import React from 'react'
import { useEvents } from '../context/EventsContext'
import ScrollStack from '../components/ScrollStack/ScrollStack'
import StackEventCard from '../components/StackEventCard'
import EmptyState from '../components/EmptyState'

export default function BookmarksPage() {
  const { events, loading, bookmarkedIds, toggleBookmark, clearBookmarks } = useEvents()

  const bookmarked = events.filter((event) => bookmarkedIds.has(event.id))

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
        <ScrollStack>
          {bookmarked.map((event) => (
            <StackEventCard
              key={event.id}
              event={event}
              isBookmarked={true}
              onBookmark={() => toggleBookmark(event.id)}
            />
          ))}
        </ScrollStack>
      )}
    </div>
  )
}
