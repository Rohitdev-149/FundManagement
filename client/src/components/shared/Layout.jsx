import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useEvent } from "../../context/eventContext";
import Sidebar from "../layout/Sidebar";
import BottomNav from "./BottomNav";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentEvent, events, selectEvent } = useEvent();

  return (
    <div className="app-shell">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={logout}
        onProfileClick={() => navigate("/settings")}
        currentEvent={currentEvent}
        events={events}
        onSelectEvent={selectEvent}
      />
      <div className="app-main">
        <header className="mobile-header lg:hidden">
          <button
            type="button"
            className="btn btn-icon-md btn-ghost"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <span className="text-xl" aria-hidden="true">
              ☰
            </span>
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="brand-mark brand-mark-sm" aria-hidden="true">
              ॐ
            </span>
            <span className="truncate text-sm font-bold tracking-tight">
              Ganpati Fund
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate("/settings")}
            className="avatar avatar-sm"
            aria-label={user?.name || "Account"}
          >
            {user?.name?.slice(0, 1).toUpperCase() || "A"}
          </button>
        </header>
        <main>{children}</main>
      </div>
      <BottomNav />
    </div>
  );
};

export default Layout;
