import React from 'react'
import { useEvents } from '../context/EventsContext'
import ScrollStack from '../components/ScrollStack/ScrollStack'
import StackEventCard from '../components/StackEventCard'
import EmptyState from '../components/EmptyState'

export default function BookmarksPage() {
  const { events, loading, bookmarkedIds, toggleBookmark, clearBookmarks } = useEvents()

  const bookmarked = events.filter((e) => bookmarkedIds.has(e.id))

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-panel rounded-xl w-48" />
          <div className="space-y-6 mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-panel border border-border" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-ink">Bookmarks</h1>
          <p className="text-ink-dim text-sm mt-1">
            {bookmarked.length === 0
              ? 'No saved events yet'
              : `${bookmarked.length} saved event${bookmarked.length > 1 ? 's' : ''}`}
          </p>
        </div>
        {bookmarked.length > 0 && (
          <button
            onClick={clearBookmarks}
            className="px-5 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold
                       hover:bg-red-500/10 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {bookmarked.length === 0 ? (
        <EmptyState
          message="No bookmarks yet"
          sub="Go explore events and tap the bookmark icon to save them here!"
        />
      ) : (
        /* ScrollStack for bookmarks */
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
