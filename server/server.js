const dotenv = require("dotenv");
const http = require("http");

const app = require("./src/app");
const connectDB = require("./src/config/db");

const { Server } = require("socket.io");

dotenv.config();

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const connectedUsers = new Map();

const broadcastOnlineUsers = () => {
  io.emit(
    "onlineUsers",
    Array.from(connectedUsers.keys())
  );
};

app.set("io", io);
app.set("connectedUsers", connectedUsers);

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;

  if (userId) {
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }

    connectedUsers
      .get(userId)
      .add(socket.id);

    console.log(
      `User connected: ${userId} | Socket: ${socket.id}`
    );

    broadcastOnlineUsers();
  }

  socket.on("typing", ({ receiverId }) => {
    const receiverSockets =
      connectedUsers.get(receiverId);

    if (receiverSockets) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("typing", {
          senderId: userId,
        });
      });
    }
  });

  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSockets =
      connectedUsers.get(receiverId);

    if (receiverSockets) {
      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("stopTyping", {
          senderId: userId,
        });
      });
    }
  });

  socket.on("disconnect", () => {
    if (userId) {
      const userSockets =
        connectedUsers.get(userId);

      if (userSockets) {
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          connectedUsers.delete(userId);

          console.log(
            `User disconnected: ${userId}`
          );
        }
      }

      broadcastOnlineUsers();
    }
  });
});

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();