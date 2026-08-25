import API_URL from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const createCollaboration = async (
  collaborationData
) => {
  const response = await fetch(
    `${API_URL}/collaborations`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(
        collaborationData
      ),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to create collaboration"
    );
  }

  return data;
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

  const response = await fetch(
    `${API_URL}/collaborations${
      query ? `?${query}` : ""
    }`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to load collaborations"
    );
  }

  return data;
};

const getCollaborationById = async (
  collaborationId
) => {
  const response = await fetch(
    `${API_URL}/collaborations/${collaborationId}`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to load collaboration"
    );
  }

  return data;
};

const applyToCollaboration = async (
  collaborationId,
  message
) => {
  const response = await fetch(
    `${API_URL}/collaborations/${collaborationId}/apply`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        message,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to submit application"
    );
  }

  return data;
};

const updateApplicationStatus = async (
  collaborationId,
  applicationId,
  status
) => {
  const response = await fetch(
    `${API_URL}/collaborations/${collaborationId}/applications/${applicationId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({
        status,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to update application"
    );
  }

  return data;
};

const closeCollaboration = async (
  collaborationId
) => {
  const response = await fetch(
    `${API_URL}/collaborations/${collaborationId}/close`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to close collaboration"
    );
  }

  return data;
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