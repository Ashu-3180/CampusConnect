import SettingsModal from "./SettingsModal";
import { SettingsIcon as Icon } from "./SettingsUI";

export default function LanguagePanel({
  open,
  onClose,
  language,
  onChangeLanguage,
  saving = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <SettingsModal
      title="Language"
      description="Switch CampusConnect between English and Hindi."
      icon={<Icon name="globe" size={21} />}
      onClose={onClose}
      closeDisabled={saving}
    >
      <div className="space-y-3">
        {[
          { value: "en", label: "English" },
          { value: "hi", label: "हिन्दी (Hindi)" },
        ].map((option) => {
          const selected = language === option.value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={saving}
              onClick={() => onChangeLanguage(option.value)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition ${
                selected
                  ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-500/10"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {option.label}
              </span>

              {selected && (
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  Active
                </span>
              )}
            </button>
          );
        })}

        <p className="pt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Your choice is saved to your account and restored
          after refresh or login. User-generated content such as
          posts, messages, and names is not translated.
        </p>
      </div>
    </SettingsModal>
  );
}
