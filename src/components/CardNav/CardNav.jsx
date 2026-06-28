import { useLocation, Link, NavLink, useNavigate } from 'react-router-dom'
import {
  IoBookmark,
  IoBookmarkOutline,
  IoCalendarOutline,
  IoHome,
  IoHomeOutline,
  IoStar,
  IoStarOutline,
} from 'react-icons/io5'
import './CardNav.css'

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  bookmarkCount = 0,
  buttonBgColor = '#6366f1',
  buttonTextColor = '#fff',
  onJoinClick,
}) => {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const handleHomeClick = () => {
    if (path !== '/events') {
      navigate('/events')
      return
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <div className="card-nav-container">
      <nav className="card-nav">
        <div className="card-nav-shell card-nav-shell--docked">
          <Link to="/events" className="flex items-center justify-center shrink-0">
            {logo ? (
              <img src={logo} alt={logoAlt} className="logo logo--docked" />
            ) : (
              <div className="logo-text text-center">IEEE RVCE</div>
            )}
          </Link>

          <div className="card-nav-tabs card-nav-tabs--docked">
            <button
              type="button"
              className="card-nav-tab"
              onClick={handleHomeClick}
              title="Home"
              aria-label="Home"
            >
              {path === '/events' ? (
                <IoHome className="w-5 h-5" />
              ) : (
                <IoHomeOutline className="w-5 h-5" />
              )}
            </button>

            <NavLink
              to="/events#browse"
              className={({ isActive }) =>
                `card-nav-tab ${isActive && path === '/events' ? 'is-active' : ''}`
              }
              title="Events Feed"
            >
              <IoCalendarOutline className="w-5 h-5" />
            </NavLink>

            <NavLink
              to="/events#recommended"
              className={({ isActive }) =>
                `card-nav-tab ${isActive && path === '/events' && location.hash === '#recommended' ? 'is-active' : ''}`
              }
              title="Recommended Events"
            >
              {path === '/events' && location.hash === '#recommended' ? (
                <IoStar className="w-5 h-5" />
              ) : (
                <IoStarOutline className="w-5 h-5" />
              )}
            </NavLink>

            <NavLink
              to="/bookmarks"
              className={({ isActive }) =>
                `card-nav-tab ${isActive ? 'is-active' : ''}`
              }
              title="Bookmarks"
            >
              {path === '/bookmarks' ? (
                <div className="relative flex items-center justify-center">
                  <IoBookmark className="w-5 h-5" />
                  {bookmarkCount > 0 && (
                    <span className="nav-badge nav-badge--active">
                      {bookmarkCount}
                    </span>
                  )}
                </div>
              ) : (
                <div className="relative flex items-center justify-center">
                  <IoBookmarkOutline className="w-5 h-5" />
                  {bookmarkCount > 0 && (
                    <span className="nav-badge">
                      {bookmarkCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          </div>

          <button
            type="button"
            className="card-nav-cta-button"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
            onClick={onJoinClick}
          >
            Join
          </button>
        </div>
      </nav>
    </div>
  )
}

export default CardNav
