import API_URL from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

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
  getStudents,
  getUserProfile,
};

export default userService;