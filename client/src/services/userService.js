import API_URL from "./api";

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
  const response = await fetch(
    `${API_URL}/users/me`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load profile"
    );
  }

  return data;
};

const updateMyProfile = async (profileData) => {
  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update profile"
    );
  }

  return data;
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

  const response = await fetch(
    `${API_URL}/users/me/profile-image`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to upload profile photo"
    );
  }

  return data;
};

const getMyPreferences = async () => {
  const response = await fetch(
    `${API_URL}/users/me/preferences`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load preferences"
    );
  }

  return data;
};

const updateMyPreferences = async (
  preferences
) => {
  const response = await fetch(
    `${API_URL}/users/me/preferences`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(preferences),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update preferences"
    );
  }

  return data;
};

const getStudents = async (search = "") => {
  const query = search
    ? `?search=${encodeURIComponent(search)}`
    : "";

  const response = await fetch(
    `${API_URL}/users${query}`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load students"
    );
  }

  return data;
};

const getUserProfile = async (userId) => {
  const response = await fetch(
    `${API_URL}/users/${userId}`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load profile"
    );
  }

  return data;
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