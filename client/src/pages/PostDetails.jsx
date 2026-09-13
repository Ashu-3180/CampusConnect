import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import postService from "../services/postService";

function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await postService.getPosts();

        const foundPost = data.posts?.find(
          (item) => item._id === postId
        );

        if (!foundPost) {
          throw new Error("Post not found");
        }

        setPost(foundPost);
      } catch (error) {
        setError(
          error.message || "Failed to fetch post"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-10 text-center">
        <p className="text-sm text-slate-500 sm:text-base dark:text-slate-400">
          Loading post...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          Post not found
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-0 sm:px-4 sm:py-4">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Post Details
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            View the full post and its author information.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Back
        </button>
      </div>

      {/* Post */}
      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">

        {/* Author section */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5 dark:border-slate-800">

          <Link
            to={`/app/profile/${post.author?._id}`}
            className="flex min-w-0 items-center gap-3 rounded-lg p-1 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {post.author?.profileImage ? (
              <img
                src={post.author.profileImage}
                alt={post.author.name}
                className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base font-semibold text-indigo-600 sm:h-12 sm:w-12 dark:bg-indigo-500/20 dark:text-indigo-300">
                {post.author?.name
                  ? post.author.name
                      .charAt(0)
                      .toUpperCase()
                  : "U"}
              </div>
            )}

            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base dark:text-white">
                {post.author?.name || "Unknown User"}
              </h2>

              <p className="truncate text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                {post.author?.university || "University not available"}
                {post.author?.course &&
                  ` • ${post.author.course}`}
              </p>
            </div>
          </Link>

          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600 sm:px-3 sm:text-xs dark:bg-indigo-500/15 dark:text-indigo-300">
            {post.category || "General"}
          </span>

        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">

          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 sm:text-base sm:leading-7 dark:text-slate-200">
            {post.content}
          </p>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800">

          <div className="flex items-center justify-between gap-3">

            <span className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
              ❤️ {post.likes?.length || 0}{" "}
              {post.likes?.length === 1
                ? "Like"
                : "Likes"}
            </span>

            {post.createdAt && (
              <span className="text-[11px] text-slate-400 sm:text-xs dark:text-slate-500">
                {new Date(
                  post.createdAt
                ).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}

          </div>

        </div>

      </article>

    </div>
  );
}

export default PostDetails;