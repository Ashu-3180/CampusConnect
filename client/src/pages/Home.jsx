import { useEffect, useState } from "react";

import CreatePost from "../components/posts/CreatePost";
import PostCard from "../components/posts/PostCard";

import postService from "../services/postService";

function Home() {
  const [posts, setPosts] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await postService.getPosts();

      setPosts(data.posts);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (
    postData
  ) => {
    const data =
      await postService.createPost(postData);

    setPosts((currentPosts) => [
      data.post,
      ...currentPosts,
    ]);
  };

  const handleLike = async (postId) => {
    await postService.toggleLike(postId);
    await loadPosts();
  };

  const handleDelete = async (postId) => {
    await postService.deletePost(postId);

    setPosts((currentPosts) =>
      currentPosts.filter(
        (post) => post._id !== postId
      )
    );
  };

  const handleUpdate = async (
    postId,
    postData
  ) => {
    const data =
      await postService.updatePost(
        postId,
        postData
      );

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post._id === postId
          ? data.post
          : post
      )
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="px-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
          Campus Feed
        </h1>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
          See what's happening in your student community.
        </p>
      </div>

      {/* Create Post */}
      <CreatePost
        onCreatePost={handleCreatePost}
      />

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 sm:p-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400 sm:py-10">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (

        /* Empty state */
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center transition-colors dark:border-slate-700 dark:bg-slate-900 sm:p-10">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-lg dark:bg-indigo-500/10 sm:h-14 sm:w-14 sm:text-xl">
            📝
          </div>

          <h3 className="mt-3 text-sm font-semibold text-slate-700 dark:text-white sm:mt-4 sm:text-base">
            No posts yet
          </h3>

          <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:mt-2 sm:text-sm">
            Be the first person to start a conversation!
          </p>

        </div>
      ) : (

        /* Posts */
        <div className="space-y-4 sm:space-y-5">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onLike={handleLike}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </div>

      )}

    </div>
  );
}

export default Home;