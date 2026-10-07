import SettingsModal from "./SettingsModal";
import { SettingsIcon as Icon } from "./SettingsUI";

const APP_VERSION = "1.0.0";

export default function AboutPanel({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <SettingsModal
      title="About CampusConnect"
      description="Application information for this CampusConnect build."
      icon={<Icon name="info" size={21} />}
      onClose={onClose}
    >
      <div className="space-y-4">
        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            CampusConnect
          </h3>

          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Version {APP_VERSION}
          </p>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
            CampusConnect helps students connect, collaborate,
            share campus updates, join events, and build their
            academic network.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Core technologies
          </h3>

          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
            <li>React + Vite frontend</li>
            <li>Express API</li>
            <li>MongoDB Atlas with Mongoose</li>
            <li>Socket.IO for realtime messaging</li>
            <li>GridFS for profile and post media</li>
            <li>Tailwind CSS for styling</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Included features
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Profiles, connections, messages, campus feed posts
            (text/image/video), comments, events, collaborations,
            clubs, notifications, and account settings.
          </p>
        </section>
      </div>
    </SettingsModal>
  );
}
