const sharp = require("sharp");

const User = require("../models/User");
const Post = require("../models/Post");
const {
  normalizeProfileImageUrl,
} = require("../utils/profileImageUrl");
const {
  DEFAULT_NOTIFICATION_PREFERENCES,
  extractProfileImageFileId,
} = require("../utils/mediaHelpers");
const {
  uploadMedia,
  deleteMedia,
} = require("../services/mediaService");

const withNormalizedProfileImage = (user, req) => {
  if (!user) {
    return user;
  }

  const plain =
    typeof user.toObject === "function"
      ? user.toObject()
      : { ...user };

  if (plain.profileImage) {
    plain.profileImage = normalizeProfileImageUrl(
      plain.profileImage,
      req
    );
  }

  return plain;
};

const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      user: withNormalizedProfileImage(user, req),
    });
  } catch (error) {
    next(error);
  }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      "name",
      "university",
      "course",
      "graduationYear",
      "bio",
      "skills",
      "github",
      "linkedin",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Do not allow clients to overwrite profileImage with a raw string
    // via this endpoint — use the dedicated upload route instead.
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: withNormalizedProfileImage(user, req),
    });
  } catch (error) {
    next(error);
  }
};

const mergeNotificationPreferences = (incoming = {}) => {
  const allowedKeys = Object.keys(
    DEFAULT_NOTIFICATION_PREFERENCES
  );
  const updates = {};

  allowedKeys.forEach((key) => {
    if (incoming[key] !== undefined) {
      updates[`preferences.notifications.${key}`] = Boolean(
        incoming[key]
      );
    }
  });

  return updates;
};

const getMyPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("preferences");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const preferences = user.preferences?.toObject
      ? user.preferences.toObject()
      : { ...user.preferences };

    preferences.notifications = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(preferences.notifications || {}),
    };

    if (!preferences.language) {
      preferences.language = "en";
    }

    res.status(200).json({
      success: true,
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyPreferences = async (req, res, next) => {
  try {
    const {
      darkMode,
      emailNotifications,
      profileVisibility,
      language,
      notifications,
    } = req.body;

    const updates = {};

    if (darkMode !== undefined) {
      updates["preferences.darkMode"] = Boolean(darkMode);
    }

    if (emailNotifications !== undefined) {
      updates["preferences.emailNotifications"] = Boolean(
        emailNotifications
      );
    }

    if (profileVisibility !== undefined) {
      const allowedVisibility = [
        "everyone",
        "connections",
        "only-me",
      ];

      if (!allowedVisibility.includes(profileVisibility)) {
        res.status(400);
        throw new Error(
          "Invalid profile visibility option"
        );
      }

      updates["preferences.profileVisibility"] =
        profileVisibility;
    }

    if (language !== undefined) {
      const allowedLanguages = ["en", "hi"];

      if (!allowedLanguages.includes(language)) {
        res.status(400);
        throw new Error("Invalid language option");
      }

      updates["preferences.language"] = language;
    }

    if (
      notifications &&
      typeof notifications === "object"
    ) {
      Object.assign(
        updates,
        mergeNotificationPreferences(notifications)
      );
    }

    if (Object.keys(updates).length === 0) {
      res.status(400);
      throw new Error("No valid preferences provided");
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("preferences");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const preferences = user.preferences?.toObject
      ? user.preferences.toObject()
      : { ...user.preferences };

    preferences.notifications = {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(preferences.notifications || {}),
    };

    if (!preferences.language) {
      preferences.language = "en";
    }

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences,
    });
  } catch (error) {
    next(error);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const { search } = req.query;

    const currentUser = await User.findById(
      req.user.userId
    ).select("connections");

    const query = {
      _id: {
        $ne: req.user.userId,
      },
      $or: [
        {
          "preferences.profileVisibility": "everyone",
        },
        {
          "preferences.profileVisibility": "connections",
          _id: {
            $in: currentUser?.connections || [],
            $ne: req.user.userId,
          },
        },
      ],
    };

    if (search && search.trim()) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          university: {
            $regex: search,
            $options: "i",
          },
        },
        {
          course: {
            $regex: search,
            $options: "i",
          },
        },
        {
          skills: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const students = await User.find(query)
      .select(
        "name university course graduationYear bio skills github linkedin profileImage"
      )
      .sort({ createdAt: -1 });

    const normalizedStudents = students.map((student) =>
      withNormalizedProfileImage(student, req)
    );

    res.status(200).json({
      success: true,
      count: normalizedStudents.length,
      students: normalizedStudents,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;

    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const currentUser = await User.findById(
      currentUserId
    );

    if (!currentUser) {
      res.status(404);
      throw new Error("Current user not found");
    }

    const isOwnProfile =
      currentUserId.toString() === user._id.toString();

    const isConnected = currentUser.connections.some(
      (userId) =>
        userId.toString() === user._id.toString()
    );

    const profileVisibility =
      user.preferences?.profileVisibility || "everyone";

    if (!isOwnProfile && profileVisibility === "only-me") {
      res.status(403);
      throw new Error("This profile is private.");
    }

    if (
      !isOwnProfile &&
      profileVisibility === "connections" &&
      !isConnected
    ) {
      res.status(403);
      throw new Error(
        "This profile is visible to connections only."
      );
    }

    const requestSent =
      currentUser.sentConnectionRequests.some(
        (userId) =>
          userId.toString() === user._id.toString()
      );

    const requestReceived =
      currentUser.receivedConnectionRequests.some(
        (userId) =>
          userId.toString() === user._id.toString()
      );

    const posts = await Post.find({
      author: user._id,
    })
      .populate(
        "author",
        "name university course profileImage"
      )
      .populate(
        "comments.user",
        "name university course profileImage"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user: withNormalizedProfileImage(user, req),
      posts,
      connectionStatus: {
        isConnected,
        requestSent,
        requestReceived,
      },
    });
  } catch (error) {
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  let uploadedFileId = null;

  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Please select an image to upload");
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(req.file.mimetype)) {
      res.status(400);
      throw new Error(
        "Only JPG, PNG, WEBP and GIF images are allowed."
      );
    }

    if (req.file.size > 5 * 1024 * 1024) {
      res.status(400);
      throw new Error("Image must be 5 MB or smaller.");
    }

    const optimizedBuffer = await sharp(req.file.buffer)
      .rotate()
      .resize(512, 512, {
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 90,
      })
      .toBuffer();

    const uploaded = await uploadMedia({
      buffer: optimizedBuffer,
      filename: `profile-${req.user.userId}-${Date.now()}.webp`,
      mimeType: "image/webp",
      metadata: {
        kind: "profile-image",
        userId: String(req.user.userId),
        originalName: req.file.originalname,
      },
    });

    uploadedFileId = uploaded.fileId;

    const currentUser = await User.findById(
      req.user.userId
    ).select("profileImage");

    if (!currentUser) {
      await deleteMedia(uploadedFileId);
      uploadedFileId = null;
      res.status(404);
      throw new Error("User not found");
    }

    const previousFileId = extractProfileImageFileId(
      currentUser.profileImage
    );

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        profileImage: {
          fileId: uploaded.fileId,
          mimeType: "image/webp",
        },
      },
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      await deleteMedia(uploadedFileId);
      uploadedFileId = null;
      res.status(404);
      throw new Error("User not found");
    }

    uploadedFileId = null;

    // Only delete the previous GridFS file after the new ref is saved.
    if (previousFileId) {
      try {
        await deleteMedia(previousFileId);
      } catch (cleanupError) {
        console.error(
          "Failed to delete previous profile image:",
          cleanupError
        );
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully",
      user: withNormalizedProfileImage(user, req),
    });
  } catch (error) {
    if (uploadedFileId) {
      try {
        await deleteMedia(uploadedFileId);
      } catch (cleanupError) {
        console.error(
          "Failed to clean up profile image upload:",
          cleanupError
        );
      }
    }

    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyPreferences,
  updateMyPreferences,
  getStudents,
  getUserProfile,
  uploadProfileImage,
};