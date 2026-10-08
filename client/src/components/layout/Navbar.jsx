import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

function Navbar() {
  const { user } = useAuth();

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur-xl transition-colors sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/95">

      {/* Brand / Welcome */}
      <div className="min-w-0">

        {/* Mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <img
            src="/branding/campusconnect-mark.svg"
            alt="CampusConnect"
            className="h-8 w-auto max-w-[2.5rem] object-contain dark:hidden"
          />
          <img
            src="/branding/campusconnect-mark-dark.svg"
            alt="CampusConnect"
            className="hidden h-8 w-auto max-w-[2.5rem] object-contain dark:block"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
              CampusConnect
            </p>

            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              Connect. Collaborate. Grow.
            </p>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden items-center gap-4 lg:flex">
          <img
            src="/branding/campusconnect-wordmark.svg"
            alt="CampusConnect"
            className="h-7 w-auto max-w-[11rem] object-contain dark:hidden"
          />
          <img
            src="/branding/campusconnect-wordmark-dark.svg"
            alt="CampusConnect"
            className="hidden h-7 w-auto max-w-[11rem] object-contain dark:block"
          />

          <h2 className="font-semibold text-slate-800 dark:text-white">
            Welcome back,{" "}
            {user?.name?.split(" ")[0]}
          </h2>
        </div>

      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-4">

        <NotificationBell />

        <div className="flex items-center gap-2">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 ring-2 ring-white dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-slate-950">
            {initial}
          </div>

          <span className="hidden text-sm font-medium text-slate-700 sm:block dark:text-slate-200">
            {user?.name}
          </span>

        </div>
      </div>

    </header>
  );
}

export default Navbar;