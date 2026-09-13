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

const getMyProfile = async () => {
  return apiFetch(`${API_URL}/users/me`, {
    method: "GET",
    headers: getHeaders(),
  });
};

const updateMyProfile = async (profileData) => {
  return apiFetch(`${API_URL}/users/me`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(profileData),
  });
};

const uploadProfileImage = async (file) => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error(
      "You must be logged in to upload a profile photo."
    );
  }

  const formData = new FormData();

  formData.append("profileImage", file);

  return apiFetch(
    `${API_URL}/users/me/profile-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );
};

const getMyPreferences = async () => {
  return apiFetch(
    `${API_URL}/users/me/preferences`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

const updateMyPreferences = async (
  preferences
) => {
  return apiFetch(
    `${API_URL}/users/me/preferences`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(preferences),
    }
  );
};

const getStudents = async (search = "") => {
  const query = search
    ? `?search=${encodeURIComponent(search)}`
    : "";

  return apiFetch(
    `${API_URL}/users${query}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

const getUserProfile = async (userId) => {
  return apiFetch(
    `${API_URL}/users/${userId}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

const userService = {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
  getMyPreferences,
  updateMyPreferences,
  getStudents,
  getUserProfile,
};

export default userService;