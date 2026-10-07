const express = require("express");

const {
  createClub,
  getClubs,
  getMyClubs,
  getClubById,
  joinClub,
  leaveClub,
} = require("../controllers/clubController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getClubs)
  .post(protect, createClub);

router.get("/my", protect, getMyClubs);

router.get("/:id", protect, getClubById);

router.post("/:id/join", protect, joinClub);
router.delete("/:id/leave", protect, leaveClub);

module.exports = router;
