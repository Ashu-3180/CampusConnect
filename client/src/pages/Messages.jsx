import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import messageService from "../services/messageService";
import socket from "../socket/socket";

const formatConversationTime = (dateString) => {
  const date = new Date(dateString);

  const now = new Date();

  const isToday =
    date.toDateString() ===
    now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  const yesterday = new Date();

  yesterday.setDate(
    now.getDate() - 1
  );

  const isYesterday =
    date.toDateString() ===
    yesterday.toDateString();

  if (isYesterday) {
    return "Yesterday";
  }

  const isCurrentYear =
    date.getFullYear() ===
    now.getFullYear();

  if (isCurrentYear) {
    return date.toLocaleDateString(
      [],
      {
        month: "short",
        day: "numeric",
      }
    );
  }

  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );
};

function Messages() {
  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadConversations = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await messageService.getConversations();

        setConversations(data);
      } catch (error) {
        setError(
          error.message ||
            "Failed to load conversations"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const handleNewMessage = () => {
      loadConversations();
    };

    socket.on(
      "newMessage",
      handleNewMessage
    );

    return () => {
      socket.off(
        "newMessage",
        handleNewMessage
      );
    };
  }, [loadConversations]);

  useEffect(() => {
    const handleMessagesRead = () => {
      loadConversations();
    };

    socket.on(
      "messagesRead",
      handleMessagesRead
    );

    return () => {
      socket.off(
        "messagesRead",
        handleMessagesRead
      );
    };
  }, [loadConversations]);

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Messages
        </h1>

        <p className="mt-2 text-slate-500">
          Chat with your connections.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">

          <div className="text-4xl">
            💬
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No conversations yet
          </h2>

          <p className="mt-2 text-slate-500">
            Connect with students and start a conversation.
          </p>

          <Link
            to="/app/network"
            className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
          >
            View My Network
          </Link>

        </div>
      ) : (
        <div className="space-y-3">

          {conversations.map((conversation) => {
            const {
              user,
              lastMessage,
              unreadCount,
            } = conversation;

            const hasUnread = unreadCount > 0;

            const initial = user.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U";

            return (
              <Link
                key={user._id}
                to={`/app/messages/${user._id}`}
                className={`flex items-center gap-4 rounded-xl border p-4 transition hover:border-indigo-200 hover:shadow-sm ${
                  hasUnread
                    ? "border-indigo-200 bg-indigo-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >

                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                    {initial}
                  </div>
                )}

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex min-w-0 items-center gap-2">

                      <h2
                        className={`truncate ${
                          hasUnread
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-800"
                        }`}
                      >
                        {user.name}
                      </h2>

                      {hasUnread && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
                          {unreadCount}
                        </span>
                      )}

                    </div>

                    <span className="shrink-0 text-xs text-slate-400">
                      {formatConversationTime(
                        lastMessage.createdAt
                      )}
                    </span>

                  </div>

                  <p
                    className={`mt-1 truncate text-sm ${
                      hasUnread
                        ? "font-medium text-slate-700"
                        : "text-slate-500"
                    }`}
                  >
                    {lastMessage.content}
                  </p>

                </div>

              </Link>
            );
          })}

        </div>
      )}

    </div>
  );
}

export default Messages;