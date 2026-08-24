import { useEffect, useState } from "react";

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
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data =
          await userService.getMyProfile();

        setProfile(data.user);

        setFormData({
          name: data.user.name || "",
          university: data.user.university || "",
          course: data.user.course || "",
          graduationYear:
            data.user.graduationYear || "",
          bio: data.user.bio || "",
          skills: data.user.skills?.join(", ") || "",
          github: data.user.github || "",
          linkedin: data.user.linkedin || "",
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

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
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-10 text-center text-red-500">
        {error || "Profile not found"}
      </div>
    );
  }

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

          <div className="flex gap-5">

            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
              {initial}
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                {profile.name}
              </h1>

              <p className="mt-1 text-slate-500">
                {profile.course}
              </p>

              <p className="text-sm text-slate-400">
                {profile.university}
              </p>

              <p className="text-sm text-slate-400">
                Graduating {profile.graduationYear}
              </p>

            </div>

          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>

        </div>

        {profile.bio && (
          <p className="mt-6 border-t border-slate-100 pt-5 leading-relaxed text-slate-600">
            {profile.bio}
          </p>
        )}

        {profile.skills?.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold text-slate-800">
              Skills
            </h3>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-sm text-indigo-600"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {(profile.github || profile.linkedin) && (
          <div className="mt-6 flex flex-wrap gap-4">

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                GitHub
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                LinkedIn
              </a>
            )}

          </div>
        )}

      </div>

      {editing && (
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >

          <h2 className="text-xl font-bold text-slate-900">
            Edit Profile
          </h2>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm font-medium">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                University
              </label>

              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Course
              </label>

              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Graduation Year
              </label>

              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              />
            </div>

          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Bio
            </label>

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              maxLength="500"
              rows="4"
              placeholder="Tell other students about yourself..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Skills
            </label>

            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="React, Java, Python, MongoDB"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />

            <p className="mt-1 text-xs text-slate-400">
              Separate skills with commas.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-1 block text-sm font-medium">
                GitHub URL
              </label>

              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                LinkedIn URL
              </label>

              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              />
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </form>
      )}

    </div>
  );
}

export default Profile;