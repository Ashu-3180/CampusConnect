import API_URL from "./api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in to perform this action.");
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

    const response = await fetch(
      `${API_URL}/events${queryString ? `?${queryString}` : ""}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch events"
      );
    }

    return data;
  },

  // Get a single event
  getEventById: async (eventId) => {
    const response = await fetch(
      `${API_URL}/events/${eventId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch event"
      );
    }

    return data;
  },

  // Create an event
  createEvent: async (eventData) => {
    const response = await fetch(
      `${API_URL}/events`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(eventData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to create event"
      );
    }

    return data;
  },

  // Join an event
  joinEvent: async (eventId) => {
    const response = await fetch(
      `${API_URL}/events/${eventId}/join`,
      {
        method: "POST",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to join event"
      );
    }

    return data;
  },

  // Leave an event
  leaveEvent: async (eventId) => {
    const response = await fetch(
      `${API_URL}/events/${eventId}/leave`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to leave event"
      );
    }

    return data;
  },

  // Get events created by the current user
  getMyEvents: async () => {
    const response = await fetch(
      `${API_URL}/events/my`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch your events"
      );
    }

    return data;
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    const response = await fetch(
      `${API_URL}/events/${eventId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to delete event"
      );
    }

    return data;
  },
};

export default eventService;