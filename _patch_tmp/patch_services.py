from pathlib import Path
import re

root = Path(r"E:/Projects/CampusConnect")

# ---------- authService.js: use apiFetch ----------
(root / "client/src/services/authService.js").write_text("""import { apiFetch, API_URL } from "./api";

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
""", encoding="utf-8")
print("authService.js updated")

# ---------- messageService.js: support AbortSignal ----------
(root / "client/src/services/messageService.js").write_text("""import { apiFetch, API_URL } from "./api";

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

// Get all conversations
const getConversations = async () => {
  const data = await apiFetch(
    `${API_URL}/messages`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return data.conversations;
};

// Get conversation with a user
const getConversation = async (userId, signal) => {
  if (!userId) {
    throw new Error("Conversation user id is required.");
  }

  return apiFetch(
    `${API_URL}/messages/${userId}`,
    {
      method: "GET",
      headers: getHeaders(),
      signal,
    }
  );
};

// Send a message
const sendMessage = async (
  receiverId,
  content
) => {
  const data = await apiFetch(
    `${API_URL}/messages`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        receiverId,
        content,
      }),
    }
  );

  return data.message;
};

const messageService = {
  getConversations,
  getConversation,
  sendMessage,
};

export default messageService;
""", encoding="utf-8")
print("messageService.js updated")
print("done batch1")
