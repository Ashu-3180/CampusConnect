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
const getConversation = async (userId) => {
  return apiFetch(
    `${API_URL}/messages/${userId}`,
    {
      method: "GET",
      headers: getHeaders(),
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