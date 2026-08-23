function Navbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="font-semibold text-slate-800">
          Welcome back
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
          Notifications
        </button>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            A
          </div>

          <span className="hidden text-sm font-medium text-slate-700 sm:block">
            Student
          </span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;