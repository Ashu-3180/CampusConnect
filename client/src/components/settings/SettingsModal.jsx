import { useEffect } from "react";

export default function SettingsModal({
  title,
  description,
  icon,
  tone = "indigo",
  onClose,
  children,
  footer = null,
  closeDisabled = false,
}) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !closeDisabled) {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDisabled, onClose]);

  const toneClasses = {
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",

    red:
      "bg-red-500/10 text-red-500 dark:bg-red-500/10 dark:text-red-400",

    slate:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/75 px-3 py-3 backdrop-blur-sm sm:items-center sm:px-4 sm:py-6"
      onClick={closeDisabled ? undefined : onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
          <div className="min-w-0 flex-1">
            {icon && (
              <div
                className={`mb-3 flex h-11 w-11 items-center justify-center rounded-full ${
                  toneClasses[tone] || toneClasses.indigo
                }`}
              >
                {icon}
              </div>
            )}

            <h2
              id="settings-modal-title"
              className="text-lg font-bold text-slate-900 dark:text-white sm:text-xl"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm sm:leading-6">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            disabled={closeDisabled}
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            ×
          </button>
        </div>

        {/* Scrollable content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>

        {/* Optional footer */}
        {footer && (
          <div className="border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}