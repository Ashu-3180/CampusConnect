import { useState } from "react";
import { useNavigate } from "react-router-dom";

import collaborationService from "../services/collaborationService";

function CreateCollaboration() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      title: "",
      description: "",
      requiredSkills: "",
      maxMembers: 2,
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data =
        await collaborationService.createCollaboration(
          {
            title: formData.title,
            description: formData.description,
            requiredSkills: formData.requiredSkills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
            maxMembers: Number(
              formData.maxMembers
            ),
          }
        );

      navigate(
        `/app/collaborations/${data.collaboration._id}`
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl">

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

        <h1 className="text-2xl font-bold text-slate-900">
          Create Collaboration
        </h1>

        <p className="mt-1 text-slate-500">
          Describe your project and find the right teammates.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Project Title
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength="150"
              placeholder="Example: AI-Powered Study Assistant"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Project Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength="2000"
              rows="6"
              placeholder="Describe your idea, goals, and what you want to build..."
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Required Skills
            </label>

            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="React, Node.js, Python"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />

            <p className="mt-1 text-xs text-slate-400">
              Separate skills using commas.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Maximum Team Members
            </label>

            <input
              type="number"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleChange}
              min="2"
              max="20"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading
              ? "Creating Project..."
              : "Create Collaboration"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateCollaboration;