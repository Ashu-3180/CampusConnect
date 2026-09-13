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

const createCollaboration = async (
  collaborationData
) => {
  return apiFetch(
    `${API_URL}/collaborations`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(collaborationData),
    }
  );
};

const getCollaborations = async (
  search = "",
  skill = ""
) => {
  const params = new URLSearchParams();

  if (search) {
    params.append("search", search);
  }

  if (skill) {
    params.append("skill", skill);
  }

  const query = params.toString();

  return apiFetch(
    `${API_URL}/collaborations${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

const getCollaborationById = async (
  collaborationId
) => {
  return apiFetch(
    `${API_URL}/collaborations/${collaborationId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

const applyToCollaboration = async (
  collaborationId,
  message
) => {
  return apiFetch(
    `${API_URL}/collaborations/${collaborationId}/apply`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        message,
      }),
    }
  );
};

const updateApplicationStatus = async (
  collaborationId,
  applicationId,
  status
) => {
  return apiFetch(
    `${API_URL}/collaborations/${collaborationId}/applications/${applicationId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        status,
      }),
    }
  );
};

const closeCollaboration = async (
  collaborationId
) => {
  return apiFetch(
    `${API_URL}/collaborations/${collaborationId}/close`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );
};

const collaborationService = {
  createCollaboration,
  getCollaborations,
  getCollaborationById,
  applyToCollaboration,
  updateApplicationStatus,
  closeCollaboration,
};

export default collaborationService;