const sharp = require("sharp");

const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");
const {
  uploadMedia,
  deleteMedia,
} = require("../services/mediaService");
const { buildMediaUrl } = require("../utils/mediaHelpers");
const {
  normalizeProfileImageUrl,
} = require("../utils/profileImageUrl");

const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const VIDEO_MIME_TYPES = ["video/mp4", "video/webm"];

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 5000;
const MAX_COMMENT_LENGTH = 1000;

const normalizeAuthorProfile = (doc, req) => {
  if (!doc) {
    return doc;
  }

  const plain =
    typeof doc.toObject === "function"
      ? doc.toObject()
      : { ...doc };

  if (plain.author?.profileImage) {
    plain.author.profileImage = normalizeProfileImageUrl(
      plain.author.profileImage,
      req
    );
  }

  if (Array.isArray(plain.comments)) {
    plain.comments = plain.comments.map((comment) => {
      const next =
        typeof comment.toObject === "function"
          ? comment.toObject()
          : { ...comment };

      if (next.user?.profileImage) {
        next.user.profileImage = normalizeProfileImageUrl(
          next.user.profileImage,
          req
        );
      }

      return next;
    });
  }

  if (plain.media?.fileId) {
    plain.media = {
      ...plain.media,
      url: buildMediaUrl(req, plain.media.fileId),
    };
  }

  return plain;
};

const populatePost = (query) =>
  query
    .populate(
      "author",
      "name university course profileImage"
    )
    .populate(
      "comments.user",
      "name university course profileImage"
    );

const processUploadedMedia = async (file) => {
  if (!file) {
    return null;
  }

  const mimeType = file.mimetype;

  if (IMAGE_MIME_TYPES.includes(mimeType)) {
    if (file.size > MAX_IMAGE_BYTES) {
      const error = new Error("Image must be 5 MB or smaller.");
      error.statusCode = 400;
      throw error;
    }

    const optimizedBuffer = await sharp(file.buffer)
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();

    const uploaded = await uploadMedia({
      buffer: optimizedBuffer,
      filename: `post-image-${Date.now()}.webp`,
      mimeType: "image/webp",
      metadata: {
        kind: "post-image",
        originalName: file.originalname,
      },
    });

    return {
      type: "image",
      fileId: uploaded.fileId,
      originalName: file.originalname || "",
      mimeType: "image/webp",
      size: uploaded.size,
    };
  }

  if (VIDEO_MIME_TYPES.includes(mimeType)) {
    if (file.size > MAX_VIDEO_BYTES) {
      const error = new Error("Video must be 50 MB or smaller.");
      error.statusCode = 400;
      throw error;
    }

    const uploaded = await uploadMedia({
      buffer: file.buffer,
      filename: `post-video-${Date.now()}-${file.originalname || "video"}`,
      mimeType,
      metadata: {
        kind: "post-video",
        originalName: file.originalname,
      },
    });

    return {
      type: "video",
      fileId: uploaded.fileId,
      originalName: file.originalname || "",
      mimeType,
      size: uploaded.size,
    };
  }

  const error = new Error(
    "Only JPG, PNG, WEBP images or MP4/WEBM videos are allowed."
  );
  error.statusCode = 400;
  throw error;
};

const createPost = async (req, res, next) => {
  let uploadedFileId = null;

  try {
    const content =
      typeof req.body.content === "string"
        ? req.body.content.trim()
        : "";
    const category = req.body.category || "General";

    if (content.length > MAX_CONTENT_LENGTH) {
      res.status(400);
      throw new Error(
        `Post cannot exceed ${MAX_CONTENT_LENGTH} characters`
      );
    }

    let media = null;

    if (req.file) {
      media = await processUploadedMedia(req.file);
      uploadedFileId = media.fileId;
    }

    if (!content && !media) {
      res.status(400);
      throw new Error("Post must include text or media");
    }

    const post = await Post.create({
      author: req.user.userId,
      content,
      category,
      ...(media ? { media } : {}),
    });

    uploadedFileId = null;

    const populatedPost = await populatePost(
      Post.findById(post._id)
    );

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post: normalizeAuthorProfile(populatedPost, req),
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        await deleteMedia(uploadedFileId);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up post media:",
          cleanupError
        );
      }
    }

    if (error.statusCode) {
      res.status(error.statusCode);
    }

    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const posts = await populatePost(
      Post.find().sort({ createdAt: -1 })
    );

    res.status(200).json({
      success: true,
      count: posts.length,
      posts: posts.map((post) =>
        normalizeAuthorProfile(post, req)
      ),
    });
  } catch (error) {
    next(error);
  }
};

const getPostById = async (req, res, next) => {
  try {
    const post = await populatePost(
      Post.findById(req.params.id)
    );

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    res.status(200).json({
      success: true,
      post: normalizeAuthorProfile(post, req),
    });
  } catch (error) {
    next(error);
  }
};

const updatePost = async (req, res, next) => {
  let uploadedFileId = null;

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    if (post.author.toString() !== req.user.userId) {
      res.status(403);
      throw new Error(
        "You are not authorized to update this post"
      );
    }

    const previousMediaFileId = post.media?.fileId
      ? String(post.media.fileId)
      : null;

    let content =
      req.body.content !== undefined
        ? String(req.body.content).trim()
        : post.content;

    if (content.length > MAX_CONTENT_LENGTH) {
      res.status(400);
      throw new Error(
        `Post cannot exceed ${MAX_CONTENT_LENGTH} characters`
      );
    }

    if (req.body.category !== undefined) {
      post.category = req.body.category;
    }

    const removeMedia =
      req.body.removeMedia === true ||
      req.body.removeMedia === "true";

    let nextMedia = post.media || undefined;
    let shouldDeletePrevious = false;

    if (req.file) {
      const media = await processUploadedMedia(req.file);
      uploadedFileId = media.fileId;
      nextMedia = media;
      shouldDeletePrevious = Boolean(previousMediaFileId);
    } else if (removeMedia) {
      nextMedia = undefined;
      shouldDeletePrevious = Boolean(previousMediaFileId);
    }

    const hasContent = Boolean(content);
    const hasMedia = Boolean(nextMedia?.fileId);

    if (!hasContent && !hasMedia) {
      if (uploadedFileId) {
        await deleteMedia(uploadedFileId);
        uploadedFileId = null;
      }

      res.status(400);
      throw new Error("Post must include text or media");
    }

    post.content = content;

    if (req.file || removeMedia) {
      if (nextMedia) {
        post.media = nextMedia;
      } else {
        post.media = undefined;
        post.set("media", undefined);
      }
    }

    const updatedPost = await post.save();
    uploadedFileId = null;

    if (shouldDeletePrevious && previousMediaFileId) {
      try {
        await deleteMedia(previousMediaFileId);
      } catch (cleanupError) {
        console.error(
          "Failed to delete previous post media:",
          cleanupError
        );
      }
    }

    const populatedPost = await populatePost(
      Post.findById(updatedPost._id)
    );

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      post: normalizeAuthorProfile(populatedPost, req),
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        await deleteMedia(uploadedFileId);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up replacement post media:",
          cleanupError
        );
      }
    }

    if (error.statusCode) {
      res.status(error.statusCode);
    }

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

    if (post.author.toString() !== req.user.userId) {
      res.status(403);
      throw new Error(
        "You are not authorized to delete this post"
      );
    }

    const mediaFileId = post.media?.fileId;

    await post.deleteOne();

    if (mediaFileId) {
      try {
        await deleteMedia(mediaFileId);
      } catch (cleanupError) {
        console.error(
          "Failed to delete post media:",
          cleanupError
        );
      }
    }

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

      // createNotification already skips self-notifications
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

    const text =
      typeof req.body.text === "string"
        ? req.body.text.trim()
        : "";

    if (!text) {
      res.status(400);
      throw new Error("Comment text is required");
    }

    if (text.length > MAX_COMMENT_LENGTH) {
      res.status(400);
      throw new Error(
        `Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`
      );
    }

    post.comments.push({
      user: req.user.userId,
      text,
    });

    await createNotification({
      recipient: post.author,
      sender: req.user.userId,
      type: "post_comment",
      message: "commented on your post",
      link: `/app/posts/${post._id}`,
    });

    await post.save();

    const populatedPost = await populatePost(
      Post.findById(post._id)
    );

    const normalized = normalizeAuthorProfile(
      populatedPost,
      req
    );

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      commentsCount: normalized.comments.length,
      comments: normalized.comments,
      post: normalized,
    });
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }

    if (comment.user.toString() !== req.user.userId) {
      res.status(403);
      throw new Error(
        "You can only delete your own comments"
      );
    }

    comment.deleteOne();
    await post.save();

    const populatedPost = await populatePost(
      Post.findById(post._id)
    );

    const normalized = normalizeAuthorProfile(
      populatedPost,
      req
    );

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
      commentsCount: normalized.comments.length,
      comments: normalized.comments,
      post: normalized,
    });
  } catch (error) {
    next(error);
  }
};

const searchPosts = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const posts = await populatePost(
      Post.find({
        content: {
          $regex: query.trim(),
          $options: "i",
        },
      })
        .sort({ createdAt: -1 })
        .limit(20)
    );

    res.status(200).json({
      success: true,
      count: posts.length,
      posts: posts.map((post) =>
        normalizeAuthorProfile(post, req)
      ),
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
  deleteComment,
  searchPosts,
};
