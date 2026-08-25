import postService from "../services/postService";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import userService from "../services/userService";
import PostCard from "../components/posts/PostCard";
import connectionService from "../services/connectionService";

function UserProfile() {
  const { id } = useParams();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);

  const [connectionStatus, setConnectionStatus] =
    useState({
      isConnected: false,
      requestSent: false,
      requestReceived: false,
    });

  const [connectionLoading, setConnectionLoading] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await userService.getUserProfile(id);

      setProfile(data.user);
      setPosts(data.posts);
      setConnectionStatus(data.connectionStatus);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [id]);

  const handleLike = async (postId) => {
    try {
      await postService.toggleLike(postId);
      await loadProfile();
    } catch (error) {
      setError(
        error.message || "Failed to update post"
      );
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionLoading(true);
      setError("");

      await connectionService.sendConnectionRequest(id);

      await loadProfile();
    } catch (error) {
      setError(
        error.message ||
          "Failed to send connection request"
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setConnectionLoading(true);
      setError("");

      await connectionService.cancelConnectionRequest(id);

      await loadProfile();
    } catch (error) {
      setError(
        error.message ||
          "Failed to cancel connection request"
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    try {
      setConnectionLoading(true);
      setError("");

      await connectionService.acceptConnectionRequest(id);

      await loadProfile();
    } catch (error) {
      setError(
        error.message ||
          "Failed to accept connection request"
      );
    } finally {
      setConnectionLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    try {
      setConnectionLoading(true);
      setError("");

      await connectionService.rejectConnectionRequest(id);

      await loadProfile();
    } catch (error) {
      setError(
        error.message ||
          "Failed to reject connection request"
      );
    } finally {
      setConnectionLoading(false);
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
        {error || "User not found"}
      </div>
    );
  }

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="flex items-start justify-between gap-5">

      <div className="flex gap-5">

        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600">
          {initial}
        </div>

        <div>

          <h1 className="text-2xl font-bold text-slate-900">
            {profile.name}
          </h1>

          <p className="mt-1 text-slate-600">
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

      <div className="flex shrink-0 gap-2">
        {connectionStatus.isConnected ? (
          <button
            disabled
            className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700"
          >
            Connected ✓
          </button>
        ) : connectionStatus.requestSent ? (
          <button
            onClick={handleCancelRequest}
            disabled={connectionLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {connectionLoading
              ? "Processing..."
              : "Cancel Request"}
          </button>
        ) : connectionStatus.requestReceived ? (
          <>
            <button
              onClick={handleAcceptRequest}
              disabled={connectionLoading}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {connectionLoading
                ? "Processing..."
                : "Accept"}
            </button>

            <button
              onClick={handleRejectRequest}
              disabled={connectionLoading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Reject
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connectionLoading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {connectionLoading
              ? "Processing..."
              : "Connect"}
          </button>
        )}
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
          <div className="mt-6 flex gap-4">

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 hover:underline"
              >
                GitHub
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 hover:underline"
              >
                LinkedIn
              </a>
            )}

          </div>
        )}

      <div>

        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Posts by {profile.name}
        </h2>

        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No posts yet.
          </div>
        ) : (
          <div className="space-y-5">

            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
                onDelete={() => {}}
                onUpdate={() => {}}
              />
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default UserProfile;