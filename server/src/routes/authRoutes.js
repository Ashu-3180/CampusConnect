const express = require("express");

const {
  registerUser,
  loginUser,
  changePassword,
  deleteAccount,
  getCurrentUser,
} = require("../controllers/authController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser);

router.put("/change-password", protect, changePassword);

router.delete("/delete-account", protect, deleteAccount);

router.get("/me", protect, getCurrentUser);

module.exports = router;