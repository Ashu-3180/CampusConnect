import API_URL from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getNotifications = async () => {
  const response = await fetch(
    `${API_URL}/notifications`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to load notifications"
    );
  }

  return data;
};

const markNotificationAsRead = async (
  notificationId
) => {
  const response = await fetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
      "Failed to update notification"
    );
  }

  return data;
};

const markAllNotificationsAsRead =
  async () => {
    const response = await fetch(
      `${API_URL}/notifications/read-all`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
        "Failed to update notifications"
      );
    }

    return data;
  };

const notificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;