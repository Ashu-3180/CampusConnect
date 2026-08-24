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
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Campus Feed
        </h1>

        <p className="mt-1 text-slate-500">
          See what's happening in your student community.
        </p>
      </div>

      <CreatePost
        onCreatePost={handleCreatePost}
      />

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-slate-500">
          Loading posts...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="font-semibold text-slate-700">
            No posts yet
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Be the first person to start a conversation!
          </p>
        </div>
      ) : (
        <div className="space-y-5">
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