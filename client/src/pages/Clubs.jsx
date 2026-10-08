import { useEffect, useMemo, useState } from "react";

import clubService from "../services/clubService";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "All",
  "Academic",
  "Technology",
  "Cultural",
  "Sports",
  "Career",
  "Social",
  "Other",
];

const emptyForm = {
  name: "",
  description: "",
  category: "Technology",
};

function Clubs() {
  const { user } = useAuth();

  const [clubs, setClubs] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("browse");

  const [showCreateModal, setShowCreateModal] =
    useState(false);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);

  const userId = user?._id ? String(user._id) : null;

  const loadClubs = async () => {
    try {
      setLoading(true);
      setError("");

      const [allClubsData, myClubsData] =
        await Promise.all([
          clubService.getClubs(
            search.trim(),
            category !== "All" ? category : ""
          ),
          clubService.getMyClubs(),
        ]);

      setClubs(allClubsData.clubs || []);
      setMyClubs(myClubsData.clubs || []);
    } catch (loadError) {
      setError(
        loadError.message || "Failed to load clubs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadClubs();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const getCreator = (club) => {
    if (
      club?.creator &&
      typeof club.creator === "object"
    ) {
      return club.creator;
    }

    return null;
  };

  const isCreator = (club) => {
    const creator = getCreator(club);
    const creatorId =
      creator?._id ||
      (typeof club?.creator === "string"
        ? club.creator
        : null);

    return (
      creatorId &&
      userId &&
      String(creatorId) === userId
    );
  };

  const isMember = (club) => {
    if (!Array.isArray(club?.members) || !userId) {
      return false;
    }

    return club.members.some((member) => {
      const memberId =
        typeof member === "object"
          ? member?._id
          : member;

      return (
        memberId && String(memberId) === userId
      );
    });
  };

  const getMemberCount = (club) => {
    if (!Array.isArray(club?.members)) {
      return 0;
    }

    return club.members.length;
  };

  const visibleClubs = useMemo(() => {
    const source =
      activeTab === "my" ? myClubs : clubs;

    if (activeTab !== "my") {
      return source;
    }

    const query = search.trim().toLowerCase();

    return source.filter((club) => {
      const matchesCategory =
        category === "All" ||
        club.category === category;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const name = String(club.name || "").toLowerCase();
      const description = String(
        club.description || ""
      ).toLowerCase();

      return (
        name.includes(query) ||
        description.includes(query)
      );
    });
  }, [activeTab, clubs, myClubs, search, category]);

  const handleCreateClub = async (event) => {
    event.preventDefault();
    setFormError("");

    const name = form.name.trim();
    const description = form.description.trim();

    if (!name || !description) {
      setFormError(
        "Please fill in all required fields."
      );
      return;
    }

    if (name.length < 2) {
      setFormError(
        "Club name must be at least 2 characters."
      );
      return;
    }

    if (description.length < 10) {
      setFormError(
        "Description must be at least 10 characters."
      );
      return;
    }

    try {
      setCreating(true);

      const data = await clubService.createClub({
        name,
        description,
        category: form.category,
      });

      if (data.club) {
        setClubs((previous) => [data.club, ...previous]);
        setMyClubs((previous) => [
          data.club,
          ...previous,
        ]);
      }

      setForm(emptyForm);
      setShowCreateModal(false);
    } catch (createError) {
      setFormError(
        createError.message || "Failed to create club"
      );
    } finally {
      setCreating(false);
    }
  };

  const syncClubLists = (updatedClub) => {
    if (!updatedClub?._id) {
      return;
    }

    const upsert = (list) => {
      const exists = list.some(
        (club) => club._id === updatedClub._id
      );

      if (!exists) {
        return [updatedClub, ...list];
      }

      return list.map((club) =>
        club._id === updatedClub._id
          ? updatedClub
          : club
      );
    };

    setClubs((previous) => upsert(previous));

    const stillMember = isMember(updatedClub);

    setMyClubs((previous) => {
      if (stillMember || isCreator(updatedClub)) {
        return upsert(previous);
      }

      return previous.filter(
        (club) => club._id !== updatedClub._id
      );
    });
  };

  const handleJoin = async (clubId) => {
    try {
      setActionLoading(clubId);
      setError("");

      const data = await clubService.joinClub(clubId);

      if (data.club) {
        syncClubLists(data.club);
      } else {
        await loadClubs();
      }
    } catch (joinError) {
      setError(
        joinError.message || "Failed to join club"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (clubId) => {
    try {
      setActionLoading(clubId);
      setError("");

      const data = await clubService.leaveClub(clubId);

      if (data.club) {
        syncClubLists(data.club);
      } else {
        setMyClubs((previous) =>
          previous.filter((club) => club._id !== clubId)
        );
        await loadClubs();
      }
    } catch (leaveError) {
      setError(
        leaveError.message || "Failed to leave club"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Clubs
          </h1>

          <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
            Browse campus clubs, join communities, and
            create your own group.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setForm(emptyForm);
            setShowCreateModal(true);
          }}
          className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:w-auto sm:px-5"
        >
          + Create Club
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900 sm:mt-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("browse");
            setSearch("");
            setCategory("All");
          }}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:py-2.5 sm:text-sm ${
            activeTab === "browse"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Browse Clubs
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("my");
            setSearch("");
            setCategory("All");
          }}
          className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition sm:px-4 sm:py-2.5 sm:text-sm ${
            activeTab === "my"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          My Clubs
        </button>
      </div>

      {/* Filters */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:mt-6 sm:p-4">
        <div className="flex flex-col gap-2.5 sm:gap-3 md:flex-row">
          <div className="flex-1">
            <label htmlFor="club-search" className="sr-only">
              Search clubs
            </label>

            <input
              id="club-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search clubs by name or description..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
            />
          </div>

          <div className="md:w-52">
            <label
              htmlFor="club-category"
              className="sr-only"
            >
              Filter by category
            </label>

            <select
              id="club-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-500/20"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item === "All"
                    ? "All categories"
                    : item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {visibleClubs.length}{" "}
          {visibleClubs.length === 1 ? "club" : "clubs"}{" "}
          found
        </p>

        {activeTab === "my" && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Clubs you belong to
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex min-h-[220px] items-center justify-center sm:min-h-[300px]">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500" />

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Loading clubs...
            </p>
          </div>
        </div>
      )}

      {!loading && visibleClubs.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center transition-colors dark:border-slate-700 dark:bg-slate-900 sm:mt-8 sm:px-6 sm:py-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            CC
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
            {activeTab === "my"
              ? "You have not joined any clubs"
              : "No clubs found"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {activeTab === "my"
              ? "Join a club from Browse, or create one to get started."
              : "Try another search, or create a new club for your campus."}
          </p>

          <button
            type="button"
            onClick={() => {
              setFormError("");
              setForm(emptyForm);
              setShowCreateModal(true);
            }}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Create a Club
          </button>
        </div>
      )}

      {!loading && visibleClubs.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {visibleClubs.map((club) => {
            const creator = getCreator(club);
            const memberCount = getMemberCount(club);
            const member = isMember(club);
            const ownClub = isCreator(club);
            const busy = actionLoading === club._id;

            return (
              <article
                key={club._id}
                className="flex min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
              >
                <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-5 text-white sm:px-5 sm:py-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                      {club.category || "Other"}
                    </span>

                    {ownClub && (
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                        Your club
                      </span>
                    )}
                  </div>

                  <h2 className="mt-4 line-clamp-2 text-lg font-bold leading-snug sm:mt-5 sm:text-xl">
                    {club.name}
                  </h2>
                </div>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <p className="line-clamp-3 text-xs leading-5 text-slate-600 dark:text-slate-300 sm:text-sm sm:leading-6">
                    {club.description}
                  </p>

                  <div className="mt-4 space-y-2.5 text-sm sm:mt-5 sm:space-y-3">
                    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 dark:bg-slate-950/60">
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Members
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {memberCount}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-100 pt-3.5 dark:border-slate-800 sm:mt-5 sm:pt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Created by
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      {creator?.profileImage ? (
                        <img
                          src={creator.profileImage}
                          alt={creator.name}
                          className="h-9 w-9 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                          {creator?.name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100 sm:text-sm">
                          {creator?.name || "Unknown"}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {creator?.university ||
                            "CampusConnect"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto space-y-2 pt-4 sm:pt-5">
                    {ownClub ? (
                      <button
                        type="button"
                        disabled
                        className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-400 dark:border-slate-700 dark:text-slate-500"
                      >
                        You created this club
                      </button>
                    ) : member ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleLeave(club._id)
                        }
                        className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {busy ? "Leaving..." : "Leave Club"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          handleJoin(club._id)
                        }
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy ? "Joining..." : "Join Club"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create Club Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (!creating) {
                setShowCreateModal(false);
              }
            }
          }}
        >
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900 sm:rounded-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6 sm:py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create Club
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">
                  Start a campus club and invite students to
                  join.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!creating) {
                    setShowCreateModal(false);
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close create club modal"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleCreateClub}
              className="space-y-4 px-5 py-5 sm:space-y-5 sm:px-6 sm:py-6"
            >
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="club-name"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Club name
                </label>
                <input
                  id="club-name"
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm("name", event.target.value)
                  }
                  placeholder="e.g. Robotics Society"
                  maxLength={80}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="club-description"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Description
                </label>
                <textarea
                  id="club-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="What is this club about? Who should join?"
                  rows={5}
                  maxLength={1000}
                  required
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
                <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                  Minimum 10 characters
                </p>
              </div>

              <div>
                <label
                  htmlFor="club-category-input"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Category
                </label>
                <select
                  id="club-category-input"
                  value={form.category}
                  onChange={(event) =>
                    updateForm(
                      "category",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:px-4 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-500/20"
                >
                  {CATEGORIES.filter(
                    (item) => item !== "All"
                  ).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col-reverse gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end sm:gap-3 sm:pt-5">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() => setShowCreateModal(false)}
                  className="w-full rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:w-auto dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {creating ? "Creating..." : "Create Club"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clubs;
