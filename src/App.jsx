import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
import { useEvents } from './context/EventsContext'
import CardNav from './components/CardNav/CardNav'
import EventFeedPage from './pages/EventFeedPage'
import EventDetailPage from './pages/EventDetailPage'
import BookmarksPage from './pages/BookmarksPage'

export default function App() {
  const { bookmarkedIds } = useEvents()
  const [showJoinModal, setShowJoinModal] = useState(false)
  const bookmarkCount = bookmarkedIds ? bookmarkedIds.size : 0

  const navItems = [
    {
      label: "Explore",
      bgColor: "#161527",
      textColor: "#fff",
      links: [
        { label: "Campus Events", href: "/events", ariaLabel: "RVCE Campus Events List" },
        { 
          label: `Bookmarks ${bookmarkCount > 0 ? `(${bookmarkCount})` : ''}`, 
          href: "/bookmarks", 
          ariaLabel: "Bookmarked Events" 
        }
      ]
    },
    {
      label: "About IEEE",
      bgColor: "#1b1931",
      textColor: "#fff",
      links: [
        { label: "RVCE Campus", href: "#", ariaLabel: "RV College of Engineering" },
        { label: "IEEE Branch", href: "#", ariaLabel: "IEEE RVCE Student Branch" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#201d3b",
      textColor: "#fff",
      links: [
        { label: "Email Us", href: "mailto:ieee@rvce.edu.in", ariaLabel: "Send an email" },
        { label: "Instagram", href: "#", ariaLabel: "Follow on Instagram" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-obsidian text-ink">
      {/* Premium Floating CardNav Navbar */}
      <CardNav
        logo="/ieee-logo.svg"
        logoAlt="IEEE RVCE Logo"
        items={navItems}
        bookmarkCount={bookmarkCount}
        baseColor="rgba(10, 10, 15, 0.8)"
        menuColor="#a99ff8"
        buttonBgColor="#7c6af7"
        buttonTextColor="#fff"
        ease="power3.out"
        onJoinClick={() => setShowJoinModal(true)}
      />

      <main className="pt-24 pb-16">
        <Routes>
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="/events" element={<EventFeedPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </main>

      {/* Join Branch Modal */}
      {showJoinModal && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md flex justify-center items-center z-[9999] p-4"
          onClick={() => setShowJoinModal(false)}
        >
          <div 
            className="bg-gradient-to-br from-[#161624] to-[#0a0a10] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-5"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold font-display bg-gradient-to-r from-white to-[#a99ff8] bg-clip-text text-transparent">
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
                className="flex-1 bg-[#7c6af7] text-white rounded-xl py-3 font-semibold text-center hover:bg-[#6354dd] transition-colors shadow-lg shadow-[#7c6af7]/20"
              >
                Go to IEEE Portal
              </a>
              <button 
                type="button" 
                className="flex-1 bg-white/5 border border-white/10 text-white rounded-xl py-3 font-semibold hover:bg-white/10 transition-colors" 
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
