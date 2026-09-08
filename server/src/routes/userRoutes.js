const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  getMyPreferences,
  updateMyPreferences,
  getStudents,
  getUserProfile,
  uploadProfileImage,
} = require("../controllers/userController");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  uploadProfileImage: uploadProfileImageMiddleware,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

// Get current user's profile
router.get(
  "/me",
  protect,
  getMyProfile
);

// Update current user's profile
router.put(
  "/me",
  protect,
  updateMyProfile
);

// Upload current user's profile image
router.post(
  "/me/profile-image",
  protect,
  uploadProfileImageMiddleware.single(
    "profileImage"
  ),
  uploadProfileImage
);

// Get current user's preferences
router.get(
  "/me/preferences",
  protect,
  getMyPreferences
);

// Update current user's preferences
router.put(
  "/me/preferences",
  protect,
  updateMyPreferences
);

// Get all students
router.get(
  "/",
  protect,
  getStudents
);

// Get another user's profile
router.get(
  "/:id",
  protect,
  getUserProfile
);

module.exports = router;