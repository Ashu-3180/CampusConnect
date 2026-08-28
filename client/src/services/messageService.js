import API_URL from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Get all conversations
const getConversations = async () => {
  const response = await fetch(
    `${API_URL}/messages`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load conversations"
    );
  }

  return data.conversations;
};

// Get conversation with a user
const getConversation = async (userId) => {
  const response = await fetch(
    `${API_URL}/messages/${userId}`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load conversation"
    );
  }

  return data;
};

// Send a message
const sendMessage = async (
  receiverId,
  content
) => {
  const response = await fetch(
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to send message"
    );
  }

  return data.message;
};

const messageService = {
  getConversations,
  getConversation,
  sendMessage,
};

export default messageService;