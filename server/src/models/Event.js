const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      minlength: [3, "Event title must be at least 3 characters"],
      maxlength: [100, "Event title cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    date: {
      type: Date,
      required: [true, "Event date is required"],
    },

    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [200, "Location cannot exceed 200 characters"],
    },

    category: {
      type: String,
      enum: [
        "Technology",
        "Workshop",
        "Hackathon",
        "Seminar",
        "Cultural",
        "Sports",
        "Academic",
        "Career",
        "Other",
      ],
      default: "Other",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    maxAttendees: {
      type: Number,
      default: 100,
      min: [1, "Maximum attendees must be at least 1"],
    },

    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;