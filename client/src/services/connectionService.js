import API_URL from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Get my connections
const getMyConnections = async () => {
  const response = await fetch(
    `${API_URL}/connections`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to get connections"
    );
  }

  return data.connections;
};

// Get received connection requests
const getReceivedRequests = async () => {
  const response = await fetch(
    `${API_URL}/connections/requests/received`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to get connection requests"
    );
  }

  return data.requests;
};

// Send connection request
const sendConnectionRequest = async (userId) => {
  const response = await fetch(
    `${API_URL}/connections/request/${userId}`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to send connection request"
    );
  }

  return data;
};

// Cancel connection request
const cancelConnectionRequest = async (
  userId
) => {
  const response = await fetch(
    `${API_URL}/connections/request/${userId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to cancel connection request"
    );
  }

  return data;
};

// Accept connection request
const acceptConnectionRequest = async (
  userId
) => {
  const response = await fetch(
    `${API_URL}/connections/request/${userId}/accept`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to accept connection request"
    );
  }

  return data;
};

// Reject connection request
const rejectConnectionRequest = async (
  userId
) => {
  const response = await fetch(
    `${API_URL}/connections/request/${userId}/reject`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to reject connection request"
    );
  }

  return data;
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