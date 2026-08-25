const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");

const createPost = async (req, res, next) => {
  try {
    const { content, category } = req.body;

    if (!content || !content.trim()) {
      res.status(400);
      throw new Error("Post content is required");
    }

    const post = await Post.create({
      author: req.user.userId,
      content: content.trim(),
      category: category || "General",
    });

    const populatedPost = await Post.findById(
      post._id
    ).populate(
      "author",
      "name university course profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate(
        "author",
        "name university course profileImage"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate(
        "author",
        "name university course profileImage"
      );

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    res.status(200).json({
      success: true,
      post,
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (
      post.author.toString() !==
      req.user.userId
    ) {
      res.status(403);
      throw new Error(
        "You are not authorized to update this post"
      );
    }

    const { content, category } = req.body;

    if (content !== undefined) {
      if (!content.trim()) {
        res.status(400);
        throw new Error("Post content cannot be empty");
      }

      post.content = content.trim();
    }

    if (category !== undefined) {
      post.category = category;
    }

    const updatedPost = await post.save();

    const populatedPost = await Post.findById(
      updatedPost._id
    ).populate(
      "author",
      "name university course profileImage"
    );

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: populatedPost,
    });
  } catch (error) {
    next(error);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (
      post.author.toString() !==
      req.user.userId
    ) {
      res.status(403);
      throw new Error(
        "You are not authorized to delete this post"
      );
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const userId = req.user.userId;

    const alreadyLiked = post.likes.some(
      (like) => like.toString() === userId
    );

    if (alreadyLiked) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId
      );
    } else {
      post.likes.push(userId);

      await createNotification({
        recipient: post.author,
        sender: req.user.userId,
        type: "post_like",
        message: "liked your post",
        link: `/app/posts/${post._id}`,
      });
    }

    await post.save();

    res.status(200).json({
      success: true,
      liked: !alreadyLiked,
      likesCount: post.likes.length,
    });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const { text } = req.body;

    if (!text || !text.trim()) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    // Add the comment
    post.comments.push({
      user: req.user.userId,
      text: text.trim(),
    });

    // Create notification for the post author
    await createNotification({
      recipient: post.author,
      sender: req.user.userId,
      type: "post_comment",
      message: "commented on your post",
      link: `/app/posts/${post._id}`,
    });

    // Save the post
    await post.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      commentsCount: post.comments.length,
      comments: post.comments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
};