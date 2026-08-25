const express = require("express");

const {
  createCollaboration,
  getCollaborations,
  getCollaborationById,
  applyToCollaboration,
  updateApplicationStatus,
  closeCollaboration,
  searchCollaborations,
} = require(
  "../controllers/collaborationController"
);

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getCollaborations)
  .post(protect, createCollaboration);

router.get(
  "/search",
  protect,
  searchCollaborations
);

router.get(
  "/:id",
  protect,
  getCollaborationById
);

router.post(
  "/:id/apply",
  protect,
  applyToCollaboration
);

router.put(
  "/:id/applications/:applicationId",
  protect,
  updateApplicationStatus
);

router.put(
  "/:id/close",
  protect,
  closeCollaboration
);

module.exports = router;