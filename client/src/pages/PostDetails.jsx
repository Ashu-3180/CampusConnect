import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import postService from "../services/postService";

const MAX_COMMENT_LENGTH = 1000;

function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [likeLoading, setLikeLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] =
    useState(false);

  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError("Post ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await postService.getPostById(postId);

        if (!data?.post) {
          throw new Error("Post not found");
        }

        setPost(data.post);
      } catch (fetchError) {
        setError(
          fetchError.message ||
            "Failed to fetch post"
        );
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const isLiked = post?.likes?.some(
    (like) =>
      like === currentUserId ||
      like?._id === currentUserId ||
      String(like) === String(currentUserId) ||
      String(like?._id) === String(currentUserId)
  );

  const isCommentOwner = (comment) => {
    const commentUserId =
      comment.user?._id ||
      comment.user?.id ||
      comment.user;

    return (
      commentUserId === currentUserId ||
      String(commentUserId) ===
        String(currentUserId)
    );
  };

  const handleLike = async () => {
    if (!post?._id || likeLoading) return;

    setLikeLoading(true);

    try {
      const result = await postService.toggleLike(
        post._id
      );

      setPost((current) => {
        if (!current) return current;

        const likes = [...(current.likes || [])];

        if (result.liked) {
          const alreadyPresent = likes.some(
            (like) =>
              like === currentUserId ||
              like?._id === currentUserId ||
              String(like) ===
                String(currentUserId) ||
              String(like?._id) ===
                String(currentUserId)
          );

          if (!alreadyPresent && currentUserId) {
            likes.push(currentUserId);
          }
        } else {
          return {
            ...current,
            likes: likes.filter(
              (like) =>
                like !== currentUserId &&
                like?._id !== currentUserId &&
                String(like) !==
                  String(currentUserId) &&
                String(like?._id) !==
                  String(currentUserId)
            ),
          };
        }

        return {
          ...current,
          likes,
        };
      });
    } catch (likeError) {
      console.error(likeError);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    if (!post?._id) return;

    const text = commentText.trim();

    if (
      !text ||
      text.length > MAX_COMMENT_LENGTH
    ) {
      return;
    }

    setCommentLoading(true);

    try {
      const result = await postService.addComment(
        post._id,
        text
      );

      setPost((current) =>
        current
          ? {
              ...current,
              comments:
                result.comments ||
                result.post?.comments ||
                [],
            }
          : current
      );
      setCommentText("");
    } catch (commentError) {
      console.error(commentError);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (
    commentId
  ) => {
    if (!post?._id || !commentId) return;

    try {
      const result =
        await postService.deleteComment(
          post._id,
          commentId
        );

      setPost((current) =>
        current
          ? {
              ...current,
              comments:
                result.comments ||
                result.post?.comments ||
                [],
            }
          : current
      );
    } catch (commentError) {
      console.error(commentError);
    }
  };

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

  const comments = post.comments || [];
  const authorInitial = post.author?.name
    ? post.author.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="mx-auto w-full max-w-3xl px-0 sm:px-4 sm:py-4">

      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
            Post Details
          </h1>

          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            View the full post, media, likes, and comments.
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
                {authorInitial}
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

              {post.createdAt && (
                <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs dark:text-slate-500">
                  {new Date(
                    post.createdAt
                  ).toLocaleString()}
                </p>
              )}
            </div>
          </Link>

          <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-600 sm:px-3 sm:text-xs dark:bg-indigo-500/15 dark:text-indigo-300">
            {post.category || "General"}
          </span>

        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">

          {post.content && (
            <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 sm:text-base sm:leading-7 dark:text-slate-200">
              {post.content}
            </p>
          )}

          {post.media?.type === "image" &&
            post.media.url && (
              <div
                className={`overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 ${
                  post.content ? "mt-4" : ""
                }`}
              >
                <img
                  src={post.media.url}
                  alt="Post media"
                  className="max-h-[32rem] w-full object-contain bg-slate-50 dark:bg-slate-950"
                />
              </div>
            )}

          {post.media?.type === "video" &&
            post.media.url && (
              <div
                className={`overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 ${
                  post.content ? "mt-4" : ""
                }`}
              >
                <video
                  src={post.media.url}
                  controls
                  className="max-h-[32rem] w-full bg-slate-50 dark:bg-slate-950"
                />
              </div>
            )}

        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4 dark:border-slate-800">
          <button
            type="button"
            onClick={handleLike}
            disabled={likeLoading}
            className={`text-sm font-medium transition-colors disabled:opacity-60 ${
              isLiked
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {isLiked ? "♥ Liked" : "♡ Like"}
            {" "}
            ({post.likes?.length || 0})
          </button>

          <span className="text-sm text-slate-500 dark:text-slate-400">
            {comments.length}{" "}
            {comments.length === 1
              ? "comment"
              : "comments"}
          </span>
        </div>

        {/* Comments */}
        <div className="space-y-4 border-t border-slate-100 px-4 py-4 sm:px-6 sm:py-5 dark:border-slate-800">
          {comments.length > 0 && (
            <ul className="space-y-3">
              {comments.map((comment) => {
                const commentInitial =
                  comment.user?.name
                    ? comment.user.name
                        .charAt(0)
                        .toUpperCase()
                    : "U";

                return (
                  <li
                    key={comment._id}
                    className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                          {commentInitial}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white">
                            {comment.user?.name ||
                              "Unknown User"}
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {comment.text}
                          </p>

                          {comment.createdAt && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                              {new Date(
                                comment.createdAt
                              ).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {isCommentOwner(comment) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteComment(
                              comment._id
                            )
                          }
                          className="shrink-0 text-xs text-slate-500 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <form
            onSubmit={handleAddComment}
            className="space-y-2"
          >
            <textarea
              value={commentText}
              onChange={(event) =>
                setCommentText(
                  event.target.value.slice(
                    0,
                    MAX_COMMENT_LENGTH
                  )
                )
              }
              maxLength={MAX_COMMENT_LENGTH}
              rows="2"
              placeholder="Write a comment..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {commentText.length}/
                {MAX_COMMENT_LENGTH}
              </p>

              <button
                type="submit"
                disabled={
                  commentLoading ||
                  !commentText.trim()
                }
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {commentLoading
                  ? "Posting..."
                  : "Comment"}
              </button>
            </div>
          </form>
        </div>

      </article>

    </div>
  );
}

export default PostDetails;
