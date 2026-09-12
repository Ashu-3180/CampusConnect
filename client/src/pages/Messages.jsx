import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import messageService from "../services/messageService";
import socket from "../socket/socket";

const formatConversationTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday =
    date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function Messages() {
  const [conversations, setConversations] =
    useState([]);

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
      <div className="flex min-h-[35vh] items-center justify-center px-4 py-10 text-center text-sm text-slate-500 sm:py-14 sm:text-base dark:text-slate-400">
        Loading messages...
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">

      {/* Header */}
      <div className="mb-5 sm:mb-8">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">
          Messages
        </h1>

        <p className="mt-1.5 text-sm leading-5 text-slate-500 sm:mt-2 sm:text-base dark:text-slate-400">
          Chat with your connections.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-600 sm:mb-6 sm:rounded-lg sm:p-4 sm:text-base dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Empty */}
      {conversations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center transition-colors sm:p-10 dark:border-slate-700 dark:bg-slate-900">

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-xl sm:h-14 sm:w-14 sm:text-2xl dark:bg-indigo-500/10">
            💬
          </div>

          <h2 className="mt-3 text-base font-semibold text-slate-800 sm:mt-4 sm:text-lg dark:text-white">
            No conversations yet
          </h2>

          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-5 text-slate-500 sm:mt-2 sm:text-base dark:text-slate-400">
            Connect with students and start a conversation.
          </p>

          <Link
            to="/app/network"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 sm:mt-5 sm:px-5 sm:py-2.5"
          >
            View My Network
          </Link>

        </div>
      ) : (
        <div className="space-y-2.5 sm:space-y-3">

          {conversations.map((conversation) => {
            const {
              user,
              lastMessage,
              unreadCount,
            } = conversation;

            const hasUnread =
              unreadCount > 0;

            const initial = user.name
              ? user.name
                  .charAt(0)
                  .toUpperCase()
              : "U";

            return (
              <Link
                key={user._id}
                to={`/app/messages/${user._id}`}
                className={`flex items-center gap-3 rounded-2xl border p-3.5 transition hover:border-indigo-200 hover:shadow-sm sm:gap-4 sm:p-4 dark:hover:border-indigo-900/60 ${
                  hasUnread
                    ? "border-indigo-200 bg-indigo-50/40 dark:border-indigo-900/60 dark:bg-indigo-950/25"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >

                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="h-11 w-11 shrink-0 rounded-full object-cover sm:h-12 sm:w-12"
                  />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-600 sm:h-12 sm:w-12 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {initial}
                  </div>
                )}

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between gap-2 sm:gap-4">

                    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">

                      <h2
                        className={`truncate text-sm sm:text-base ${
                          hasUnread
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-semibold text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {user.name}
                      </h2>

                      {hasUnread && (
                        <span className="flex h-4.5 min-w-4.5 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-semibold text-white sm:h-5 sm:min-w-5 sm:px-1.5 sm:text-xs">
                          {unreadCount}
                        </span>
                      )}

                    </div>

                    <span className="shrink-0 text-[10px] text-slate-400 sm:text-xs dark:text-slate-500">
                      {formatConversationTime(
                        lastMessage.createdAt
                      )}
                    </span>

                  </div>

                  <p
                    className={`mt-0.5 truncate text-xs leading-5 sm:mt-1 sm:text-sm ${
                      hasUnread
                        ? "font-medium text-slate-700 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-400"
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