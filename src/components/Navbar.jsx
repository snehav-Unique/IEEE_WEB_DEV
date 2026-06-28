import { NavLink } from 'react-router-dom'
import { useEvents } from '../context/EventsContext'
import { IoBookmark, IoBookmarkOutline, IoCalendarOutline, IoHome, IoHomeOutline, IoStar, IoStarOutline } from 'react-icons/io5'

export default function Navbar() {
  const { bookmarkedIds } = useEvents()
  const bookmarkCount = bookmarkedIds.size
  const pathname = window.location.pathname
  const hash = window.location.hash
  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-border bg-obsidian/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Wordmark */}
        <NavLink
          to="/"
          end
          className="font-display font-semibold text-ink tracking-tight text-base hover:text-accent transition-colors"
        >
          RVCE<span className="text-accent">Events</span>
        </NavLink>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <button
            type="button"
            onClick={scrollToTop}
            className="relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all text-ink-dim hover:text-ink hover:bg-panel/50"
          >
            {pathname === '/' ? <IoHome className="w-4 h-4" /> : <IoHomeOutline className="w-4 h-4" />}
          </button>

          <NavLink
            to="/events#browse"
            className={({ isActive }) =>
              `relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all
               ${isActive && pathname === '/events' ? 'text-ink bg-panel' : 'text-ink-dim hover:text-ink hover:bg-panel/50'}`
            }
          >
            <IoCalendarOutline className="w-4 h-4" />
          </NavLink>

          <NavLink
            to="/events#recommended"
            className={({ isActive }) =>
              `relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all
               ${isActive && pathname === '/events' && hash === '#recommended' ? 'text-ink bg-panel' : 'text-ink-dim hover:text-ink hover:bg-panel/50'}`
            }
          >
            {pathname === '/events' && hash === '#recommended' ? <IoStar className="w-4 h-4" /> : <IoStarOutline className="w-4 h-4" />}
          </NavLink>

          <NavLink
            to="/bookmarks"
            end
            className={({ isActive }) =>
              `relative px-4 py-2 rounded-lg text-sm font-medium font-display transition-all flex items-center gap-1.5
               ${isActive ? 'text-ink bg-panel' : 'text-ink-dim hover:text-ink hover:bg-panel/50'}`
            }
          >
            {pathname === '/bookmarks' ? <IoBookmark className="w-4 h-4" /> : <IoBookmarkOutline className="w-4 h-4" />}
            {bookmarkCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 text-xs
                               rounded-full bg-accent text-white font-mono font-medium">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </span>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
