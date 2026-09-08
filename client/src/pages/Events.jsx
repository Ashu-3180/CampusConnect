import { useEffect, useMemo, useState } from "react";

import eventService from "../services/eventService";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "All",
  "Technology",
  "Workshop",
  "Hackathon",
  "Seminar",
  "Cultural",
  "Sports",
  "Academic",
  "Career",
  "Other",
];

const emptyForm = {
  title: "",
  description: "",
  date: "",
  location: "",
  category: "Technology",
  maxAttendees: 100,
};

function Events() {
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [activeTab, setActiveTab] = useState("upcoming");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const [actionLoading, setActionLoading] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const userId = user?._id ? String(user._id) : null;

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        search: search.trim(),
        category:
          category !== "All" ? category : "",
      };

      const [allEventsData, myEventsData] =
        await Promise.all([
          eventService.getEvents(params),
          eventService.getMyEvents(),
        ]);

      setEvents(allEventsData.events || []);
      setMyEvents(myEventsData.events || []);
    } catch (error) {
      setError(
        error.message || "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEvents();
    }, 300);

    return () => clearTimeout(timer);
  }, [search, category]);

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleCreateEvent = async (event) => {
    event.preventDefault();

    setFormError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.date ||
      !form.location.trim()
    ) {
      setFormError(
        "Please fill in all required fields."
      );
      return;
    }

    try {
      setCreating(true);

      const data =
        await eventService.createEvent({
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          maxAttendees: Number(form.maxAttendees),
        });

      if (data.event) {
        setEvents((previous) => [
          data.event,
          ...previous,
        ]);

        setMyEvents((previous) => [
          data.event,
          ...previous,
        ]);
      }

      setForm(emptyForm);
      setShowCreateModal(false);
    } catch (error) {
      setFormError(
        error.message || "Failed to create event"
      );
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      setActionLoading(eventId);

      await eventService.joinEvent(eventId);

      await loadEvents();
    } catch (error) {
      setError(
        error.message || "Failed to join event"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleLeave = async (eventId) => {
    try {
      setActionLoading(eventId);

      await eventService.leaveEvent(eventId);

      await loadEvents();
    } catch (error) {
      setError(
        error.message || "Failed to leave event"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (eventId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(eventId);

      await eventService.deleteEvent(eventId);

      setEvents((previous) =>
        previous.filter(
          (event) => event._id !== eventId
        )
      );

      setMyEvents((previous) =>
        previous.filter(
          (event) => event._id !== eventId
        )
      );
    } catch (error) {
      setError(
        error.message || "Failed to delete event"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const visibleEvents = useMemo(() => {
    const source =
      activeTab === "my"
        ? myEvents
        : events;

    return source.filter((event) => {
      if (!event?.date) {
        return false;
      }

      return new Date(event.date) > new Date();
    });
  }, [events, myEvents, activeTab]);

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (dateValue) => {
    return new Date(dateValue).toLocaleTimeString(
      "en-IN",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  const getOrganizer = (event) => {
    if (
      event.organizer &&
      typeof event.organizer === "object"
    ) {
      return event.organizer;
    }

    return null;
  };

  const isOrganizer = (event) => {
    const organizer = getOrganizer(event);

    return (
      organizer?._id &&
      userId &&
      String(organizer._id) === userId
    );
  };

  const isAttending = (event) => {
    if (!Array.isArray(event.attendees)) {
      return false;
    }

    return event.attendees.some((attendee) => {
      const attendeeId =
        typeof attendee === "object"
          ? attendee?._id
          : attendee;

      return (
        attendeeId &&
        userId &&
        String(attendeeId) === userId
      );
    });
  };

  return (
    <div className="mx-auto w-full max-w-6xl">

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Events
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Discover events, workshops and opportunities
            happening around your campus community.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError("");
            setForm(emptyForm);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          + Create Event
        </button>
      </div>

      {/* Event Tabs */}
      <div className="mt-6 flex gap-1 rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() => {
            setActiveTab("upcoming");
            setSearch("");
            setCategory("All");
          }}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "upcoming"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Upcoming Events
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("my");
            setSearch("");
            setCategory("All");
          }}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "my"
              ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          My Events
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="event-search"
              className="sr-only"
            >
              Search events
            </label>

            <input
              id="event-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search events by title, description or location..."
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
            />
          </div>

          <div className="md:w-52">
            <label
              htmlFor="event-category"
              className="sr-only"
            >
              Filter by category
            </label>

            <select
              id="event-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-500/20"
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

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {visibleEvents.length}{" "}
          {visibleEvents.length === 1
            ? "event"
            : "events"}{" "}
          found
        </p>

        {activeTab === "my" && (
          <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
            Events you created
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500" />

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Loading events...
            </p>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && visibleEvents.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center transition-colors dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-2xl dark:bg-indigo-500/10">
            📅
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800 dark:text-white">
            {activeTab === "my"
              ? "You have no upcoming events"
              : "No upcoming events"}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            {activeTab === "my"
              ? "Events you create will appear here."
              : "There are no events matching your current search."}
          </p>

          <button
            type="button"
            onClick={() => {
              setFormError("");
              setForm(emptyForm);
              setShowCreateModal(true);
            }}
            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Create an Event
          </button>
        </div>
      )}

      {/* Event Grid */}
      {!loading &&
        visibleEvents.length > 0 && (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visibleEvents.map((event) => {
              const organizer =
                getOrganizer(event);

              const attending =
                isAttending(event);

              const ownEvent =
                isOrganizer(event);

              const attendeeCount =
                Array.isArray(event.attendees)
                  ? event.attendees.length
                  : 0;

              const capacity = Number(
                event.maxAttendees || 0
              );

              const full =
                capacity > 0 &&
                attendeeCount >= capacity;

              const busy =
                actionLoading === event._id;

              return (
                <article
                  key={event._id}
                  className="flex min-h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20"
                >
                  {/* Top section */}
                  <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-6 text-white">
                    <div className="flex items-start justify-between gap-3">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                        {event.category || "Other"}
                      </span>

                      <div className="flex items-center gap-2">
                        {full && !ownEvent && (
                          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                            Full
                          </span>
                        )}

                        {ownEvent && (
                          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
                            Your event
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="mt-5 line-clamp-2 text-xl font-bold">
                      {event.title}
                    </h2>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {event.description}
                    </p>

                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5">
                          📅
                        </span>

                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">
                            {formatDate(event.date)}
                          </p>

                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTime(event.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5">
                          📍
                        </span>

                        <p className="text-slate-600 dark:text-slate-300">
                          {event.location}
                        </p>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5">
                          👥
                        </span>

                        <div className="flex-1">
                          <p className="text-slate-600 dark:text-slate-300">
                            {attendeeCount} /{" "}
                            {event.maxAttendees || 0}{" "}
                            attendees
                          </p>

                          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-indigo-500 transition-all"
                              style={{
                                width: `${Math.min(
                                  100,
                                  event.maxAttendees
                                    ? (attendeeCount /
                                        event.maxAttendees) *
                                        100
                                    : 0
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Organizer */}
                    <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Organized by
                      </p>

                      <div className="mt-2 flex items-center gap-3">
                        {organizer?.profileImage ? (
                          <img
                            src={organizer.profileImage}
                            alt={organizer.name}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                            {organizer?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                            {organizer?.name ||
                              "Unknown organizer"}
                          </p>

                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {organizer?.university ||
                              "CampusConnect"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto space-y-2 pt-5">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedEvent(event)
                        }
                        className="w-full rounded-lg border border-indigo-200 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-900/60 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                      >
                        View Details
                      </button>

                      {ownEvent ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleDelete(event._id)
                          }
                          className="w-full rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          {busy
                            ? "Deleting..."
                            : "Delete Event"}
                        </button>
                      ) : attending ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            handleLeave(event._id)
                          }
                          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {busy
                            ? "Leaving..."
                            : "Leave Event"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={busy || full}
                          onClick={() =>
                            handleJoin(event._id)
                          }
                          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {busy
                            ? "Joining..."
                            : full
                            ? "Event Full"
                            : "Join Event"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (!creating) {
                setShowCreateModal(false);
              }
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Create Event
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Share an event with the CampusConnect
                  community.
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
                aria-label="Close create event modal"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateEvent}
              className="space-y-5 px-6 py-6"
            >
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label
                  htmlFor="event-title"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Event title
                </label>

                <input
                  id="event-title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    updateForm(
                      "title",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Campus Hackathon 2026"
                  maxLength={100}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="event-description"
                  className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >
                  Description
                </label>

                <textarea
                  id="event-description"
                  value={form.description}
                  onChange={(event) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Tell students what this event is about..."
                  rows={5}
                  maxLength={2000}
                  required
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-date"
                    className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Date & time
                  </label>

                  <input
                    id="event-date"
                    type="datetime-local"
                    value={form.date}
                    onChange={(event) =>
                      updateForm(
                        "date",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label
                    htmlFor="event-location"
                    className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Location
                  </label>

                  <input
                    id="event-location"
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      updateForm(
                        "location",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Main Auditorium"
                    maxLength={200}
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="event-category-input"
                    className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Category
                  </label>

                  <select
                    id="event-category-input"
                    value={form.category}
                    onChange={(event) =>
                      updateForm(
                        "category",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-indigo-500/20"
                  >
                    {CATEGORIES.filter(
                      (item) => item !== "All"
                    ).map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="event-capacity"
                    className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    Maximum attendees
                  </label>

                  <input
                    id="event-capacity"
                    type="number"
                    min="1"
                    max="10000"
                    value={form.maxAttendees}
                    onChange={(event) =>
                      updateForm(
                        "maxAttendees",
                        event.target.value
                      )
                    }
                    required
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                <button
                  type="button"
                  disabled={creating}
                  onClick={() =>
                    setShowCreateModal(false)
                  }
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedEvent(null);
            }
          }}
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

            {/* Modal header */}
            <div className="relative bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-7 text-white">
              <button
                type="button"
                onClick={() =>
                  setSelectedEvent(null)
                }
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl text-white transition hover:bg-white/25"
                aria-label="Close event details"
              >
                ×
              </button>

              <div className="pr-12">
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                  {selectedEvent.category ||
                    "Other"}
                </span>

                <h2 className="mt-4 text-2xl font-bold leading-tight">
                  {selectedEvent.title}
                </h2>
              </div>
            </div>

            {/* Modal content */}
            <div className="p-6">

              {/* Event information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Date
                  </p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                    {formatDate(selectedEvent.date)}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {formatTime(selectedEvent.date)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                    {selectedEvent.location}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Attendees
                  </p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                    {Array.isArray(
                      selectedEvent.attendees
                    )
                      ? selectedEvent.attendees.length
                      : 0}{" "}
                    /{" "}
                    {selectedEvent.maxAttendees ||
                      0}
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    registered attendees
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
                    {selectedEvent.category ||
                      "Other"}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  About this event
                </h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {selectedEvent.description}
                </p>
              </div>

              {/* Organizer */}
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Organized by
                </h3>

                {(() => {
                  const organizer =
                    getOrganizer(selectedEvent);

                  return (
                    <div className="mt-3 flex items-center gap-3">
                      {organizer?.profileImage ? (
                        <img
                          src={organizer.profileImage}
                          alt={organizer.name}
                          className="h-11 w-11 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
                          {organizer?.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "U"}
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100">
                          {organizer?.name ||
                            "Unknown organizer"}
                        </p>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {organizer?.university ||
                            "CampusConnect"}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Modal actions */}
              <div className="mt-7 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedEvent(null)
                  }
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Close
                </button>

                {(() => {
                  const ownEvent =
                    isOrganizer(selectedEvent);

                  const attending =
                    isAttending(selectedEvent);

                  const full =
                    (Array.isArray(
                      selectedEvent.attendees
                    )
                      ? selectedEvent.attendees.length
                      : 0) >=
                    Number(
                      selectedEvent.maxAttendees || 0
                    );

                  const busy =
                    actionLoading ===
                    selectedEvent._id;

                  if (ownEvent) {
                    return (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await handleDelete(
                            selectedEvent._id
                          );
                          setSelectedEvent(null);
                        }}
                        className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {busy
                          ? "Deleting..."
                          : "Delete Event"}
                      </button>
                    );
                  }

                  if (attending) {
                    return (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={async () => {
                          await handleLeave(
                            selectedEvent._id
                          );

                          setSelectedEvent(null);
                        }}
                        className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        {busy
                          ? "Leaving..."
                          : "Leave Event"}
                      </button>
                    );
                  }

                  return (
                    <button
                      type="button"
                      disabled={busy || full}
                      onClick={async () => {
                        await handleJoin(
                          selectedEvent._id
                        );

                        setSelectedEvent(null);
                      }}
                      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy
                        ? "Joining..."
                        : full
                        ? "Event Full"
                        : "Join Event"}
                    </button>
                  );
                })()}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;