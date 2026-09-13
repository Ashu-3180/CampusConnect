import postService from "../services/postService";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import PostCard from "../components/posts/PostCard";
import connectionService from "../services/connectionService";

function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const isOwnProfile =
    user?._id === id ||
    user?.id === id;

  useEffect(() => {
    if (isOwnProfile) {
      navigate("/app/profile", {
        replace: true,
      });
    }
  }, [isOwnProfile, navigate]);

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
      setError(
        error.message ||
          "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOwnProfile) {
      loadProfile();
    }
  }, [id, isOwnProfile]);

  const handleLike = async (postId) => {
    try {
      await postService.toggleLike(postId);
      await loadProfile();
    } catch (error) {
      setError(
        error.message ||
          "Failed to update post"
      );
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionLoading(true);
      setError("");

      await connectionService.sendConnectionRequest(
        id
      );

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

      await connectionService.cancelConnectionRequest(
        id
      );

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

      await connectionService.acceptConnectionRequest(
        id
      );

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

      await connectionService.rejectConnectionRequest(
        id
      );

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
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-10 text-center">
        <p className="text-sm text-slate-500 sm:text-base dark:text-slate-400">
          Loading profile...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-500 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error || "User not found"}
        </div>
      </div>
    );
  }

  const initial = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 sm:space-y-6">

      {/* Profile Header */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors sm:p-6 dark:border-slate-800 dark:bg-slate-900">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between sm:gap-6">

          {/* Profile identity */}
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-5">

            {profile.profileImage ? (
              <img
                src={profile.profileImage}
                alt={profile.name}
                className="h-18 w-18 shrink-0 rounded-full object-cover ring-4 ring-indigo-50 sm:h-20 sm:w-20 dark:ring-indigo-500/10"
              />
            ) : (
              <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-600 sm:h-20 sm:w-20 sm:text-3xl dark:bg-indigo-500/20 dark:text-indigo-300">
                {initial}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
                {profile.name}
              </h1>

              {profile.course && (
                <p className="mt-0.5 text-sm text-slate-600 sm:mt-1 sm:text-base dark:text-slate-300">
                  {profile.course}
                </p>
              )}

              {profile.university && (
                <p className="truncate text-xs text-slate-400 sm:text-sm dark:text-slate-500">
                  {profile.university}
                </p>
              )}

              {profile.graduationYear && (
                <p className="text-xs text-slate-400 sm:text-sm dark:text-slate-500">
                  Graduating{" "}
                  {profile.graduationYear}
                </p>
              )}
            </div>

          </div>

          {/* Connection actions */}
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">

            {connectionStatus.isConnected ? (
              <>
                <div className="flex-1 rounded-lg bg-green-100 px-4 py-2.5 text-center text-xs font-medium text-green-700 sm:flex-none sm:py-2 sm:text-sm dark:bg-green-500/15 dark:text-green-400">
                  Connected ✓
                </div>

                <button
                  type="button"
                  onClick={handleMessage}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-indigo-700 sm:flex-none sm:py-2 sm:text-sm"
                >
                  Message
                </button>
              </>
            ) : connectionStatus.requestSent ? (
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={connectionLoading}
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:w-auto sm:py-2 sm:text-sm dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
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
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:flex-none sm:py-2 sm:text-sm"
                >
                  {connectionLoading
                    ? "Processing..."
                    : "Accept"}
                </button>

                <button
                  type="button"
                  onClick={handleRejectRequest}
                  disabled={connectionLoading}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 sm:flex-none sm:py-2 sm:text-sm dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Reject
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnect}
                disabled={connectionLoading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:w-auto sm:py-2 sm:text-sm"
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
          <div className="mt-5 border-t border-slate-100 pt-4 sm:mt-6 sm:pt-5 dark:border-slate-800">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:text-sm dark:text-slate-500">
              About
            </h3>

            <p className="mt-1.5 text-sm leading-6 text-slate-600 sm:mt-2 sm:text-base sm:leading-relaxed dark:text-slate-300">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Skills */}
        {profile.skills?.length > 0 && (
          <div className="mt-5 sm:mt-6">
            <h3 className="mb-2.5 text-sm font-semibold text-slate-800 sm:mb-3 sm:text-base dark:text-white">
              Skills
            </h3>

            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 sm:px-3 sm:text-sm dark:bg-indigo-500/15 dark:text-indigo-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Social links */}
        {(profile.github ||
          profile.linkedin) && (
          <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4 sm:mt-6 sm:gap-4 sm:pt-5 dark:border-slate-800">

            {profile.github && (
              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline sm:text-sm dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                GitHub ↗
              </a>
            )}

            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline sm:text-sm dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                LinkedIn ↗
              </a>
            )}

          </div>
        )}

      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs font-medium text-red-600 sm:px-4 sm:text-sm dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Posts */}
      <section>
        <div className="mb-3 sm:mb-4">
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl dark:text-white">
            Posts by {profile.name}
          </h2>

          <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm dark:text-slate-400">
            Recent activity shared with the campus community.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center transition-colors sm:p-10 dark:border-slate-700 dark:bg-slate-900">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-lg sm:h-14 sm:w-14 sm:text-xl dark:bg-indigo-500/10">
              📝
            </div>

            <h3 className="mt-3 text-sm font-semibold text-slate-800 sm:mt-4 sm:text-base dark:text-white">
              No posts yet
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm dark:text-slate-400">
              {profile.name} hasn't shared any posts yet.
            </p>

          </div>
        ) : (
          <div className="space-y-3 sm:space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </section>

    </div>
  );
}

export default UserProfile;