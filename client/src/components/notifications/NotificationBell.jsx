import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import notificationService from "../../services/notificationService";

function NotificationBell() {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const data =
        await notificationService.getNotifications();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(
      loadNotifications,
      30000
    );

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (
    notification
  ) => {
    if (!notification.isRead) {
      try {
        await notificationService.markNotificationAsRead(
          notification._id
        );

        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id
              ? {
                  ...item,
                  isRead: true,
                }
              : item
          )
        );

        setUnreadCount((count) =>
          Math.max(0, count - 1)
        );
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleMarkAllAsRead =
    async () => {
      try {
        await notificationService.markAllNotificationsAsRead();

        setNotifications((current) =>
          current.map((notification) => ({
            ...notification,
            isRead: true,
          }))
        );

        setUnreadCount(0);
      } catch (error) {
        console.error(error);
      }
    };

  return (
    <div className="relative">

      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        aria-label="Notifications"
      >
        🔔

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs text-white">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">

          <div className="flex items-center justify-between border-b border-slate-100 p-4">

            <h3 className="font-semibold text-slate-800">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                onClick={
                  handleMarkAllAsRead
                }
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Mark all as read
              </button>
            )}

          </div>

          <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <Link
                    key={notification._id}
                    to={notification.link || "#"}
                    onClick={() =>
                      handleMarkAsRead(
                        notification
                      )
                    }
                    className={`block border-b border-slate-100 p-4 transition hover:bg-slate-50 ${
                      notification.isRead
                        ? "bg-white"
                        : "bg-indigo-50"
                    }`}
                  >

                    <div className="flex gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">

                        {notification.sender
                          ?.profileImage ? (
                          <img
                            src={
                              notification.sender
                                .profileImage
                            }
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span>
                            👤
                          </span>
                        )}

                      </div>

                      <div>

                        <p className="text-sm text-slate-700">
                          <span className="font-semibold">
                            {
                              notification.sender
                                ?.name ||
                                "Someone"
                            }
                          </span>{" "}
                          {notification.message}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {new Date(
                            notification.createdAt
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                  </Link>
                )
              )
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default NotificationBell;