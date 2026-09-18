import { useState, useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "../shared/BottomNav";
import { EventContext } from "../context/EventContext";
import { AuthContext } from "../context/AuthContext";
import { Avatar } from "../ui";

const Header = ({ sidebarOpen, setSidebarOpen, user, onLogout }) => {
  const { currentEvent, events, selectEvent } = useContext(EventContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find((ev) => ev._id === eventId);
    if (event) selectEvent(event);
  };

  return (
    <header className="header">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-ghost btn-icon-md lg:hidden"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          <svg
            className="size-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {sidebarOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
        <div className="flex-1 min-w-0 hidden sm:block">
          {currentEvent && (
            <div className="flex items-center gap-3">
              <h1 className="header-title truncate">{currentEvent.name}</h1>
              {events.length > 1 && (
                <select
                  value={currentEvent._id}
                  onChange={handleEventChange}
                  className="form-input form-select py-2 px-3 text-sm max-w-xs"
                  aria-label="Select event"
                >
                  {events.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/settings")}
              aria-label="Open settings"
            >
              <Avatar size="sm" label={user.name} />
            </button>
            <span className="hidden md:block text-sm font-medium text-[var(--color-text-primary)]">
              {user.name}
            </span>
          </div>
        )}
        <button
          onClick={onLogout}
          className="btn-ghost btn-icon-md"
          aria-label="Logout"
        >
          <svg
            className="size-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>
  );
};

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { currentEvent, events, selectEvent } = useContext(EventContext);
  const location = useLocation();

  const isAuthPage = location.pathname === "/login";

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={logout}
        currentEvent={currentEvent}
        events={events}
        onSelectEvent={selectEvent}
        collapsed={collapsed}
      />

      <div
        className={`lg:pl-64 transition-all duration-200 ${collapsed ? "lg:pl-16" : ""}`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          user={user}
          onLogout={logout}
        />

        <main className="min-h-[calc(100vh-4rem)] pb-20 lg:pb-0">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default Layout;
