import { useState } from "react";

function CreatePost({ onCreatePost }) {
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState("General");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim()) {
      setError("Please write something before posting.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onCreatePost({
        content,
        category,
      });

      setContent("");
      setCategory("General");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Share something with your campus..."
          maxLength="1000"
          rows="4"
          className="w-full resize-none rounded-lg border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        />

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="General">
                General
              </option>

              <option value="Question">
                Question
              </option>

              <option value="Project">
                Project
              </option>

              <option value="Achievement">
                Achievement
              </option>

              <option value="Announcement">
                Announcement
              </option>
            </select>

            <span className="text-xs text-slate-400">
              {content.length}/1000
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default CreatePost;