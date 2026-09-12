import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "../../context/AuthContext";

const mobilePrimaryNavigation = [
  {
    name: "Home",
    path: "/app",
    icon: "⌂",
  },
  {
    name: "Collaborate",
    path: "/app/collaborations",
    icon: "⌘",
  },
  {
    name: "Events",
    path: "/app/events",
    icon: "◫",
  },
  {
    name: "Network",
    path: "/app/network",
    icon: "♧",
  },
  {
    name: "Messages",
    path: "/app/messages",
    icon: "◌",
  },
];

const mobileMoreNavigation = [
  {
    name: "Discover",
    path: "/app/discover",
    icon: "◉",
  },
  {
    name: "Search",
    path: "/app/search",
    icon: "⌕",
  },
  {
    name: "Profile",
    path: "/app/profile",
    icon: "◎",
  },
  {
    name: "Settings",
    path: "/app/settings",
    icon: "⚙",
  },
];

function AppLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showMoreMenu, setShowMoreMenu] =
    useState(false);

  const handleLogout = () => {
    setShowMoreMenu(false);
    logout();
    navigate("/login");
  };

  const mobileLinkClasses = ({ isActive }) =>
    `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition ${
      isActive
        ? "bg-indigo-600 text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
    }`;

  const moreLinkClasses = ({ isActive }) =>
    `flex items-center gap-4 rounded-xl px-4 py-3 transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    }`;

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <Sidebar />
      </div>

      {/* Main Application Area */}
      <div className="min-h-screen bg-slate-50 lg:ml-64 dark:bg-slate-950">

        <Navbar />

        <main className="min-w-0 bg-slate-50 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8 dark:bg-slate-950">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_25px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden dark:border-slate-800 dark:bg-slate-950/95">

        <div className="mx-auto flex w-full max-w-lg items-stretch gap-1">

          {mobilePrimaryNavigation.map(
            (item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/app"}
                onClick={() =>
                  setShowMoreMenu(false)
                }
                className={
                  mobileLinkClasses
                }
              >
                <span className="text-lg leading-none">
                  {item.icon}
                </span>

                <span className="max-w-full truncate text-[10px] font-medium leading-none">
                  {item.name}
                </span>
              </NavLink>
            )
          )}

          {/* More */}
          <button
            type="button"
            onClick={() =>
              setShowMoreMenu(
                (value) => !value
              )
            }
            className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 transition ${
              showMoreMenu
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            }`}
            aria-expanded={showMoreMenu}
            aria-label="Open more navigation options"
          >
            <span className="text-lg leading-none">
              •••
            </span>

            <span className="text-[10px] font-medium leading-none">
              More
            </span>
          </button>

        </div>
      </nav>

      {/* Mobile More Menu */}
      {showMoreMenu && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
            onClick={() =>
              setShowMoreMenu(false)
            }
          />

          <div className="fixed inset-x-3 bottom-[88px] z-50 mx-auto max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl lg:hidden dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-2 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                More
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Access the rest of CampusConnect.
              </p>
            </div>

            <div className="space-y-1">
              {mobileMoreNavigation.map(
                (item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() =>
                      setShowMoreMenu(false)
                    }
                    className={
                      moreLinkClasses
                    }
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-lg dark:bg-slate-800">
                      {item.icon}
                    </span>

                    <span className="font-medium">
                      {item.name}
                    </span>

                    <span className="ml-auto text-lg text-slate-400 dark:text-slate-500">
                      ›
                    </span>
                  </NavLink>
                )
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-lg dark:bg-red-950/40">
                  ↪
                </span>

                <span className="font-medium">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default AppLayout;