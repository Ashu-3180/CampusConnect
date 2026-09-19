const User = require("../models/User");
const Post = require("../models/Post");
const Collaboration = require("../models/Collaboration");
const Event = require("../models/Event");
const Notification = require("../models/Notification");
const Message = require("../models/Message");

const generateToken = require("../utils/generateToken");
const {
  normalizeProfileImageUrl,
} = require("../utils/profileImageUrl");

const path = require("path");
const fs = require("fs");

const toSafeUser = (user, req) => {
  const plain =
    typeof user.toObject === "function"
      ? user.toObject()
      : { ...user };

  delete plain.password;

  if (plain.profileImage) {
    plain.profileImage = normalizeProfileImageUrl(
      plain.profileImage,
      req
    );
  }

  return plain;
};

const registerUser = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      university,
      course,
      graduationYear,
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !password ||
      !university ||
      !course ||
      !graduationYear
    ) {
      res.status(400);
      throw new Error("Please provide all required fields");
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(409);
      throw new Error("An account with this email already exists");
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      university,
      course,
      graduationYear,
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: toSafeUser(user, req),
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select("+password");

    if (!user) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const isPasswordCorrect =
      await user.comparePassword(password);

    if (!isPasswordCorrect) {
      res.status(401);
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: toSafeUser(user, req),
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      throw new Error(
        "Current password and new password are required"
      );
    }

    if (newPassword.length < 6) {
      res.status(400);
      throw new Error(
        "New password must be at least 6 characters"
      );
    }

    if (currentPassword === newPassword) {
      res.status(400);
      throw new Error(
        "New password must be different from your current password"
      );
    }

    const user = await User.findById(
      req.user.userId
    ).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isPasswordCorrect =
      await user.comparePassword(
        currentPassword
      );

    if (!isPasswordCorrect) {
      res.status(401);
      throw new Error(
        "Current password is incorrect"
      );
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (
  req,
  res,
  next
) => {
  try {
    const {
      currentPassword,
      confirmation,
    } = req.body;

    if (!currentPassword) {
      res.status(400);
      throw new Error(
        "Current password is required"
      );
    }

    if (confirmation !== "DELETE") {
      res.status(400);
      throw new Error(
        "Please type DELETE to confirm account deletion"
      );
    }

    const user = await User.findById(
      req.user.userId
    ).select("+password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isPasswordCorrect =
      await user.comparePassword(
        currentPassword
      );

    if (!isPasswordCorrect) {
      res.status(401);
      throw new Error(
        "Current password is incorrect"
      );
    }

    const userId = user._id;

    // 1. Delete the user's posts
    await Post.deleteMany({
      author: userId,
    });

    // 2. Remove the user from likes/comments
    //    on posts belonging to other users.
    await Post.updateMany(
      {},
      {
        $pull: {
          likes: userId,
          comments: {
            user: userId,
          },
        },
      }
    );

    // 3. Delete collaborations owned by the user.
    await Collaboration.deleteMany({
      owner: userId,
    });

    // 4. Remove the user from other collaborations.
    await Collaboration.updateMany(
      {},
      {
        $pull: {
          members: userId,
          applications: {
            applicant: userId,
          },
        },
      }
    );

    // 5. Delete events created by the user.
    await Event.deleteMany({
      organizer: userId,
    });

    // 6. Remove the user from other event attendees.
    await Event.updateMany(
      {},
      {
        $pull: {
          attendees: userId,
        },
      }
    );

    // 7. Delete notifications involving this user.
    await Notification.deleteMany({
      $or: [
        { recipient: userId },
        { sender: userId },
      ],
    });

    // 8. Delete messages involving this user.
    await Message.deleteMany({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    });

    // 9. Remove this user from other users'
    //    connection/request arrays.
    await User.updateMany(
      { _id: { $ne: userId } },
      {
        $pull: {
          connections: userId,
          sentConnectionRequests: userId,
          receivedConnectionRequests: userId,
        },
      }
    );

    // 10. Delete locally stored profile images.
    try {
      const uploadDirectory = path.join(
        __dirname,
        "../../uploads/profile-images"
      );

      if (fs.existsSync(uploadDirectory)) {
        const files =
          fs.readdirSync(uploadDirectory);

        const userImagePrefix = `profile-${userId}-`;

        files
          .filter((fileName) =>
            fileName.startsWith(
              userImagePrefix
            )
          )
          .forEach((fileName) => {
            fs.unlinkSync(
              path.join(
                uploadDirectory,
                fileName
              )
            );
          });
      }
    } catch (imageError) {
      console.error(
        "Profile image cleanup failed:",
        imageError
      );
    }

    // 11. Finally delete the account itself.
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      user: toSafeUser(user, req),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
  deleteAccount,
  getCurrentUser,
};