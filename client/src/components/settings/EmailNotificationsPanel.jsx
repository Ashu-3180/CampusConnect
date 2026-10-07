import SettingsModal from "./SettingsModal";
import {
  SettingsIcon as Icon,
  SettingsToggle as Toggle,
  SavingIndicator,
} from "./SettingsUI";

export default function EmailNotificationsPanel({
  open,
  onClose,
  emailNotifications,
  onToggleEmail,
  saving = false,
  saved = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <SettingsModal
      title="Email Notifications"
      description="Control how CampusConnect stores your email notification preference."
      icon={<Icon name="bell" size={21} />}
      onClose={onClose}
    >
      <div className="space-y-5">
        <section className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            What CampusConnect supports today
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            CampusConnect does not send outbound email yet.
            There is no SMTP or email delivery provider
            configured. This preference is saved to your account
            so the product can respect it when email delivery is
            added later.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Email notification preference
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Saved on your account. Does not send email today.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <SavingIndicator active={saving} saved={saved} />

              <Toggle
                checked={emailNotifications}
                onChange={onToggleEmail}
                disabled={saving}
                label="Toggle email notification preference"
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Application notifications
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            In-app notifications (likes, comments, connections,
            collaborations, and events) continue to appear in
            the notification bell. Manage event and collaboration
            categories under Events & Collaborations.
          </p>
        </section>
      </div>
    </SettingsModal>
  );
}
