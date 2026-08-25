const express = require("express");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  searchPosts,
} = require("../controllers/postController");

const {
  protect,
} = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getPosts)
  .post(protect, createPost);

router.get(
  "/search",
  protect,
  searchPosts
);

router
  .route("/:id")
  .get(protect, getPostById)
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