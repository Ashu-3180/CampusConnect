import { useMemo } from "react";

function ShieldIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l7 3v5c0 4.6-2.9 8-7 10-4.1-2-7-5.4-7-10V6l7-3z" />
      <path d="m9.5 12 1.7 1.7 3.5-3.5" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function getTokenPayload(token) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const normalized = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = normalized.padEnd(
      normalized.length +
        ((4 - (normalized.length % 4)) % 4),
      "="
    );

    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

function getBrowserName() {
  const userAgent = navigator.userAgent;

  // Brave is Chromium-based, so it must be checked
  // before Chrome.
  if (
    navigator.brave &&
    typeof navigator.brave.isBrave === "function"
  ) {
    return "Brave";
  }

  // Opera also contains Chrome in its user-agent.
  if (/OPR\//.test(userAgent) || /Opera/.test(userAgent)) {
    return "Opera";
  }

  if (/Edg\//.test(userAgent)) {
    return "Microsoft Edge";
  }

  if (/Firefox\//.test(userAgent)) {
    return "Mozilla Firefox";
  }

  if (
    /Safari\//.test(userAgent) &&
    !/Chrome\//.test(userAgent) &&
    !/Chromium\//.test(userAgent)
  ) {
    return "Safari";
  }

  if (/Chrome\//.test(userAgent)) {
    return "Google Chrome";
  }

  if (/Chromium\//.test(userAgent)) {
    return "Chromium";
  }

  return "Web Browser";
}

function formatExpiry(timestamp) {
  if (!timestamp) {
    return null;
  }

  const date = new Date(timestamp * 1000);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function SessionSecurityCard() {
  const session = useMemo(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      return {
        active: false,
        browser: "Unknown browser",
        expiresAt: null,
        expiresLabel: null,
      };
    }

    const payload = getTokenPayload(token);

    if (!payload) {
      return {
        active: false,
        browser: getBrowserName(),
        expiresAt: null,
        expiresLabel: null,
      };
    }

    const expiresAt = payload.exp || null;

    const expired =
      expiresAt !== null &&
      expiresAt * 1000 <= Date.now();

    return {
      active: !expired,
      browser: getBrowserName(),
      expiresAt,
      expiresLabel: formatExpiry(expiresAt),
    };
  }, []);

  const isExpired =
    session.expiresAt !== null &&
    session.expiresAt * 1000 <= Date.now();

  const isActive = session.active && !isExpired;

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600 dark:text-green-400">
          <ShieldIcon />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Current session
            </h3>

            <span
              className={`inline-flex w-fit items-center rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                isActive
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {isActive ? "Active" : "Expired"}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
            This is the browser session currently signed in to
            your CampusConnect account.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <MonitorIcon />

            <span className="text-[11px] font-semibold uppercase tracking-wide">
              Browser
            </span>
          </div>

          <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {session.browser}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <ClockIcon />

            <span className="text-[11px] font-semibold uppercase tracking-wide">
              Session expiry
            </span>
          </div>

          <p className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
            {session.expiresLabel || "Not available"}
          </p>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 dark:border-amber-900/40 dark:bg-amber-950/20">
        <p className="text-[11px] leading-5 text-amber-700 dark:text-amber-300">
          Session details are read from your current login token.
          They are informational only. CampusConnect does not
          currently provide remote session management for other
          devices.
        </p>
      </div>
    </section>
  );
}