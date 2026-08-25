import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";

function Navbar() {
  const { user } = useAuth();

  const initial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : "U";

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="font-semibold text-slate-800">
          Welcome back, {user?.name?.split(" ")[0]}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            {initial}
          </div>

          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            {user?.name}
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;