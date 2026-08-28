import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";
import messageService from "../../services/messageService";
import socket from "../../socket/socket";

const navigation = [
  { name: "Home", path: "/app" },
  { name: "Collaborate", path: "/app/collaborations" },
  { name: "Events", path: "/app/events" },
  { name: "Discover", path: "/app/discover" },
  { name: "Search", path: "/app/search" },
  { name: "My Network", path: "/app/network" },
  { name: "Messages", path: "/app/messages" },
];

const bottomNavigation = [
  { name: "Profile", path: "/app/profile" },
  { name: "Settings", path: "/app/settings" },
];

function Sidebar() {
  // Add these
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const conversations =
          await messageService.getConversations();

        const totalUnread =
          conversations.reduce(
            (total, conversation) =>
              total + (conversation.unreadCount || 0),
            0
          );

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error(
          "Failed to load unread messages:",
          error
        );
      }
    };

    loadUnreadCount();

    const handleNewMessage = () => {
      loadUnreadCount();
    };

    const handleMessagesRead = () => {
      loadUnreadCount();
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    window.addEventListener(
      "messagesRead",
      handleMessagesRead
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );

      window.removeEventListener(
        "messagesRead",
        handleMessagesRead
      );
    };
  }, [location.pathname]);

  // Add this function
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClasses = ({ isActive }) =>
    `block rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  return (
    <aside className="hidden min-h-screen w-64 flex-col border-r border-slate-200 bg-white p-4 md:flex">
      <div className="mb-10 px-2">
        <h1 className="text-2xl font-bold text-indigo-600">
          CampusConnect
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Connect. Collaborate. Grow.
        </p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClasses}
          >
            <div className="flex items-center justify-between">
              <span>{item.name}</span>

              {item.name === "Messages" &&
                unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
            </div>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-2">
        {bottomNavigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClasses}
          >
            {item.name}
          </NavLink>
        ))}

        {/* Updated Logout button */}
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-4 py-3 text-left text-red-500 transition hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;