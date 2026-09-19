const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const User = require("../models/User");
const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");
const {
  buildProfileImageUrl,
  normalizeProfileImageUrl,
} = require("../utils/profileImageUrl");

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

const updateMyProfile = async (
  req,
  res,
  next
) => {
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
      "profileImage",
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

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

const getMyPreferences = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select("preferences");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      preferences: user.preferences,
    });
  } catch (error) {
    next(error);
  }
};

const updateMyPreferences = async (
  req,
  res,
  next
) => {
  try {
    const {
      darkMode,
      emailNotifications,
      profileVisibility,
    } = req.body;

    const updates = {};

    if (darkMode !== undefined) {
      updates["preferences.darkMode"] = Boolean(
        darkMode
      );
    }

    if (emailNotifications !== undefined) {
      updates[
        "preferences.emailNotifications"
      ] = Boolean(emailNotifications);
    }

    if (profileVisibility !== undefined) {
      const allowedVisibility = [
        "everyone",
        "connections",
        "only-me",
      ];

      if (
        !allowedVisibility.includes(
          profileVisibility
        )
      ) {
        res.status(400);
        throw new Error(
          "Invalid profile visibility option"
        );
      }

      updates[
        "preferences.profileVisibility"
      ] = profileVisibility;
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

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: user.preferences,
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
          "preferences.profileVisibility":
            "everyone",
        },
        {
          "preferences.profileVisibility":
            "connections",
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

    res.status(200).json({
      success: true,
      count: students.length,
      students,
    });
  } catch (error) {
    next(error);
  }
};

const getUserProfile = async (
  req,
  res,
  next
) => {
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

    // The user can always view their own profile.
    const isOwnProfile =
      currentUserId.toString() ===
      user._id.toString();

    const isConnected =
      currentUser.connections.some(
        (userId) =>
          userId.toString() ===
          user._id.toString()
      );

    const profileVisibility =
      user.preferences?.profileVisibility ||
      "everyone";

    if (
      !isOwnProfile &&
      profileVisibility === "only-me"
    ) {
      res.status(403);
      throw new Error(
        "This profile is private."
      );
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
          userId.toString() ===
          user._id.toString()
      );

    const requestReceived =
      currentUser.receivedConnectionRequests.some(
        (userId) =>
          userId.toString() ===
          user._id.toString()
      );

    const posts = await Post.find({
      author: user._id,
    })
      .populate(
        "author",
        "name university course profileImage"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      user,
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
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Please select an image to upload");
    }

    const uploadDirectory = path.join(
      __dirname,
      "../../uploads/profile-images"
    );

    fs.mkdirSync(uploadDirectory, {
      recursive: true,
    });

    const fileName = `profile-${req.user.userId}-${Date.now()}.webp`;

    const outputPath = path.join(
      uploadDirectory,
      fileName
    );

    await sharp(req.file.buffer)
      .resize(512, 512, {
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 90,
      })
      .toFile(outputPath);

    const imageUrl = buildProfileImageUrl(req, fileName);

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        profileImage: imageUrl,
      },
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
      message: "Profile image uploaded successfully",
      user: withNormalizedProfileImage(user, req),
    });
  } catch (error) {
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