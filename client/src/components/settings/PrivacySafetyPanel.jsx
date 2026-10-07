import SettingsModal from "./SettingsModal";
import { SettingsIcon as Icon } from "./SettingsUI";

const VISIBILITY_COPY = {
  everyone: {
    label: "Everyone",
    detail:
      "Any signed-in CampusConnect student can open your profile.",
  },
  connections: {
    label: "Connections",
    detail:
      "Only people you are connected with can open your profile. You can always view your own profile.",
  },
  "only-me": {
    label: "Only me",
    detail:
      "Your profile is private. Other students cannot open it.",
  },
};

export default function PrivacySafetyPanel({
  open,
  onClose,
  profileVisibility = "everyone",
  onOpenPassword,
  onOpenDelete,
  onChangeVisibility,
  saving = false,
}) {
  if (!open) {
    return null;
  }

  const current =
    VISIBILITY_COPY[profileVisibility] ||
    VISIBILITY_COPY.everyone;

  return (
    <SettingsModal
      title="Privacy & Safety"
      description="Understand who can see your profile and how to keep your account safe."
      icon={<Icon name="shield" size={21} />}
      onClose={onClose}
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Who can see your profile
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Current setting:{" "}
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {current.label}
            </span>
          </p>

          <p className="mt-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {current.detail}
          </p>

          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Profile visibility
            </span>

            <select
              value={profileVisibility}
              onChange={onChangeVisibility}
              disabled={saving}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="everyone">Everyone</option>
              <option value="connections">Connections</option>
              <option value="only-me">Only me</option>
            </select>
          </label>
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            What each option means
          </h3>

          <ul className="space-y-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">
                Everyone
              </strong>{" "}
              — discoverable profile for signed-in students.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">
                Connections
              </strong>{" "}
              — only accepted connections can view your profile.
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">
                Only me
              </strong>{" "}
              — profile pages are blocked for other users.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            What CampusConnect enforces
          </h3>

          <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            <li>
              Profile visibility is checked when someone opens
              your profile page.
            </li>
            <li>
              Your posts, messages, and events follow their own
              existing access rules.
            </li>
            <li>
              CampusConnect does not sell personal data or expose
              your password.
            </li>
          </ul>
        </section>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPassword?.();
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Password & Security
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDelete?.();
            }}
            className="rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            Delete Account
          </button>
        </div>
      </div>
    </SettingsModal>
  );
}
