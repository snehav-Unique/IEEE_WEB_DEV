import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useEvents } from './context/EventsContext'
import CardNav from './components/CardNav/CardNav'
import EventFeedPage from './pages/EventFeedPage'
import BookmarksPage from './pages/BookmarksPage'

export default function App() {
  const { events, loading, bookmarkedIds } = useEvents()
  const [showJoinModal, setShowJoinModal] = useState(false)
  const bookmarkCount = bookmarkedIds ? bookmarkedIds.size : 0

  const navItems = [
    {
      label: 'Explore',
      bgColor: '#fff8fb',
      textColor: '#2b1e28',
      links: [
        { label: 'Campus Events', href: '/events', ariaLabel: 'RVCE Campus Events List' },
        {
          label: `Bookmarks ${bookmarkCount > 0 ? `(${bookmarkCount})` : ''}`,
          href: '/bookmarks',
          ariaLabel: 'Bookmarked Events',
        },
      ],
    },
    {
      label: 'About IEEE',
      bgColor: '#fff8fb',
      textColor: '#2b1e28',
      links: [
        { label: 'RVCE Campus', href: '#', ariaLabel: 'RV College of Engineering' },
        { label: 'IEEE Branch', href: '#', ariaLabel: 'IEEE RVCE Student Branch' },
      ],
    },
    {
      label: 'Contact',
      bgColor: '#fff8fb',
      textColor: '#2b1e28',
      links: [
        { label: 'Email Us', href: 'mailto:ieee@rvce.edu.in', ariaLabel: 'Send an email' },
        { label: 'Instagram', href: '#', ariaLabel: 'Follow on Instagram' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-obsidian text-ink">
      <CardNav
        logo="/IEEE_logo.jpg"
        logoAlt="IEEE RVCE Logo"
        items={navItems}
        bookmarkCount={bookmarkCount}
        baseColor="rgba(255, 255, 255, 0.9)"
        menuColor="#e86fa4"
        buttonBgColor="#e86fa4"
        buttonTextColor="#fff"
        ease="power3.out"
        onJoinClick={() => setShowJoinModal(true)}
      />

      <main className="pt-24 pb-16 pl-[7rem] sm:pl-[8rem] lg:pl-[8.5rem]">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventFeedPage />} />
          <Route path="/event/:id" element={<EventFeedPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>

      {showJoinModal && (
        <div
          className="fixed inset-0 bg-[#fff6fa]/92 backdrop-blur-md flex justify-center items-center z-[9999] p-4"
          onClick={() => setShowJoinModal(false)}
        >
          <div
            className="bg-white border border-border rounded-3xl p-8 max-w-md w-full shadow-[0_24px_70px_rgba(232,111,164,0.16)] flex flex-col gap-5"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-xl font-bold font-display text-ink">
              Join RVCE IEEE Student Branch
            </h3>
            <p className="text-sm text-ink-dim leading-relaxed">
              Become a member of the world's largest technical professional organization. Get access to research papers, student workshops, hackathons, and global networking opportunities.
            </p>
            <div className="flex flex-col gap-2 text-xs text-ink-dim/90">
              <div>✓ Access to IEEE Xplore Digital Library</div>
              <div>✓ Stated discounts on national/international conferences</div>
              <div>✓ Heavy discounts on local branch technical workshops</div>
              <div>✓ Core group project mentoring and lab access</div>
            </div>
            <div className="flex gap-3 mt-2">
              <a
                href="https://www.ieee.org/membership/join/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-accent text-white rounded-xl py-3 font-semibold text-center hover:bg-accent-dim transition-colors shadow-lg shadow-[rgba(232,111,164,0.2)]"
              >
                Go to IEEE Portal
              </a>
              <button
                type="button"
                className="flex-1 bg-white border border-border text-ink rounded-xl py-3 font-semibold hover:bg-[#fff1f7] transition-colors"
                onClick={() => setShowJoinModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
