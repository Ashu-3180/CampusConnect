import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function PostDetails() {
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          `http://localhost:5000/api/posts/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch post"
          );
        }

        setPost(data.post);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="p-6">
        Loading post...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        Post not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-800">
        Post Details
      </h1>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">
              {post.author?.name}
            </h2>

            <p className="text-sm text-slate-500">
              {post.author?.university}
              {post.author?.course &&
                ` • ${post.author.course}`}
            </p>
          </div>

          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600">
            {post.category}
          </span>
        </div>

        <p className="mb-4 whitespace-pre-wrap text-slate-700">
          {post.content}
        </p>

        <div className="border-t border-slate-200 pt-4 text-sm text-slate-500">
          ❤️ {post.likes?.length || 0} Likes
        </div>
      </div>
    </div>
  );
}

export default PostDetails;