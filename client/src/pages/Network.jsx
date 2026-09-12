import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import connectionService from "../services/connectionService";

function Network() {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const loadNetworkData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        connectionsData,
        requestsData,
      ] = await Promise.all([
        connectionService.getMyConnections(),
        connectionService.getReceivedRequests(),
      ]);

      setConnections(connectionsData);
      setRequests(requestsData);
    } catch (error) {
      setError(
        error.message ||
          "Failed to load network data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkData();
  }, []);

  const handleAccept = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");

      await connectionService.acceptConnectionRequest(
        userId
      );

      await loadNetworkData();
    } catch (error) {
      setError(
        error.message ||
          "Failed to accept connection request"
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleReject = async (userId) => {
    try {
      setActionLoading(userId);
      setError("");

      await connectionService.rejectConnectionRequest(
        userId
      );

      await loadNetworkData();
    } catch (error) {
      setError(
        error.message ||
          "Failed to reject connection request"
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4 py-12 text-center text-sm text-slate-500 sm:py-20 sm:text-base dark:text-slate-400">
        Loading your network...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl dark:text-white">
          My Network
        </h1>

        <p className="mt-1.5 text-sm leading-5 text-slate-500 sm:mt-2 sm:text-base dark:text-slate-400">
          Manage your connections and connection requests.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-600 sm:mb-6 sm:rounded-lg sm:p-4 sm:text-base dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Connection Requests */}
      <section className="mb-8 sm:mb-10">

        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-base font-bold text-slate-800 sm:text-xl dark:text-white">
            Connection Requests
          </h2>

          <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-600 sm:px-3 sm:text-sm dark:bg-indigo-500/15 dark:text-indigo-300">
            {requests.length}
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-5 text-slate-500 transition-colors sm:p-6 sm:text-base dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No pending connection requests.
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">

            {requests.map((user) => (
              <div
                key={user._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >

                <Link
                  to={`/app/profile/${user._id}`}
                  className="block"
                >
                  <div className="flex items-center gap-3">

                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-base text-indigo-600 sm:h-12 sm:w-12 sm:text-lg dark:bg-indigo-500/20 dark:text-indigo-300">
                        👤
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-800 sm:text-base dark:text-white">
                        {user.name}
                      </h3>

                      <p className="truncate text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        {user.university}
                      </p>
                    </div>

                  </div>

                  <p className="mt-2.5 text-xs leading-5 text-slate-600 sm:mt-3 sm:text-sm dark:text-slate-300">
                    {user.course}
                  </p>

                  {user.skills?.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1.5 sm:mt-3 sm:gap-2">
                      {user.skills
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] text-indigo-600 sm:px-3 sm:text-xs dark:bg-indigo-500/15 dark:text-indigo-300"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </Link>

                <div className="mt-4 flex gap-2.5 sm:mt-5 sm:gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      handleAccept(user._id)
                    }
                    disabled={
                      actionLoading === user._id
                    }
                    className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60 sm:px-4 sm:text-sm"
                  >
                    {actionLoading === user._id
                      ? "Processing..."
                      : "Accept"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleReject(user._id)
                    }
                    disabled={
                      actionLoading === user._id
                    }
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 sm:px-4 sm:text-sm dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Reject
                  </button>

                </div>

              </div>
            ))}

          </div>
        )}

      </section>

      {/* My Connections */}
      <section>

        <div className="mb-3 flex items-center justify-between sm:mb-4">
          <h2 className="text-base font-bold text-slate-800 sm:text-xl dark:text-white">
            My Connections
          </h2>

          <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-600 sm:px-3 sm:text-sm dark:bg-green-500/15 dark:text-green-400">
            {connections.length}
          </span>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm leading-5 text-slate-500 transition-colors sm:p-6 sm:text-base dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            You don't have any connections yet. Discover students and start networking!
          </div>
        ) : (
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">

            {connections.map((user) => (
              <div
                key={user._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >

                <Link
                  to={`/app/profile/${user._id}`}
                  className="block"
                >
                  <div className="flex items-center gap-3">

                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg text-green-600 sm:h-14 sm:w-14 sm:text-xl dark:bg-green-500/15 dark:text-green-400">
                        👤
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-800 sm:text-base dark:text-white">
                        {user.name}
                      </h3>

                      <p className="truncate text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        {user.university}
                      </p>

                      <p className="truncate text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                        {user.course}
                      </p>
                    </div>

                  </div>

                  {user.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
                      {user.skills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] text-green-600 sm:px-3 sm:text-xs dark:bg-green-500/15 dark:text-green-400"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </Link>

                <Link
                  to={`/app/messages/${user._id}`}
                  className="mt-4 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-medium text-white transition hover:bg-indigo-700 sm:mt-5 sm:px-4 sm:text-sm"
                >
                  Message
                </Link>

              </div>
            ))}

          </div>
        )}

      </section>

    </div>
  );
}

export default Network;