import { apiFetch, API_URL } from "./api";

const register = async (userData) => {
  return apiFetch(
    `${API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    },
    {
      handleAuthentication: false,
    }
  );
};

const login = async (credentials) => {
  return apiFetch(
    `${API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    },
    {
      handleAuthentication: false,
    }
  );
};

const getCurrentUser = async (token) => {
  return apiFetch(
    `${API_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const authService = {
  register,
  login,
  getCurrentUser,
};

export default authService;
