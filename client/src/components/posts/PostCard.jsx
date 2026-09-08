import { useState } from "react";

import { useAuth } from "../../context/AuthContext";

import { Link } from "react-router-dom";

function PostCard({
  post,
  onLike,
  onDelete,
  onUpdate,
}) {
  const { user } = useAuth();

  const [isEditing, setIsEditing] =
    useState(false);

  const [editContent, setEditContent] =
    useState(post.content);

  const [loading, setLoading] =
    useState(false);

  const isOwner =
    post.author?._id === user?._id ||
    post.author?._id === user?.id;

  const currentUserId =
    user?._id || user?.id;

  const isLiked = post.likes?.some(
    (like) =>
      like === currentUserId ||
      like?._id === currentUserId
  );

  const handleLike = async () => {
    try {
      await onLike(post._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      await onDelete(post._id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    setLoading(true);

    try {
      await onUpdate(post._id, {
        content: editContent,
      });

      setIsEditing(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const initial = post.author?.name
    ? post.author.name.charAt(0).toUpperCase()
    : "U";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <Link
          to={`/app/profile/${post.author?._id}`}
          className="flex gap-3"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            {initial}
          </div>

          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">
              {post.author?.name || "Unknown User"}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {post.author?.university}
              {post.author?.course &&
                ` • ${post.author.course}`}
            </p>

            <p className="text-xs text-slate-500 dark:text-slate-500">
              {new Date(
                post.createdAt
              ).toLocaleString()}
            </p>
          </div>
        </Link>

        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
          {post.category}
        </span>
      </div>

      <div className="mt-5">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(event) =>
              setEditContent(event.target.value)
            }
            className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none transition-colors focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            rows="4"
          />
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200">
            {post.content}
          </p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
        <button
          onClick={handleLike}
          className={`text-sm font-medium transition-colors ${
            isLiked
              ? "text-indigo-600 dark:text-indigo-400"
              : "text-slate-500 dark:text-slate-400"
          }`}
        >
          {isLiked ? "♥ Liked" : "♡ Like"}
          {" "}
          ({post.likes?.length || 0})
        </button>

        {isOwner && !isEditing && (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm text-slate-500 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            >
              Edit
            </button>

            <button
              onClick={handleDelete}
              className="text-sm text-slate-500 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
            >
              Delete
            </button>
          </>
        )}

        {isEditing && (
          <>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="text-sm font-medium text-indigo-600"
            >
              {loading ? "Saving..." : "Save"}
            </button>

            <button
              onClick={() => {
                setEditContent(post.content);
                setIsEditing(false);
              }}
              className="text-sm text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default PostCard;