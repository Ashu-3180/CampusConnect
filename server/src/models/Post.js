const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    originalName: {
      type: String,
      default: "",
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    content: {
      type: String,
      trim: true,
      default: "",
      maxlength: [5000, "Post cannot exceed 5000 characters"],
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

    media: {
      type: mediaSchema,
      default: undefined,
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

postSchema.pre("validate", function () {
  const hasContent =
    typeof this.content === "string" &&
    this.content.trim().length > 0;
  const hasMedia = Boolean(this.media?.fileId);

  if (!hasContent && !hasMedia) {
    this.invalidate(
      "content",
      "Post must include text or media"
    );
  }
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
