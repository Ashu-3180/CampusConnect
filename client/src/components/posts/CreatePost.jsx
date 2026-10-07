import { useEffect, useRef, useState } from "react";

const MAX_CONTENT_LENGTH = 5000;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const VIDEO_TYPES = ["video/mp4", "video/webm"];

const isImageFile = (file) =>
  IMAGE_TYPES.includes(file?.type);

const isVideoFile = (file) =>
  VIDEO_TYPES.includes(file?.type);

function CreatePost({ onCreatePost }) {
  const [content, setContent] = useState("");
  const [category, setCategory] =
    useState("General");
  const [mediaFile, setMediaFile] =
    useState(null);
  const [previewUrl, setPreviewUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const clearMedia = () => {
    setMediaFile(null);
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMediaChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const image = isImageFile(file);
    const video = isVideoFile(file);

    if (!image && !video) {
      setError(
        "Please select one JPG, PNG, WEBP image or one MP4/WEBM video."
      );
      event.target.value = "";
      return;
    }

    if (image && file.size > MAX_IMAGE_BYTES) {
      setError("Images must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (video && file.size > MAX_VIDEO_BYTES) {
      setError("Videos must be 50 MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setMediaFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveMedia = () => {
    clearMedia();
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedContent = content.trim();

    if (!trimmedContent && !mediaFile) {
      setError(
        "Please write something or add a photo or video before posting."
      );
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(
        `Posts can be at most ${MAX_CONTENT_LENGTH} characters.`
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      await onCreatePost({
        content,
        category,
        mediaFile,
      });

      setContent("");
      setCategory("General");
      clearMedia();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const canSubmit =
    Boolean(content.trim() || mediaFile) &&
    !loading;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="Share something with your campus..."
          maxLength={MAX_CONTENT_LENGTH}
          rows="4"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white p-3 text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
        />

        {previewUrl && mediaFile && (
          <div className="relative mt-3 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            {isImageFile(mediaFile) ? (
              <img
                src={previewUrl}
                alt="Selected media preview"
                className="max-h-80 w-full object-contain bg-slate-50 dark:bg-slate-950"
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="max-h-80 w-full bg-slate-50 dark:bg-slate-950"
              />
            )}

            <button
              type="button"
              onClick={handleRemoveMedia}
              disabled={loading}
              className="absolute right-2 top-2 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-slate-900 disabled:opacity-60 dark:bg-slate-800/90 dark:hover:bg-slate-800"
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
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

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,.jpg,.jpeg"
              onChange={handleMediaChange}
              className="hidden"
            />

            <button
              type="button"
              disabled={loading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-indigo-500 hover:text-indigo-600 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
            >
              {mediaFile
                ? "Change media"
                : "Add photo or video"}
            </button>

            <span className="text-xs text-slate-400">
              {content.length}/{MAX_CONTENT_LENGTH}
            </span>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default CreatePost;
