import { apiFetch, API_URL } from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You must be logged in to perform this action."
    );
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const eventService = {
  // Get all upcoming events
  getEvents: async (params = {}) => {
    const query = new URLSearchParams();

    if (params.search) {
      query.append("search", params.search);
    }

    if (params.category) {
      query.append("category", params.category);
    }

    const queryString = query.toString();

    return apiFetch(
      `${API_URL}/events${
        queryString ? `?${queryString}` : ""
      }`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
  },

  // Get a single event
  getEventById: async (eventId) => {
    return apiFetch(
      `${API_URL}/events/${eventId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
  },

  // Create an event
  createEvent: async (eventData) => {
    return apiFetch(
      `${API_URL}/events`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData),
      }
    );
  },

  // Join an event
  joinEvent: async (eventId) => {
    return apiFetch(
      `${API_URL}/events/${eventId}/join`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );
  },

  // Leave an event
  leaveEvent: async (eventId) => {
    return apiFetch(
      `${API_URL}/events/${eventId}/leave`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
  },

  // Get events created by the current user
  getMyEvents: async () => {
    return apiFetch(
      `${API_URL}/events/my`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    return apiFetch(
      `${API_URL}/events/${eventId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
  },
};

export default eventService;