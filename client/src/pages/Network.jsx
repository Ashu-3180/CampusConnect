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
      <div className="flex justify-center py-20 text-slate-500 dark:text-slate-400">
        Loading your network...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
          My Network
        </h1>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Manage your connections and connection requests.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Connection Requests */}
      <section className="mb-10">

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            Connection Requests
          </h2>

          <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            {requests.length}
          </span>
        </div>

        {requests.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No pending connection requests.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {requests.map((user) => (
              <div
                key={user._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
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
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                        👤
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                        {user.name}
                      </h3>

                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {user.university}
                      </p>
                    </div>

                  </div>

                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                    {user.course}
                  </p>

                  {user.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {user.skills
                        .slice(0, 4)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </Link>

                <div className="mt-5 flex gap-3">

                  <button
                    type="button"
                    onClick={() =>
                      handleAccept(user._id)
                    }
                    disabled={
                      actionLoading === user._id
                    }
                    className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
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
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
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

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">
            My Connections
          </h2>

          <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-600 dark:bg-green-500/15 dark:text-green-400">
            {connections.length}
          </span>
        </div>

        {connections.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            You don't have any connections yet. Discover students and start networking!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

            {connections.map((user) => (
              <div
                key={user._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
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
                        className="h-14 w-14 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-xl text-green-600 dark:bg-green-500/15 dark:text-green-400">
                        👤
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-slate-800 dark:text-white">
                        {user.name}
                      </h3>

                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {user.university}
                      </p>

                      <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                        {user.course}
                      </p>
                    </div>

                  </div>

                  {user.skills?.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {user.skills
                        .slice(0, 5)
                        .map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-600 dark:bg-green-500/15 dark:text-green-400"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  )}
                </Link>

                <Link
                  to={`/app/messages/${user._id}`}
                  className="mt-5 block rounded-lg bg-indigo-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-indigo-700"
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