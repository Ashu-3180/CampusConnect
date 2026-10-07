import { useNavigate } from "react-router-dom";

import SettingsModal from "./SettingsModal";
import {
  SettingsIcon as Icon,
  SettingsToggle as Toggle,
  SavingIndicator,
} from "./SettingsUI";

const TOGGLES = [
  {
    key: "eventInvitations",
    title: "Event invitations",
    description:
      "When someone joins an event you organize",
  },
  {
    key: "eventReminders",
    title: "Event reminders",
    description:
      "Attendance confirmations when you join an event",
  },
  {
    key: "eventUpdates",
    title: "Event updates",
    description:
      "When someone leaves your event or an event you joined is cancelled",
  },
  {
    key: "collaborationInvitations",
    title: "Collaboration invitations",
    description:
      "When someone applies to join your collaboration",
  },
  {
    key: "collaborationUpdates",
    title: "Collaboration updates",
    description:
      "When your collaboration application is accepted",
  },
  {
    key: "deadlineReminders",
    title: "Deadline / reminder notifications",
    description:
      "When an event you join starts within 48 hours",
  },
];

export default function EventsCollaborationsPanel({
  open,
  onClose,
  notifications,
  onToggle,
  savingKey = "",
  savedKey = "",
}) {
  const navigate = useNavigate();

  if (!open) {
    return null;
  }

  return (
    <SettingsModal
      title="Events & Collaborations"
      description="Choose which campus activity notifications you receive in-app."
      icon={<Icon name="info" size={21} />}
      onClose={onClose}
    >
      <div className="space-y-4">
        {TOGGLES.map((item) => (
          <div
            key={item.key}
            className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 p-3.5 dark:border-slate-800"
          >
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {item.description}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <SavingIndicator
                active={savingKey === item.key}
                saved={savedKey === item.key}
              />

              <Toggle
                checked={Boolean(notifications?.[item.key])}
                onChange={() => onToggle(item.key)}
                disabled={Boolean(savingKey)}
                label={`Toggle ${item.title}`}
              />
            </div>
          </div>
        ))}

        <div className="grid gap-2 border-t border-slate-100 pt-4 dark:border-slate-800 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/app/events");
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Open Events
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              navigate("/app/collaborations");
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Open Collaborations
          </button>
        </div>
      </div>
    </SettingsModal>
  );
}
