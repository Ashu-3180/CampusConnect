import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";

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

    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
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
        <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9s-1.1 6.6-3.3 9c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3z" />
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

    key: (
      <>
        <circle cx="8" cy="15" r="3.5" />
        <path d="m10.5 12.5 8-8M15 7l2 2M17 5l2 2" />
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
  };

  return <svg {...common}>{paths[name] || paths.info}</svg>;
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked
          ? "bg-indigo-600"
          : "bg-slate-300 dark:bg-slate-700"
      }`}
      aria-label={label}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

function SettingRow({
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
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
          danger
            ? "bg-red-500/10 text-red-500"
            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        }`}
      >
        <Icon name={icon} size={20} />
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div
          className={`font-semibold ${
            danger
              ? "text-red-600 dark:text-red-400"
              : "text-slate-900 dark:text-white"
          }`}
        >
          {title}
        </div>

        {description && (
          <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {children ||
        (value && (
          <span className="shrink-0 text-sm font-medium text-slate-500 dark:text-slate-400">
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
        className="flex w-full items-center gap-4 rounded-xl px-3 py-4 text-left transition hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-slate-800/80 dark:active:bg-slate-800"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4 px-3 py-4">
      {content}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 px-5 py-5 dark:border-slate-800 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 text-sm leading-5 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      <div className="px-2 py-2 sm:px-3">
        {children}
      </div>
    </section>
  );
}

function Setting() {
  const navigate = useNavigate();

  const {
    user,
    logout,
    updateUser,
  } = useAuth();

  const [darkMode, setDarkMode] =
    useState(false);

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [profileVisibility, setProfileVisibility] =
    useState("everyone");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [saved, setSaved] =
    useState(false);

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [passwordSaving, setPasswordSaving] =
    useState(false);

  const [passwordError, setPasswordError] =
    useState("");

  const [passwordSuccess, setPasswordSuccess] =
    useState("");

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [deletePassword, setDeletePassword] =
    useState("");

  const [deleteConfirmation, setDeleteConfirmation] =
    useState("");

  const [deleteError, setDeleteError] =
    useState("");

  const [deletingAccount, setDeletingAccount] =
    useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await userService.getMyPreferences();

        const preferences =
          data.preferences || {};

        setDarkMode(
          preferences.darkMode ?? false
        );

        setEmailNotifications(
          preferences.emailNotifications ?? true
        );

        setProfileVisibility(
          preferences.profileVisibility ||
            "everyone"
        );
      } catch (error) {
        setError(
          error.message ||
            "Failed to load preferences"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );
  }, [darkMode]);

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const data =
        await userService.updateMyPreferences({
          darkMode,
          emailNotifications,
          profileVisibility,
        });

      const preferences =
        data.preferences || {};

      const finalDarkMode =
        preferences.darkMode ?? darkMode;

      const finalEmailNotifications =
        preferences.emailNotifications ??
        emailNotifications;

      const finalProfileVisibility =
        preferences.profileVisibility ||
        profileVisibility;

      setDarkMode(finalDarkMode);
      setEmailNotifications(
        finalEmailNotifications
      );
      setProfileVisibility(
        finalProfileVisibility
      );

      if (user) {
        updateUser({
          ...user,
          preferences: {
            ...user.preferences,
            darkMode: finalDarkMode,
            emailNotifications:
              finalEmailNotifications,
            profileVisibility:
              finalProfileVisibility,
          },
        });
      }

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      setError(
        error.message ||
          "Failed to save preferences"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (
    event
  ) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      setPasswordSaving(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You must be logged in to change your password."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/change-password",
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordSuccess(
        "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 1500);
    } catch (error) {
      setPasswordError(
        error.message ||
          "Failed to change password."
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async (
    event
  ) => {
    event.preventDefault();

    setDeleteError("");

    if (!deletePassword) {
      setDeleteError(
        "Please enter your current password."
      );
      return;
    }

    if (deleteConfirmation !== "DELETE") {
      setDeleteError(
        'Please type "DELETE" exactly to confirm.'
      );
      return;
    }

    try {
      setDeletingAccount(true);

      const token =
        localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "You must be logged in to delete your account."
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/auth/delete-account",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: deletePassword,
            confirmation:
              deleteConfirmation,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete account."
        );
      }

      setShowDeleteModal(false);
      setDeletePassword("");
      setDeleteConfirmation("");

      logout();
    } catch (error) {
      setDeleteError(
        error.message ||
          "Failed to delete account."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-5xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500" />

          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  const displayName =
    user?.name || "CampusConnect User";

  const email =
    user?.email || "Email not available";

  const visibilityLabel = {
    everyone: "Everyone",
    connections: "Connections",
    "only-me": "Only me",
  }[profileVisibility];

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
          Account preferences
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Settings
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
          Manage your CampusConnect account, privacy,
          notifications, appearance and security.
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          Settings saved successfully.
        </div>
      )}

      {/* Profile summary */}
      <section className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">

        <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 sm:p-7">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex min-w-0 items-center gap-5">

              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={displayName}
                  className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-white shadow-sm dark:ring-slate-800"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 ring-4 ring-white shadow-sm dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-slate-800">
                  {displayName
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold text-slate-900 dark:text-white">
                  {displayName}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                  {email}
                </p>

                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                  CampusConnect account
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/app/profile")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Icon name="edit" size={16} />
              Edit Profile
            </button>

          </div>
        </div>
      </section>

      {/* Settings sections */}
      <div className="grid gap-5 xl:grid-cols-2">

        {/* Account */}
        <Section
          title="Account"
          description="Manage your basic CampusConnect account information."
        >
          <SettingRow
            icon="user"
            title="Personal Information"
            description="Your name and account email"
            value={displayName}
            onClick={() =>
              navigate("/app/profile")
            }
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="key"
            title="Password & Security"
            description="Keep your account protected"
            onClick={() => {
              setShowPasswordModal(true);
              setPasswordError("");
              setPasswordSuccess("");
            }}
          />
        </Section>

        {/* Privacy */}
        <Section
          title="Privacy & visibility"
          description="Choose who can access your profile and information."
        >
          <SettingRow
            icon="eye"
            title="Profile Visibility"
            description="Control who can view your profile"
          >
            <select
              value={profileVisibility}
              onChange={(event) =>
                setProfileVisibility(
                  event.target.value
                )
              }
              className="max-w-[150px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-500/20"
              aria-label="Profile visibility"
            >
              <option value="everyone">
                Everyone
              </option>

              <option value="connections">
                Connections
              </option>

              <option value="only-me">
                Only me
              </option>
            </select>
          </SettingRow>

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="shield"
            title="Privacy & Safety"
            description="Review your privacy and account safety options"
          />
        </Section>

        {/* Preferences */}
        <Section
          title="App preferences"
          description="Customize the way CampusConnect looks and keeps you informed."
        >
          <SettingRow
            icon="moon"
            title="Dark Mode"
            description="Use a darker appearance throughout CampusConnect"
          >
            <Toggle
              checked={darkMode}
              onChange={() =>
                setDarkMode((value) => !value)
              }
              label="Toggle dark mode"
            />
          </SettingRow>

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="bell"
            title="Email Notifications"
            description="Receive updates and important account notifications"
          >
            <Toggle
              checked={emailNotifications}
              onChange={() =>
                setEmailNotifications(
                  (value) => !value
                )
              }
              label="Toggle email notifications"
            />
          </SettingRow>

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="globe"
            title="Language"
            description="Choose the language used by CampusConnect"
            value="English"
          />
        </Section>

        {/* Campus experience */}
        <Section
          title="CampusConnect"
          description="Manage the parts of your campus experience."
        >
          <SettingRow
            icon="users"
            title="Clubs & Communities"
            description="Manage your campus groups and memberships"
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="info"
            title="Events & Collaborations"
            description="Manage your campus activities and preferences"
          />
        </Section>

        {/* Security */}
        <Section
          title="Security"
          description="Keep your CampusConnect account secure."
        >
          <SettingRow
            icon="lock"
            title="Password"
            description="Change your password to keep your account secure"
            onClick={() => {
              setShowPasswordModal(true);
              setPasswordError("");
              setPasswordSuccess("");
            }}
          />
        </Section>

        {/* Session */}
        <Section
          title="Session"
          description="Manage your current session."
        >
          <SettingRow
            icon="logOut"
            title="Log Out"
            description="Sign out of your CampusConnect account on this device"
            onClick={logout}
          />
        </Section>

      </div>

      {/* Save preferences */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Save your preferences
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your appearance, notification and privacy settings are stored with your account.
          </p>
        </div>

        <button
          type="button"
          disabled={saving}
          onClick={handleSavePreferences}
          className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "Saving..."
            : "Save Preferences"}
        </button>
      </div>

      {/* Help & support */}
      <div className="mt-5">
        <Section
          title="Help & support"
          description="Get help or tell us how CampusConnect can improve."
        >
          <SettingRow
            icon="info"
            title="Help Center"
            description="Find answers to common questions"
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="info"
            title="Report a Problem"
            description="Let us know if something isn't working"
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="info"
            title="About CampusConnect"
            description="App information and version"
            value="v1.0"
          />
        </Section>
      </div>

      {/* Danger zone */}
      <section className="mt-5 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-900/50 dark:bg-slate-900">

        <div className="border-b border-red-100 px-5 py-5 dark:border-red-900/40 sm:px-6">

          <div className="flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <Icon name="trash" size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-red-600 dark:text-red-400">
                Account actions
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                These actions can permanently affect your account.
              </p>
            </div>

          </div>

        </div>

        <div className="p-2 sm:p-3">
          <SettingRow
            icon="trash"
            title="Delete Account"
            description="Permanently delete your CampusConnect account"
            danger
            onClick={() => {
              setShowDeleteModal(true);
              setDeleteError("");
              setDeletePassword("");
              setDeleteConfirmation("");
            }}
          />
        </div>

      </section>

      {/* Password modal */}
      {showPasswordModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            if (!passwordSaving) {
              setShowPasswordModal(false);
              setPasswordError("");
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <Icon name="lock" size={22} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Change Password
                </h2>

                <p className="mt-1.5 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Enter your current password and choose a new one.
                </p>
              </div>

              <button
                type="button"
                disabled={passwordSaving}
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {passwordError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
                {passwordSuccess}
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className="space-y-4"
            >

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Current Password
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  placeholder="Enter current password"
                  disabled={passwordSaving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  New Password
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  disabled={passwordSaving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  placeholder="Confirm new password"
                  disabled={passwordSaving}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">

                <button
                  type="button"
                  disabled={passwordSaving}
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError("");
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {passwordSaving
                    ? "Changing..."
                    : "Change Password"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm"
          onClick={() => {
            if (!deletingAccount) {
              setShowDeleteModal(false);
              setDeleteError("");
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-900/60 dark:bg-slate-900"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mb-6 flex items-start justify-between gap-4">

              <div>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <Icon name="trash" size={21} />
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Delete Account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  This action is permanent. Your account and associated CampusConnect data will be deleted.
                </p>
              </div>

              <button
                type="button"
                disabled={deletingAccount}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-2xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">

              <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                This cannot be undone.
              </p>

              <p className="mt-1.5 text-xs leading-5 text-red-600 dark:text-red-400">
                Your profile, posts, owned collaborations, owned events, messages, notifications and account data will be removed.
              </p>

            </div>

            {deleteError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                {deleteError}
              </div>
            )}

            <form
              onSubmit={handleDeleteAccount}
              className="space-y-4"
            >

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Current Password
                </label>

                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) =>
                    setDeletePassword(
                      event.target.value
                    )
                  }
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  disabled={deletingAccount}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-red-500/10"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Type DELETE to confirm
                </label>

                <input
                  type="text"
                  value={deleteConfirmation}
                  onChange={(event) =>
                    setDeleteConfirmation(
                      event.target.value
                    )
                  }
                  placeholder="DELETE"
                  autoComplete="off"
                  disabled={deletingAccount}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium uppercase text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-red-500/10"
                />
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">

                <button
                  type="button"
                  disabled={deletingAccount}
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError("");
                  }}
                  className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingAccount
                    ? "Deleting..."
                    : "Delete Account"}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Setting;