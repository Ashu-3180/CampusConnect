import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import messageService from "../services/messageService";
import { useAuth } from "../context/AuthContext";
import socket from "../socket/socket";

const formatMessageTime = (dateString) => {
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
    return `Yesterday ${date.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  }

  return date.toLocaleDateString(
    [],
    {
      month: "short",
      day: "numeric",
      year:
        date.getFullYear() !==
        now.getFullYear()
          ? "numeric"
          : undefined,
    }
  ) + ` ${date.toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  )}`;
};

function Chat() {
  const { userId } = useParams();

  const { user } = useAuth();

  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const messageInputRef = useRef(null);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await messageService.getConversation(
          userId
        );

      setOtherUser(data.otherUser);
      setMessages(data.messages);
    } catch (error) {
      setError(
        error.message ||
          "Failed to load conversation"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAndNotify = async () => {
      await loadConversation();

      window.dispatchEvent(
        new Event("messagesRead")
      );
    };

    loadAndNotify();
  }, [userId]);

  useEffect(() => {
    const handleNewMessage = (newMessage) => {
      const senderId =
        newMessage.sender._id;

      if (senderId === userId) {
        setMessages((previousMessages) => {
          const alreadyExists =
            previousMessages.some(
              (message) =>
                message._id === newMessage._id
            );

          if (alreadyExists) {
            return previousMessages;
          }

          return [
            ...previousMessages,
            newMessage,
          ];
        });
      }
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
  }, [userId]);

  useEffect(() => {
    const handleMessagesRead = ({ readerId }) => {
      if (readerId === userId) {
        setMessages((previousMessages) =>
          previousMessages.map((message) => {
            if (
              message.sender._id === user?._id
            ) {
              return {
                ...message,
                isRead: true,
              };
            }

            return message;
          })
        );
      }
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
  }, [userId, user?._id]);

  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on(
      "onlineUsers",
      handleOnlineUsers
    );

    return () => {
      socket.off(
        "onlineUsers",
        handleOnlineUsers
      );
    };
  }, []);

  useEffect(() => {
    const handleTyping = ({ senderId }) => {
      if (senderId === userId) {
        setIsOtherUserTyping(true);
      }
    };

    const handleStopTyping = ({ senderId }) => {
      if (senderId === userId) {
        setIsOtherUserTyping(false);
      }
    };

    socket.on("typing", handleTyping);

    socket.on(
      "stopTyping",
      handleStopTyping
    );

    return () => {
      socket.off("typing", handleTyping);

      socket.off(
        "stopTyping",
        handleStopTyping
      );
    };
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      messageInputRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    return () => {
      socket.emit("stopTyping", {
        receiverId: userId,
      });

      clearTimeout(typingTimeoutRef.current);
    };
  }, [userId]);

  const handleTyping = (event) => {
    const value = event.target.value;

    setContent(value);

    if (!value.trim()) {
      socket.emit("stopTyping", {
        receiverId: userId,
      });

      clearTimeout(typingTimeoutRef.current);

      return;
    }

    socket.emit("typing", {
      receiverId: userId,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        receiverId: userId,
      });
    }, 1000);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim() || sending) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const newMessage =
        await messageService.sendMessage(
          userId,
          content
        );

      setMessages((previousMessages) => [
        ...previousMessages,
        newMessage,
      ]);

      setContent("");

      socket.emit("stopTyping", {
        receiverId: userId,
      });

      clearTimeout(typingTimeoutRef.current);

      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 0);

    } catch (error) {
      setError(
        error.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading conversation...
          </p>
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
            💬
          </div>

          <h2 className="mt-5 text-xl font-semibold text-slate-800">
            Unable to open conversation
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {error || "Conversation not found or unavailable."}
          </p>

          <Link
            to="/app/messages"
            className="mt-6 inline-flex rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Back to Messages
          </Link>

        </div>
      </div>
    );
  }

  const initial = otherUser.name
    ? otherUser.name.charAt(0).toUpperCase()
    : "U";

  const isOtherUserOnline =
    onlineUsers.includes(
      otherUser._id.toString()
    );

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Chat Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 p-5">

        <Link
          to="/app/messages"
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          ↩️
          <span className="hidden sm:inline">
            Back to Messages
          </span>
        </Link>

        <Link
          to={`/app/profile/${otherUser._id}`}
          className="flex items-center gap-3 rounded-lg px-2 py-1 transition hover:bg-slate-50"
        >
          {otherUser.profileImage ? (
            <img
              src={otherUser.profileImage}
              alt={otherUser.name}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
              {initial}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-slate-900">
                {otherUser.name}
              </h1>

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isOtherUserOnline
                    ? "bg-green-500"
                    : "bg-slate-300"
                }`}
              />
            </div>

            <p className="text-sm text-slate-500">
              {isOtherUserOnline
                ? "Online"
                : "Offline"}
            </p>
          </div>

        </Link>

      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-5">

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-3xl">
                👋
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-800">
                Start a conversation
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
                Send a message to {otherUser.name} and start
                collaborating on ideas, projects, and opportunities.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            {messages.map((message) => {
              const isMine =
                message.sender._id === user?._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isMine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isMine
                        ? "rounded-br-md bg-indigo-600 text-white"
                        : "rounded-bl-md bg-white text-slate-800 shadow-sm"
                    }`}
                  >

                    <p className="break-words text-sm">
                      {message.content}
                    </p>

                    <div
                      className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                        isMine
                          ? "text-indigo-200"
                          : "text-slate-400"
                      }`}
                    >
                      <span>
                        {formatMessageTime(
                          message.createdAt
                        )}
                      </span>

                      {isMine && (
                        <span className="font-semibold">
                          {message.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>

                  </div>

                </div>
              );
            })}

            {isOtherUserTyping && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-white px-4 py-2 text-sm text-slate-500 shadow-sm">
                  {otherUser.name} is typing...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />

          </div>
        )}

      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-200 bg-white p-4"
      >

        <div className="flex gap-3">

          <input
            ref={messageInputRef}
            type="text"
            value={content}
            onChange={handleTyping}
            placeholder="Type a message..."
            maxLength="2000"
            disabled={sending}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition focus:border-indigo-500 disabled:bg-slate-100"
          />

          <button
            type="submit"
            disabled={
              !content.trim() || sending
            }
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default Chat;