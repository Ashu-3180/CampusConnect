import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import PasswordSecurityPanel from "../components/settings/PasswordSecurityPanel";
import DeleteAccountPanel from "../components/settings/DeleteAccountPanel";

import {
  SettingsIcon as Icon,
  SettingsToggle as Toggle,
  SavingIndicator,
  SettingRow,
  SettingsSection as Section,
} from "../components/settings/SettingsUI";

function Settings() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] =
    useState(true);
  const [profileVisibility, setProfileVisibility] =
    useState("everyone");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [savingPreference, setSavingPreference] =
    useState("");
  const [savedPreference, setSavedPreference] =
    useState("");

  const [showPasswordSecurity, setShowPasswordSecurity] =
    useState(false);
  const [showDeleteAccount, setShowDeleteAccount] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    const loadPreferences = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await userService.getMyPreferences();
        const preferences = data.preferences || {};

        if (!mounted) {
          return;
        }

        setDarkMode(preferences.darkMode ?? false);
        setEmailNotifications(
          preferences.emailNotifications ?? true
        );
        setProfileVisibility(
          preferences.profileVisibility || "everyone"
        );

        // Keep AuthContext in sync so dark mode and
        // other prefs survive navigation after refresh.
        if (user) {
          updateUser({
            ...user,
            preferences: {
              ...user.preferences,
              ...preferences,
            },
          });
        }
      } catch (requestError) {
        if (mounted) {
          setError(
            requestError.message ||
              "Failed to load preferences"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPreferences();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      darkMode
    );
  }, [darkMode]);

  useEffect(() => {
    if (!savedPreference) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setSavedPreference("");
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [savedPreference]);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setFeedback("");
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const persistPreference = async (key, nextValue, previousValue) => {
    if (savingPreference) {
      return;
    }

    setSavingPreference(key);
    setSavedPreference("");
    setError("");
    setFeedback("");

    try {
      const data = await userService.updateMyPreferences({
        [key]: nextValue,
      });

      const preferences = data.preferences || {};
      const finalValue = preferences[key] ?? nextValue;

      if (key === "darkMode") {
        setDarkMode(finalValue);
      }

      if (key === "emailNotifications") {
        setEmailNotifications(finalValue);
      }

      if (key === "profileVisibility") {
        setProfileVisibility(finalValue);
      }

      if (user) {
        updateUser({
          ...user,
          preferences: {
            ...user.preferences,
            [key]: finalValue,
          },
        });
      }

      setSavedPreference(key);
      setFeedback("Preference updated successfully.");
    } catch (requestError) {
      if (key === "darkMode") {
        setDarkMode(previousValue);
      }

      if (key === "emailNotifications") {
        setEmailNotifications(previousValue);
      }

      if (key === "profileVisibility") {
        setProfileVisibility(previousValue);
      }

      setError(
        requestError.message ||
          "Failed to update preference."
      );
    } finally {
      setSavingPreference("");
    }
  };

  const handleDarkModeChange = () => {
    if (savingPreference) {
      return;
    }

    const previousValue = darkMode;
    const nextValue = !darkMode;

    setDarkMode(nextValue);

    persistPreference(
      "darkMode",
      nextValue,
      previousValue
    );
  };

  const handleEmailNotificationsChange = () => {
    if (savingPreference) {
      return;
    }

    const previousValue = emailNotifications;
    const nextValue = !emailNotifications;

    setEmailNotifications(nextValue);

    persistPreference(
      "emailNotifications",
      nextValue,
      previousValue
    );
  };

  const handleProfileVisibilityChange = (event) => {
    if (savingPreference) {
      return;
    }

    const previousValue = profileVisibility;
    const nextValue = event.target.value;

    setProfileVisibility(nextValue);

    persistPreference(
      "profileVisibility",
      nextValue,
      previousValue
    );
  };

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[45vh] w-full max-w-5xl items-center justify-center px-4 sm:min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600 dark:border-slate-700 dark:border-t-indigo-500" />

          <p className="mt-3 text-xs text-slate-500 sm:mt-4 sm:text-sm dark:text-slate-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  const displayName = user?.name || "CampusConnect User";
  const email = user?.email || "Email not available";

  return (
    <div className="mx-auto w-full max-w-6xl pb-12">
      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <p className="text-xs font-semibold text-indigo-600 sm:text-sm dark:text-indigo-400">
          Account preferences
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Settings
        </h1>

        <p className="mt-1.5 max-w-2xl text-xs leading-5 text-slate-500 sm:mt-2 sm:text-base sm:leading-6 dark:text-slate-400">
          Manage your CampusConnect account, privacy,
          notifications, appearance and security.
        </p>
      </div>

      {/* Global error */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs font-medium text-red-600 sm:mb-5 sm:px-4 sm:text-sm dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Autosave feedback */}
      {feedback && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-xs font-medium text-green-700 sm:mb-5 sm:px-4 sm:text-sm dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          <Icon name="check" size={15} />
          {feedback}
        </div>
      )}

      {/* Profile summary */}
      <section className="mb-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-colors sm:mb-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 sm:p-7 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={displayName}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-white shadow-sm sm:h-20 sm:w-20 dark:ring-slate-800"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 ring-4 ring-white shadow-sm sm:h-20 sm:w-20 sm:text-2xl dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-slate-800">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-slate-900 sm:text-xl dark:text-white">
                  {displayName}
                </h2>

                <p className="mt-0.5 truncate text-xs text-slate-500 sm:mt-1 sm:text-sm dark:text-slate-400">
                  {email}
                </p>

                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600 sm:mt-2 sm:text-xs dark:text-indigo-400">
                  CampusConnect account
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/app/profile")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Icon name="edit" size={16} />
              Edit Profile
            </button>
          </div>
        </div>
      </section>

      {/* Settings sections */}
      <div className="grid gap-4 sm:gap-5 xl:grid-cols-2">
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
            onClick={() => navigate("/app/profile")}
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="key"
            title="Password & Security"
            description="Keep your account protected"
            onClick={() => setShowPasswordSecurity(true)}
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
            <div className="flex shrink-0 items-center gap-2">
              <SavingIndicator
                active={savingPreference === "profileVisibility"}
                saved={savedPreference === "profileVisibility"}
              />

              <select
                value={profileVisibility}
                onChange={handleProfileVisibilityChange}
                disabled={Boolean(savingPreference)}
                aria-label="Profile visibility"
                className="max-w-[120px] rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 sm:max-w-[150px] sm:px-3 sm:text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-500/20"
              >
                <option value="everyone">Everyone</option>
                <option value="connections">Connections</option>
                <option value="only-me">Only me</option>
              </select>
            </div>
          </SettingRow>

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="shield"
            title="Privacy & Safety"
            description="Review your privacy and account safety options"
            onClick={() => {
              setError("");
              setFeedback(
                "Use Profile Visibility to control who can see your profile. Open Password & Security for account safety."
              );
            }}
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
            <div className="flex shrink-0 items-center gap-2">
              <SavingIndicator
                active={savingPreference === "darkMode"}
                saved={savedPreference === "darkMode"}
              />

              <Toggle
                checked={darkMode}
                onChange={handleDarkModeChange}
                disabled={Boolean(savingPreference)}
                label="Toggle dark mode"
              />
            </div>
          </SettingRow>

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="bell"
            title="Email Notifications"
            description="Receive updates and important account notifications"
          >
            <div className="flex shrink-0 items-center gap-2">
              <SavingIndicator
                active={
                  savingPreference === "emailNotifications"
                }
                saved={
                  savedPreference === "emailNotifications"
                }
              />

              <Toggle
                checked={emailNotifications}
                onChange={handleEmailNotificationsChange}
                disabled={Boolean(savingPreference)}
                label="Toggle email notifications"
              />
            </div>
          </SettingRow>

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="globe"
            title="Language"
            description="Choose the language used by CampusConnect"
            value="English"
            onClick={() => {
              setError("");
              setFeedback(
                "CampusConnect currently supports English only."
              );
            }}
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
            onClick={() => navigate("/app/network")}
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="info"
            title="Events & Collaborations"
            description="Manage your campus activities and preferences"
            onClick={() => navigate("/app/events")}
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

      {/* Help & support */}
      <div className="mt-4 sm:mt-5">
        <Section
          title="Help & support"
          description="Get help or tell us how CampusConnect can improve."
        >
          <SettingRow
            icon="info"
            title="Help Center"
            description="Find answers to common questions"
            onClick={() => {
              setError("");
              setFeedback(
                "Use the main navigation for Discover, Network, Events, and Collaborations. Password help is under Password & Security."
              );
            }}
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="info"
            title="Report a Problem"
            description="Let us know if something isn't working"
            onClick={() => {
              setError("");
              setFeedback("");

              const subject = encodeURIComponent(
                "CampusConnect problem report"
              );
              const body = encodeURIComponent(
                `Describe the problem:\n\nAccount: ${email}\nPage: Settings\n`
              );

              window.location.href = `mailto:support@campusconnect.app?subject=${subject}&body=${body}`;
            }}
          />

          <div className="mx-3 border-t border-slate-100 dark:border-slate-800" />

          <SettingRow
            icon="info"
            title="About CampusConnect"
            description="App information and version"
            value="v1.0"
            onClick={() => {
              setError("");
              setFeedback(
                "CampusConnect v1.0 — connect with students, events, and collaborations on campus."
              );
            }}
          />
        </Section>
      </div>

      {/* Danger zone */}
      <section className="mt-4 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm sm:mt-5 dark:border-red-900/50 dark:bg-slate-900">
        <div className="border-b border-red-100 px-4 py-4 sm:px-6 sm:py-5 dark:border-red-900/40">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500 sm:h-11 sm:w-11">
              <Icon name="trash" size={19} />
            </div>

            <div>
              <h2 className="text-base font-bold text-red-600 sm:text-lg dark:text-red-400">
                Account actions
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
                These actions can permanently affect your account.
              </p>
            </div>
          </div>
        </div>

        <div className="p-1.5 sm:p-3">
          <SettingRow
            icon="trash"
            title="Delete Account"
            description="Permanently delete your CampusConnect account"
            danger
            onClick={() => setShowDeleteAccount(true)}
          />
        </div>
      </section>

      <PasswordSecurityPanel
        open={showPasswordSecurity}
        onClose={() => setShowPasswordSecurity(false)}
      />

      <DeleteAccountPanel
        open={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onDeleted={logout}
      />
    </div>
  );
}

export default Settings;
