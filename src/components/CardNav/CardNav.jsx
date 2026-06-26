import { useLocation, Link, NavLink } from 'react-router-dom';
import { IoCalendar, IoDocumentText, IoBookmark, IoBookmarkOutline, IoCalendarOutline, IoDocumentTextOutline } from 'react-icons/io5';
import './CardNav.css';

const CardNav = ({
  logo,
  logoAlt = 'Logo',
  bookmarkCount = 0,
  buttonBgColor = '#6366f1',
  buttonTextColor = '#fff',
  onJoinClick
}) => {
  const location = useLocation();
  const path = location.pathname;

  // Resolve details path. If we have a last viewed event, use it.
  const lastViewedEventId = localStorage.getItem('lastViewedEventId');
  const detailsPath = lastViewedEventId ? `/event/${lastViewedEventId}` : null;
  const isDetailsDisabled = !detailsPath;

  return (
    <div className="card-nav-container">
      <nav className="card-nav flex items-center justify-between px-6 py-2 bg-surface/90 border border-border/80 rounded-full shadow-lg">
        {/* Left Side: Logo */}
        <Link to="/events" className="flex items-center gap-2">
          {logo ? (
            <img src={logo} alt={logoAlt} className="logo h-8" />
          ) : (
            <div className="logo-text">IEEE RVCE</div>
          )}
        </Link>

        {/* Center: Icon Navigation Tabs */}
        <div className="flex items-center gap-4 bg-obsidian/60 border border-border/40 rounded-full p-1 relative">
          {/* Active indicator bubble */}
          <div 
            className="absolute top-1 bottom-1 bg-accent/20 border border-accent/30 rounded-full transition-all duration-300"
            style={{
              width: '44px',
              left: path === '/events' ? '4px' :
                    path.startsWith('/event/') ? '52px' :
                    path === '/bookmarks' ? '100px' : '-999px',
              display: ['/events', '/bookmarks'].includes(path) || path.startsWith('/event/') ? 'block' : 'none'
            }}
          />

          {/* Events Tab */}
          <NavLink
            to="/events"
            className={({ isActive }) =>
              `relative z-10 p-2.5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-ink-dim hover:text-ink'
              }`
            }
            title="Events Feed"
          >
            {path === '/events' ? <IoCalendar className="w-5 h-5" /> : <IoCalendarOutline className="w-5 h-5" />}
          </NavLink>

          {/* Details Tab */}
          {isDetailsDisabled ? (
            <div
              className="p-2.5 rounded-full flex items-center justify-center text-ink-dim/20 cursor-not-allowed"
              title="No event viewed yet"
            >
              <IoDocumentTextOutline className="w-5 h-5" />
            </div>
          ) : (
            <NavLink
              to={detailsPath}
              className={({ isActive }) =>
                `relative z-10 p-2.5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  isActive || path.startsWith('/event/') ? 'text-accent' : 'text-ink-dim hover:text-ink'
                }`
              }
              title="Event Details"
            >
              {path.startsWith('/event/') ? <IoDocumentText className="w-5 h-5" /> : <IoDocumentTextOutline className="w-5 h-5" />}
            </NavLink>
          )}

          {/* Bookmarks Tab */}
          <NavLink
            to="/bookmarks"
            className={({ isActive }) =>
              `relative z-10 p-2.5 rounded-full flex items-center justify-center transition-colors duration-200 ${
                isActive ? 'text-accent' : 'text-ink-dim hover:text-ink'
              }`
            }
            title="Bookmarks"
          >
            {path === '/bookmarks' ? (
              <div className="relative flex items-center justify-center">
                <IoBookmark className="w-5 h-5" />
                {bookmarkCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                    {bookmarkCount}
                  </span>
                )}
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                <IoBookmarkOutline className="w-5 h-5" />
                {bookmarkCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-accent text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-lg">
                    {bookmarkCount}
                  </span>
                )}
              </div>
            )}
          </NavLink>
        </div>

        {/* Right Side: CTA Button */}
        <button
          type="button"
          className="card-nav-cta-button"
          style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          onClick={onJoinClick}
        >
          Join Branch
        </button>
      </nav>
    </div>
  );
};

export default CardNav;
