const express = require("express");
const cors = require("cors");

const {
  notFound,
  errorHandler,
} = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const eventRoutes = require("./routes/eventRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const connectionRoutes = require("./routes/connectionRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CampusConnect API is running",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/collaborations", collaborationRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications",notificationRoutes);
app.use("/api/connections",connectionRoutes);

// Error handling - always last
app.use(notFound);
app.use(errorHandler);

module.exports = app;