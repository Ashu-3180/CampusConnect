import { apiFetch, API_URL } from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Get clubs, optionally filtered by search and category.
 */
const getClubs = async (search = "", category = "") => {
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (category) {
    params.append("category", category);
  }

  const query = params.toString();

  return apiFetch(
    `${API_URL}/clubs${query ? `?${query}` : ""}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

/**
 * Get clubs the current user belongs to.
 */
const getMyClubs = async () => {
  return apiFetch(`${API_URL}/clubs/my`, {
    method: "GET",
    headers: getHeaders(),
  });
};

/**
 * Get a single club by ID.
 */
const getClubById = async (id) => {
  if (!id) {
    throw new Error("Club ID is required.");
  }

  return apiFetch(`${API_URL}/clubs/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
};

/**
 * Create a new club.
 */
const createClub = async ({
  name,
  description,
  category,
}) => {
  return apiFetch(`${API_URL}/clubs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      description,
      category,
    }),
  });
};

/**
 * Join a club.
 */
const joinClub = async (id) => {
  if (!id) {
    throw new Error("Club ID is required.");
  }

  return apiFetch(`${API_URL}/clubs/${id}/join`, {
    method: "POST",
    headers: getHeaders(),
  });
};

/**
 * Leave a club.
 */
const leaveClub = async (id) => {
  if (!id) {
    throw new Error("Club ID is required.");
  }

  return apiFetch(`${API_URL}/clubs/${id}/leave`, {
    method: "DELETE",
    headers: getHeaders(),
  });
};

const clubService = {
  getClubs,
  getMyClubs,
  getClubById,
  createClub,
  joinClub,
  leaveClub,
};

export default clubService;
