import { useState } from "react";

import SettingsModal from "./SettingsModal";
import API_URL from "../../services/api";

function Icon({ name, size = 22 }) {
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
    trash: (
      <path d="M4 7h16M10 11v5M14 11v5M6 7l1 13h10l1-13M9 7V4h6v3" />
    ),
    shield: (
      <>
        <path d="M12 3l7 3v5c0 4.6-2.9 8-7 10-4.1-2-7-5.4-7-10V6l7-3z" />
        <path d="m9.5 12 1.7 1.7 3.5-3.5" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.trash}</svg>;
}

export default function DeleteAccountPanel({
  open,
  onClose,
  onDeleted,
}) {
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setDeletePassword("");
    setDeleteConfirmation("");
    setError("");
    setDeleting(false);
  };

  const closePanel = () => {
    if (deleting) {
      return;
    }

    resetForm();
    onClose();
  };

  const handleDeleteAccount = async (event) => {
    event.preventDefault();
    setError("");

    if (!deletePassword) {
      setError("Please enter your current password.");
      return;
    }

    if (deleteConfirmation !== "DELETE") {
      setError('Please type "DELETE" exactly to confirm.');
      return;
    }

    try {
      setDeleting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You must be logged in to delete your account."
        );
      }

      const response = await fetch(
        `${API_URL}/auth/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: deletePassword,
            confirmation: deleteConfirmation,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete account."
        );
      }

      resetForm();

      if (onDeleted) {
        onDeleted();
      } else {
        onClose();
      }
    } catch (requestError) {
      setError(
        requestError.message || "Failed to delete account."
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <SettingsModal
      title="Delete Account"
      description="This action is permanent. Your account and associated CampusConnect data will be deleted."
      icon={<Icon name="trash" size={21} />}
      tone="red"
      onClose={closePanel}
      closeDisabled={deleting}
    >
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/50 dark:bg-red-950/30 sm:p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 text-red-500 dark:text-red-400">
              <Icon name="shield" size={18} />
            </div>

            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                This cannot be undone.
              </p>

              <p className="mt-1.5 text-xs leading-5 text-red-600 dark:text-red-400">
                Your profile, posts, owned collaborations, owned events,
                messages, notifications and account data will be removed.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Current Password
            </label>

            <input
              type="password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Enter your current password"
              disabled={deleting}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-red-500/10"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
              Type DELETE to confirm
            </label>

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(event) => setDeleteConfirmation(event.target.value)}
              placeholder="DELETE"
              autoComplete="off"
              disabled={deleting}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm font-medium uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-red-500/10"
            />
          </div>

          <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:gap-3 dark:border-slate-800">
            <button
              type="button"
              disabled={deleting}
              onClick={closePanel}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={deleting}
              className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </form>
      </div>
    </SettingsModal>
  );
}
