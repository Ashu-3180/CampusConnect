const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Club name is required"],
      trim: true,
      minlength: [2, "Club name must be at least 2 characters"],
      maxlength: [80, "Club name cannot exceed 80 characters"],
    },

    description: {
      type: String,
      required: [true, "Club description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },

    category: {
      type: String,
      enum: [
        "Academic",
        "Technology",
        "Cultural",
        "Sports",
        "Career",
        "Social",
        "Other",
      ],
      default: "Other",
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [
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

clubSchema.index({ name: "text", description: "text" });

const Club = mongoose.model("Club", clubSchema);

module.exports = Club;
