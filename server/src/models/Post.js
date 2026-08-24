const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      required: [true, "Post content is required"],
      trim: true,
      minlength: [1, "Post cannot be empty"],
      maxlength: [1000, "Post cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      enum: [
        "General",
        "Question",
        "Project",
        "Achievement",
        "Announcement",
      ],
      default: "General",
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;