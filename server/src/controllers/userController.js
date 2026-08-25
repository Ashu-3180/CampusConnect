const User = require("../models/User");
const Post = require("../models/Post");
const createNotification = require("../utils/createNotification");

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
      user,
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
      user,
    });
  } catch (error) {
    next(error);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const { search } = req.query;

    const query = {
      _id: {
        $ne: req.user.userId,
      },
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
    const user = await User.findById(
      req.params.id
    ).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

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
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getStudents,
  getUserProfile,
};