import { useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";

function Profile() {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    university: "",
    course: "",
    graduationYear: "",
    bio: "",
    skills: "",
    github: "",
    linkedin: "",
    profileImage: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data =
          await userService.getMyProfile();

        setProfile(data.user);

        setFormData({
          name: data.user.name || "",
          university:
            data.user.university || "",
          course: data.user.course || "",
          graduationYear:
            data.user.graduationYear || "",
          bio: data.user.bio || "",
          skills:
            data.user.skills?.join(", ") || "",
          github: data.user.github || "",
          linkedin: data.user.linkedin || "",
          profileImage:
            data.user.profileImage || "",
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleProfileImageChange = async (
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Only JPG, PNG, WEBP and GIF images are allowed."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    try {
      setUploadingImage(true);
      setError("");
      setSuccess("");

      const data =
        await userService.uploadProfileImage(
          file
        );

      setProfile(data.user);
      updateUser(data.user);

      setFormData((previous) => ({
        ...previous,
        profileImage:
          data.user.profileImage || "",
      }));

      setSuccess(
        "Profile photo uploaded successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(
        error.message ||
          "Failed to upload profile photo."
      );
    } finally {
      setUploadingImage(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const profileData = {
        ...formData,
        graduationYear: Number(
          formData.graduationYear
        ),
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const data =
        await userService.updateMyProfile(
          profileData
        );

      setProfile(data.user);
      updateUser(data.user);

      setEditing(false);

      setSuccess(
        "Profile updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-slate-500 sm:py-10 sm:text-base dark:text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-8 text-center text-sm text-red-500 sm:py-10 sm:text-base dark:text-red-400">
        {error || "Profile not found"}
      </div>
    );
  }

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">

      {/* Profile Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors sm:p-6 dark:border-slate-800 dark:bg-slate-900">

        <div className="flex flex-col gap-5 sm:gap-6 sm:flex-row sm:items-start sm:justify-between">

          {/* Identity */}
          <div className="flex items-center gap-3.5 sm:gap-5">

            <div className="relative shrink-0">

              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={profile.name}
                  className="h-20 w-20 rounded-full object-cover object-center ring-4 ring-indigo-50 shadow-md sm:h-28 sm:w-28 dark:ring-indigo-500/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600 ring-4 ring-indigo-50 shadow-md sm:h-28 sm:w-28 sm:text-4xl dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-500/10">
                  {initial}
                </div>
              )}

              {/* Change photo button */}
              {editing && (
                <>
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-sm shadow-lg transition hover:scale-105 hover:bg-indigo-700 sm:h-9 sm:w-9 sm:text-base disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-900"
                    title="Change profile photo"
                  >
                    {uploadingImage
                      ? "…"
                      : "📷"}
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={
                      handleProfileImageChange
                    }
                    className="hidden"
                  />
                </>
              )}

            </div>

            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                {profile.name}
              </h1>

              <p className="mt-0.5 text-sm text-slate-600 sm:mt-1 sm:text-base dark:text-slate-300">
                {profile.course}
              </p>

              <p className="text-xs text-slate-400 sm:text-sm dark:text-slate-500">
                {profile.university}
              </p>

              <p className="text-xs text-slate-400 sm:text-sm dark:text-slate-500">
                Graduating{" "}
                {profile.graduationYear}
              </p>
            </div>

          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => {
              setEditing(!editing);
              setError("");
              setSuccess("");
            }}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 sm:w-auto sm:py-2"
          >
            {editing
              ? "Cancel Editing"
              : "Edit Profile"}
          </button>

        </div>

        {/* About */}
        {profile.bio && (
          <div className="mt-5 border-t border-slate-100 pt-4 sm:mt-6 sm:pt-5 dark:border-slate-800">

            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-sm dark:text-slate-500">
              About
            </h3>

            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:mt-2 sm:text-base sm:leading-relaxed dark:text-slate-300">
              {profile.bio}
            </p>

          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mt-5 sm:mt-6">

            <h3 className="mb-2.5 text-sm font-semibold text-slate-800 sm:mb-3 sm:text-base dark:text-white">
              Skills
            </h3>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 sm:px-3 sm:text-sm dark:bg-indigo-500/15 dark:text-indigo-300"
                >
                  {skill}
                </span>
              ))}
            </div>

          </div>
        )}

        {/* Social links */}
        {(profile.github ||
          profile.linkedin) && (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4 sm:mt-6 sm:gap-4 sm:pt-5 dark:border-slate-800">

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline sm:text-sm dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                GitHub ↗
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline sm:text-sm dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                LinkedIn ↗
              </a>
            )}

          </div>
        )}

      </section>

      {/* Success */}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-xs font-medium text-green-700 sm:px-4 sm:text-sm dark:border-green-900/50 dark:bg-green-950/30 dark:text-green-300">
          {success}
        </div>
      )}

      {/* Edit Profile Form */}
      {editing && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors sm:space-y-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
        >

          <div className="border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800">

            <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
              Edit Profile
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
              Keep your CampusConnect profile up to date.
            </p>

          </div>

          {/* Form error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-600 sm:text-sm dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Basic information */}
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                University
              </label>

              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                Course
              </label>

              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                Graduation Year
              </label>

              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                min="2000"
                max="2100"
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
              />
            </div>

          </div>

          {/* Bio */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
              Bio
            </label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength="500"
              rows="5"
              placeholder="Tell other students about yourself..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
              Skills
            </label>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Java, Python, MongoDB"
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
            />

            <p className="mt-1.5 text-[11px] text-slate-400 sm:text-xs dark:text-slate-500">
              Separate skills with commas.
            </p>
          </div>

          {/* Profile photo */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition-colors sm:p-4 dark:border-slate-800 dark:bg-slate-950">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h3 className="text-sm font-medium text-slate-800 sm:text-base dark:text-slate-100">
                  Profile Photo
                </h3>

                <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs dark:text-slate-400">
                  Choose a photo from your gallery or files.
                  JPG, PNG, WEBP or GIF, max 5 MB.
                </p>
              </div>

              <button
                type="button"
                disabled={uploadingImage}
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="w-full rounded-lg border border-indigo-200 bg-white px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 sm:w-auto disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-900/60 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
              >
                {uploadingImage
                  ? "Uploading..."
                  : "Choose Photo"}
              </button>

            </div>

          </div>

          {/* Social URLs */}
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2">

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                GitHub URL
              </label>

              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700 sm:text-sm dark:text-slate-200">
                LinkedIn URL
              </label>

              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
              />
            </div>

          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2.5 border-t border-slate-100 pt-4 sm:flex-row sm:gap-3 sm:pt-5 dark:border-slate-800">

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 sm:py-3 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => {
                setEditing(false);
                setError("");
              }}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:py-3 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Cancel
            </button>

          </div>

        </form>
      )}

    </div>
  );
}

export default Profile;