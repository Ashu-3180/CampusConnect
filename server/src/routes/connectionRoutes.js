const express = require("express");

const router = express.Router();

const {
  sendConnectionRequest,
  cancelConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  getReceivedRequests,
} = require("../controllers/connectionController");

const {
  protect,
} = require("../middleware/authMiddleware");

// Get my connections
router.get(
  "/",
  protect,
  getMyConnections
);

// Get received connection requests
router.get(
  "/requests/received",
  protect,
  getReceivedRequests
);

// Send a connection request
router.post(
  "/request/:userId",
  protect,
  sendConnectionRequest
);

// Cancel a sent request
router.delete(
  "/request/:userId",
  protect,
  cancelConnectionRequest
);

// Accept a connection request
router.put(
  "/request/:userId/accept",
  protect,
  acceptConnectionRequest
);

// Reject a connection request
router.put(
  "/request/:userId/reject",
  protect,
  rejectConnectionRequest
);

module.exports = router;