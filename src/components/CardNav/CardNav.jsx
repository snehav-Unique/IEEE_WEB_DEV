import { useLocation, Link, NavLink } from 'react-router-dom'
import {
  IoDocumentText,
  IoBookmark,
  IoBookmarkOutline,
  IoCalendarOutline,
  IoDocumentTextOutline
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
  const path = location.pathname

  const lastViewedEventId = localStorage.getItem('lastViewedEventId')
  const detailsPath = lastViewedEventId ? `/event/${lastViewedEventId}` : null
  const isDetailsDisabled = !detailsPath

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
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `card-nav-tab ${isActive ? 'is-active' : ''}`
              }
              title="Events Feed"
            >
              <IoCalendarOutline className="w-5 h-5" />
            </NavLink>

            {isDetailsDisabled ? (
              <div className="card-nav-tab is-disabled" title="No event viewed yet">
                <IoDocumentTextOutline className="w-5 h-5" />
              </div>
            ) : (
              <NavLink
                to={detailsPath}
                className={({ isActive }) =>
                  `card-nav-tab ${(isActive || path.startsWith('/event/')) ? 'is-active' : ''}`
                }
                title="Event Details"
              >
                {path.startsWith('/event/') ? <IoDocumentText className="w-5 h-5" /> : <IoDocumentTextOutline className="w-5 h-5" />}
              </NavLink>
            )}

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
