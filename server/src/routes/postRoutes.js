const express = require("express");

const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  searchPosts,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");

const {
  uploadPostMedia,
} = require("../middleware/uploadMiddleware");

const router = express.Router();

router
  .route("/")
  .get(protect, getPosts)
  .post(
    protect,
    uploadPostMedia.single("media"),
    createPost
  );

router.get("/search", protect, searchPosts);

router
  .route("/:id")
  .get(protect, getPostById)
  .put(
    protect,
    uploadPostMedia.single("media"),
    updatePost
  )
  .delete(protect, deletePost);

router.post("/:id/like", protect, toggleLike);

router.post("/:id/comments", protect, addComment);

router.delete(
  "/:id/comments/:commentId",
  protect,
  deleteComment
);

module.exports = router;
