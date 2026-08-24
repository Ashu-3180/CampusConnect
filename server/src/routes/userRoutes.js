const express = require("express");

const {
  getMyProfile,
  updateMyProfile,
  getStudents,
  getUserProfile,
} = require("../controllers/userController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
  "/me",
  protect,
  getMyProfile
);

router.put(
  "/me",
  protect,
  updateMyProfile
);

router.get(
  "/",
  protect,
  getStudents
);

router.get(
  "/:id",
  protect,
  getUserProfile
);

module.exports = router;