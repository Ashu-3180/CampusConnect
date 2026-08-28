const express = require("express");

const router = express.Router();

const {
  sendMessage,
  getConversation,
  getConversations,
} = require("../controllers/messageController");

const {
  protect,
} = require("../middleware/authMiddleware");

// Get all conversations
router.get(
  "/",
  protect,
  getConversations
);

// Get conversation with a specific user
router.get(
  "/:userId",
  protect,
  getConversation
);

// Send a message
router.post(
  "/",
  protect,
  sendMessage
);

module.exports = router;