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

const getNotifications = async () => {
  return apiFetch(
    `${API_URL}/notifications`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

const markNotificationAsRead = async (
  notificationId
) => {
  return apiFetch(
    `${API_URL}/notifications/${notificationId}/read`,
    {
      method: "PUT",
      headers: getHeaders(),
    }
  );
};

const markAllNotificationsAsRead =
  async () => {
    return apiFetch(
      `${API_URL}/notifications/read-all`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );
  };

const notificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;