export function SettingsIcon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    user: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3l7 3v5c0 4.6-2.9 8-7 10-4.1-2-7-5.4-7-10V6l7-3z" />
        <path d="m9.5 12 1.7 1.7 3.5-3.5" />
      </>
    ),
    key: (
      <>
        <circle cx="8" cy="15" r="3.5" />
        <path d="m10.5 12.5 8-8M15 7l2 2M17 5l2 2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 8h18c0-1-3-1-3-8" />
        <path d="M10 21h4" />
      </>
    ),
    moon: (
      <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z" />
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5 12 3z" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c.6-3.1 2.5-4.7 6-4.7s5.4 1.6 6 4.7" />
        <path d="M16 5.5a3 3 0 0 1 0 5.7M18 15.2c1.7.7 2.7 2 3 3.8" />
      </>
    ),
    eye: (
      <>
        <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12z" />
        <circle cx="12" cy="12" r="2.5" />
      </>
    ),
    logOut: (
      <>
        <path d="M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5" />
        <path d="m14 8 4 4-4 4M8 12h10" />
      </>
    ),
    trash: (
      <path d="M4 7h16M10 11v5M14 11v5M6 7l1 13h10l1-13M9 7V4h6v3" />
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 10v6M12 7h.01" />
      </>
    ),
    edit: (
      <>
        <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17l-1 3z" />
        <path d="m14 7 3 3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };

  return <svg {...common}>{paths[name] || paths.info}</svg>;
}


export function SettingsToggle({
  checked,
  onChange,
  label,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
      className={`relative h-6 w-11 shrink-0 rounded-full transition sm:h-7 sm:w-12 ${
        checked
          ? "bg-indigo-600"
          : "bg-slate-300 dark:bg-slate-700"
      } disabled:cursor-not-allowed disabled:opacity-60`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition sm:h-5 sm:w-5 ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}


export function SavingIndicator({ active, saved }) {
  if (active) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-slate-400 sm:text-xs dark:text-slate-500">
        <span className="h-3 w-3 animate-spin rounded-full border border-slate-300 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-400" />
        Saving
      </span>
    );
  }

  if (saved) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 text-[10px] font-medium text-green-600 sm:text-xs dark:text-green-400">
        <SettingsIcon name="check" size={13} />
        Saved
      </span>
    );
  }

  return null;
}


export function SettingRow({
  icon,
  title,
  description,
  value,
  onClick,
  danger = false,
  children,
}) {
  const content = (
    <>
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${
          danger
            ? "bg-red-500/10 text-red-500"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        <SettingsIcon name={icon} size={18} />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div
          className={`text-sm font-semibold sm:text-base ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-slate-900 dark:text-white"
          }`}
        >
          {title}
        </div>

        {description && (
          <p className="mt-0.5 text-xs leading-5 text-slate-500 sm:mt-1 sm:text-sm dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {children ||
        (value && (
          <span className="max-w-[120px] shrink-0 truncate text-xs font-medium text-slate-500 sm:max-w-none sm:text-sm dark:text-slate-400">
            {value}
          </span>
        ))}

      {onClick && !children && (
        <span className="shrink-0 text-xl leading-none text-slate-400 dark:text-slate-500">
          ›
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-3 text-left transition hover:bg-slate-50 active:bg-slate-100 sm:gap-4 sm:px-3 sm:py-4 dark:hover:bg-slate-800/80 dark:active:bg-slate-800"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 px-2.5 py-3 sm:gap-4 sm:px-3 sm:py-4">
      {content}
    </div>
  );
}


export function SettingsSection({ title, description, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-xs leading-5 text-slate-500 sm:mt-1.5 sm:text-sm dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div className="px-1.5 py-1.5 sm:px-3 sm:py-2">
        {children}
      </div>
    </section>
  );
}