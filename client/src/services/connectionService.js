import { apiFetch, API_URL } from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Get my connections
const getMyConnections = async () => {
  const data = await apiFetch(
    `${API_URL}/connections`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return data.connections;
};

// Get received connection requests
const getReceivedRequests = async () => {
  const data = await apiFetch(
    `${API_URL}/connections/requests/received`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return data.requests;
};

// Send connection request
const sendConnectionRequest = async (
  userId
) => {
  return apiFetch(
    `${API_URL}/connections/request/${userId}`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );
};

// Cancel connection request
const cancelConnectionRequest = async (
  userId
) => {
  return apiFetch(
    `${API_URL}/connections/request/${userId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
};

// Accept connection request
const acceptConnectionRequest = async (
  userId
) => {
  return apiFetch(
    `${API_URL}/connections/request/${userId}/accept`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );
};

// Reject connection request
const rejectConnectionRequest = async (
  userId
) => {
  return apiFetch(
    `${API_URL}/connections/request/${userId}/reject`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );
};

const connectionService = {
  getMyConnections,
  getReceivedRequests,
  sendConnectionRequest,
  cancelConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
};

export default connectionService;