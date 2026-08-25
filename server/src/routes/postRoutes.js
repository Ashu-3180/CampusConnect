const express = require("express");

const {
  createPost,
  getPosts,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
} = require("../controllers/postController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getPosts)
  .post(protect, createPost);

router
  .route("/:id")
  .put(protect, updatePost)
  .delete(protect, deletePost);

router.post(
  "/:id/like",
  protect,
  toggleLike
);

router.post(
  "/:id/comments",
  protect,
  addComment
);

module.exports = router;