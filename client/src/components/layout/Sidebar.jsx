import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Avatar } from "../ui";
import { eventScopedNavigation as navigation } from "./navigation";

const icons = {
  home: (
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
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  ),
  wallet: (
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
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  "credit-card": (
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
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  ),
  folder: (
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
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  ),
  users: (
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
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  ),
  "chart-bar": (
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
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  clock: (
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  settings: (
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
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  logout: (
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
  ),
};

const Sidebar = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onProfileClick,
  currentEvent,
  events,
  onSelectEvent,
  onSelectOverall,
  isSuperAdmin = false,
  collapsed = false,
}) => {
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleNavClick = () => {
    onClose();
  };

  const SidebarContent = () => (
    <aside
      ref={sidebarRef}
      className={`sidebar ${collapsed ? "sidebar-collapsed" : ""} ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="sidebar-header">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-xl" aria-hidden="true">
                🪔
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-[var(--color-text-primary)] truncate">
                Fund Manager
              </h1>
              <p className="text-xs text-[var(--color-text-tertiary)]">
                Mandal Manager
              </p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center">
            <div className="size-10 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-xl" aria-hidden="true">
                🪔
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navigation.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/dashboard" &&
              location.pathname.startsWith(item.path));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive: active }) => `
                sidebar-nav-item ${!collapsed ? "" : "justify-center"}
                ${active ? "sidebar-nav-item-active" : ""}
              `}
              aria-current={isActive ? "page" : undefined}
              title={collapsed ? item.label : undefined}
            >
              <span aria-hidden="true">{icons[item.icon]}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}

        {isSuperAdmin && events.length > 0 && !collapsed && (
          <div className="pt-2 mt-2 border-t border-[var(--color-border)]">
            <p className="px-3 text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wide mb-2">
              Events
            </p>
            <button
              onClick={onSelectOverall}
              className={`sidebar-nav-item ${!currentEvent ? "sidebar-nav-item-active" : ""} w-full text-left`}
            >
              <span aria-hidden="true">#</span>
              <span className="truncate">Overall</span>
            </button>
            {events.map((event) => {
              const isActive = currentEvent?._id === event._id;
              return (
                <button
                  key={event._id}
                  onClick={() => onSelectEvent(event)}
                  className={`sidebar-nav-item ${isActive ? "sidebar-nav-item-active" : ""} w-full text-left`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span aria-hidden="true">
                    <svg
                      className="size-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <span className="truncate">{event.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <button
            type="button"
            onClick={onProfileClick}
            className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-[var(--color-surface-hover)] w-full text-left"
            aria-label="Open settings"
          >
            <Avatar size="md" label={user.name} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {user.name}
              </p>
              <p className="text-xs text-[var(--color-text-tertiary)] capitalize">
                {user.role}
              </p>
            </div>
          </button>
        )}

        <button
          onClick={onLogout}
          className={`sidebar-nav-item ${!collapsed ? "" : "justify-center"} text-[var(--color-error)] hover:bg-[var(--color-error-light)]`}
          title={collapsed ? "Logout" : undefined}
        >
          <span aria-hidden="true">{icons.logout}</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <SidebarContent />
    </>
  );
};

export default Sidebar;
