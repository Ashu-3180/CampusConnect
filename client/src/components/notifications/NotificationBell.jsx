import {
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";

import notificationService from "../../services/notificationService";

function NotificationBell() {
  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [open, setOpen] = useState(false);

  const notificationRef =
    useRef(null);

  const loadNotifications = async () => {
    try {
      const data =
        await notificationService.getNotifications();

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
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

    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
   * Close the notification panel when the user
   * clicks anywhere outside the notification area.
   */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * Also allow Escape to close the panel,
   * matching common app behavior.
   */
  useEffect(() => {
    const handleEscape = (event) => {
      if (
        event.key === "Escape" &&
        open
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);

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
        console.error(
          "Failed to mark notification as read:",
          error
        );
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
        console.error(
          "Failed to mark all notifications as read:",
          error
        );
      }
    };

  return (
    <div
      ref={notificationRef}
      className="relative"
    >
      <button
        type="button"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="relative rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Notifications"
        aria-expanded={open}
        aria-haspopup="true"
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
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">

            <h3 className="font-semibold text-slate-800 dark:text-white">
              Notifications
            </h3>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={
                  handleMarkAllAsRead
                }
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                Mark all as read
              </button>
            )}

          </div>

          {/* Notification list */}
          <div className="max-h-96 overflow-y-auto">

            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map(
                (notification) => (
                  <Link
                    key={notification._id}
                    to={
                      notification.link ||
                      "#"
                    }
                    onClick={() =>
                      handleMarkAsRead(
                        notification
                      )
                    }
                    className={`block border-b border-slate-100 p-4 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800 ${
                      notification.isRead
                        ? "bg-white dark:bg-slate-900"
                        : "bg-indigo-50 dark:bg-indigo-950/30"
                    }`}
                  >
                    <div className="flex gap-3">

                      {/* Sender avatar */}
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                        {notification.sender
                          ?.profileImage ? (
                          <img
                            src={
                              notification
                                .sender
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

                      {/* Content */}
                      <div className="min-w-0">

                        <p className="text-sm text-slate-700 dark:text-slate-200">
                          <span className="font-semibold">
                            {
                              notification
                                .sender
                                ?.name ||
                              "Someone"
                            }
                          </span>{" "}
                          {notification.message}
                        </p>

                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
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