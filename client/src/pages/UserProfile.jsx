import postService from "../services/postService";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import userService from "../services/userService";
import PostCard from "../components/posts/PostCard";
import connectionService from "../services/connectionService";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

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
      setPosts(data.posts || []);
      setConnectionStatus(
        data.connectionStatus || {
          isConnected: false,
          requestSent: false,
          requestReceived: false,
        }
      );
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

  const handleMessage = () => {
    navigate(`/app/messages/${id}`);
  };

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500 dark:text-slate-400">
        Loading profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-10 text-center text-red-500 dark:text-red-400">
        {error || "User not found"}
      </div>
    );
  }

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">

      {/* Profile Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

          {/* Profile identity */}
          <div className="flex min-w-0 gap-5">

            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-indigo-500/10"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-3xl font-bold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                {initial}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h1>

              <p className="mt-1 text-slate-600 dark:text-slate-300">
                {profile.course}
              </p>

              <p className="text-sm text-slate-400 dark:text-slate-500">
                {profile.university}
              </p>

              <p className="text-sm text-slate-400 dark:text-slate-500">
                Graduating {profile.graduationYear}
              </p>
            </div>
          </div>

          {/* Connection actions */}
          <div className="flex shrink-0 flex-wrap gap-2">

            {connectionStatus.isConnected ? (
              <>
                <div className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 dark:bg-green-500/15 dark:text-green-400">
                  Connected ✓
                </div>

                <button
                  type="button"
                  onClick={handleMessage}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
                >
                  Message
                </button>
              </>
            ) : connectionStatus.requestSent ? (
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={connectionLoading}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {connectionLoading
                  ? "Processing..."
                  : "Cancel Request"}
              </button>
            ) : connectionStatus.requestReceived ? (
              <>
                <button
                  type="button"
                  onClick={handleAcceptRequest}
                  disabled={connectionLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
                >
                  {connectionLoading
                    ? "Processing..."
                    : "Accept"}
                </button>

                <button
                  type="button"
                  onClick={handleRejectRequest}
                  disabled={connectionLoading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Reject
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={connectionLoading}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
              >
                {connectionLoading
                  ? "Processing..."
                  : "Connect"}
              </button>
            )}

          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              About
            </h3>

            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 font-semibold text-slate-800 dark:text-white">
              Skills
            </h3>

            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {(profile.github || profile.linkedin) && (
          <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5 dark:border-slate-800">

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                GitHub ↗
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                LinkedIn ↗
              </a>
            )}

          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Posts */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Posts by {profile.name}
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Recent activity shared with the campus community.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center transition-colors dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-xl dark:bg-indigo-500/10">
              📝
            </div>

            <h3 className="mt-4 font-semibold text-slate-800 dark:text-white">
              No posts yet
            </h3>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {profile.name} hasn't shared any posts yet.
            </p>
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
      </section>

    </div>
  );
}

export default UserProfile;