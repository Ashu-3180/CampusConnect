const express = require("express");

const {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  leaveEvent,
  getMyEvents,
  deleteEvent,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// All event routes require authentication
router.use(protect);

// Create event
router.post("/", createEvent);

// Get my events
router.get("/my", getMyEvents);

// Get all upcoming events
router.get("/", getEvents);

// Get single event
router.get("/:id", getEventById);

// Join event
router.post("/:id/join", joinEvent);

// Leave event
router.delete("/:id/leave", leaveEvent);

// Delete event
router.delete("/:id", deleteEvent);

module.exports = router;