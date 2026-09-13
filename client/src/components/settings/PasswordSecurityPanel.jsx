import { useMemo, useState } from "react";

import API_URL from "../../services/api";
import SettingsModal from "./SettingsModal";
import SessionSecurityCard from "./SessionSecurityCard";

function LockIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function EyeIcon({ open }) {
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
      {open ? (
        <>
          <path d="M2.5 12s3.4-5.5 9.5-5.5 9.5 5.5 9.5 5.5-3.4 5.5-9.5 5.5S2.5 12 2.5 12z" />
          <circle cx="12" cy="12" r="2.5" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.1 0 9.5 5.5 9.5 5.5a19 19 0 0 1-3.1 3.5M6.2 6.2A18.8 18.8 0 0 0 2.5 12S5.9 17.5 12 17.5c1.4 0 2.7-.2 3.9-.7" />
        </>
      )}
    </svg>
  );
}

function CheckIcon({ passed }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
        passed
          ? "bg-green-500 text-white"
          : "border border-slate-300 text-transparent dark:border-slate-700"
      }`}
      aria-hidden="true"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m5 12 4 4L19 6" />
      </svg>
    </span>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  visible,
  onToggleVisibility,
  describedBy,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-describedby={describedBy}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </label>
  );
}

function getPasswordScore(password) {
  let score = 0;

  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return score;
}

export default function PasswordSecurityPanel({
  open,
  onClose,
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordScore = useMemo(
    () => getPasswordScore(newPassword),
    [newPassword]
  );

  const passwordLabel =
    passwordScore <= 1
      ? "Weak"
      : passwordScore <= 3
        ? "Fair"
        : passwordScore <= 4
          ? "Good"
          : "Strong";

  const passwordChecks = [
    {
      label: "At least 6 characters",
      passed: newPassword.length >= 6,
    },
    {
      label: "Contains an uppercase letter",
      passed: /[A-Z]/.test(newPassword),
    },
    {
      label: "Contains a lowercase letter",
      passed: /[a-z]/.test(newPassword),
    },
    {
      label: "Contains a number",
      passed: /\d/.test(newPassword),
    },
  ];

  const passwordMatches =
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const passwordIsDifferent =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    currentPassword !== newPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You must be logged in to change your password."
        );
      }

      const response = await fetch(
        `${API_URL}/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to change password."
        );
      }

      setSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);

      window.setTimeout(() => {
        onClose();
      }, 1200);
    } catch (requestError) {
      setError(
        requestError.message || "Failed to change password."
      );
    } finally {
      setSaving(false);
    }
  };

  // IMPORTANT:
  // The parent controls whether this panel is open.
  // When open becomes false, the entire panel must disappear.
  if (!open) {
    return null;
  }

  return (
    <SettingsModal
      open={open}
      title="Password & Security"
      description="Keep your CampusConnect account protected."
      icon={<LockIcon />}
      onClose={onClose}
      closeDisabled={saving}
    >
      <div className="space-y-5">
        <SessionSecurityCard />

        <section className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <LockIcon />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Security checkup
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                Keep your password unique and use a strong
                combination that you do not reuse on other
                websites.
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 sm:px-4 sm:text-sm"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-xs font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300 sm:px-4 sm:text-sm"
            >
              {success}
            </div>
          )}

          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            placeholder="Enter current password"
            disabled={saving}
            visible={showCurrent}
            onToggleVisibility={() =>
              setShowCurrent((value) => !value)
            }
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            placeholder="Create a new password"
            disabled={saving}
            visible={showNew}
            onToggleVisibility={() =>
              setShowNew((value) => !value)
            }
            describedBy="password-requirements"
          />

          {newPassword && (
            <div
              id="password-requirements"
              className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Password strength
                </span>

                <span
                  className={`text-xs font-bold ${
                    passwordScore <= 1
                      ? "text-red-500"
                      : passwordScore <= 3
                        ? "text-amber-500"
                        : passwordScore <= 4
                          ? "text-indigo-500"
                          : "text-green-500"
                  }`}
                >
                  {passwordLabel}
                </span>
              </div>

              <div className="mt-2 flex gap-1">
                {Array.from({ length: 6 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 flex-1 rounded-full transition ${
                        index < passwordScore
                          ? "bg-indigo-500"
                          : "bg-slate-200 dark:bg-slate-800"
                      }`}
                    />
                  )
                )}
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400"
                  >
                    <CheckIcon passed={check.passed} />
                    <span>{check.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Confirm new password"
            disabled={saving}
            visible={showConfirm}
            onToggleVisibility={() =>
              setShowConfirm((value) => !value)
            }
          />

          {confirmPassword && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckIcon passed={passwordMatches} />
                <span>
                  {passwordMatches
                    ? "Passwords match"
                    : "Passwords must match"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <CheckIcon passed={passwordIsDifferent} />
                <span>
                  {passwordIsDifferent
                    ? "New password is different from your current password"
                    : "New password must be different from your current password"}
                </span>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Security tips
            </h3>

            <div className="mt-2.5 space-y-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
              <p>
                Use a password that is unique to CampusConnect.
              </p>

              <p>
                Avoid names, birthdays, phone numbers, or
                predictable patterns.
              </p>

              <p>
                Never share your password with another person.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Changing..."
                : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </SettingsModal>
  );
}