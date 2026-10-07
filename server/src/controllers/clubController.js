const Club = require("../models/Club");

const createClub = async (req, res, next) => {
  try {
    const { name, description, category } = req.body;

    if (!name?.trim() || !description?.trim()) {
      res.status(400);
      throw new Error(
        "Club name and description are required"
      );
    }

    const club = await Club.create({
      name: name.trim(),
      description: description.trim(),
      category: category || "Other",
      creator: req.user.userId,
      members: [req.user.userId],
    });

    const populated = await Club.findById(club._id)
      .populate("creator", "name university course profileImage")
      .populate("members", "name university course profileImage");

    res.status(201).json({
      success: true,
      message: "Club created successfully",
      club: populated,
    });
  } catch (error) {
    next(error);
  }
};

const getClubs = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search?.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    if (category?.trim()) {
      query.category = category.trim();
    }

    const clubs = await Club.find(query)
      .populate("creator", "name university course profileImage")
      .populate("members", "name university course profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error) {
    next(error);
  }
};

const getMyClubs = async (req, res, next) => {
  try {
    const clubs = await Club.find({
      members: req.user.userId,
    })
      .populate("creator", "name university course profileImage")
      .populate("members", "name university course profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error) {
    next(error);
  }
};

const getClubById = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id)
      .populate("creator", "name university course profileImage")
      .populate("members", "name university course profileImage");

    if (!club) {
      res.status(404);
      throw new Error("Club not found");
    }

    res.status(200).json({
      success: true,
      club,
    });
  } catch (error) {
    next(error);
  }
};

const joinClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      res.status(404);
      throw new Error("Club not found");
    }

    const userId = req.user.userId;
    const alreadyMember = club.members.some(
      (member) => member.toString() === userId
    );

    if (alreadyMember) {
      res.status(400);
      throw new Error("You are already a member of this club");
    }

    club.members.push(userId);
    await club.save();

    const populated = await Club.findById(club._id)
      .populate("creator", "name university course profileImage")
      .populate("members", "name university course profileImage");

    res.status(200).json({
      success: true,
      message: "Joined club successfully",
      club: populated,
    });
  } catch (error) {
    next(error);
  }
};

const leaveClub = async (req, res, next) => {
  try {
    const club = await Club.findById(req.params.id);

    if (!club) {
      res.status(404);
      throw new Error("Club not found");
    }

    const userId = req.user.userId;

    if (club.creator.toString() === userId) {
      res.status(400);
      throw new Error(
        "Club creators cannot leave. Delete the club instead or transfer ownership later."
      );
    }

    const isMember = club.members.some(
      (member) => member.toString() === userId
    );

    if (!isMember) {
      res.status(400);
      throw new Error("You are not a member of this club");
    }

    club.members = club.members.filter(
      (member) => member.toString() !== userId
    );

    await club.save();

    const populated = await Club.findById(club._id)
      .populate("creator", "name university course profileImage")
      .populate("members", "name university course profileImage");

    res.status(200).json({
      success: true,
      message: "Left club successfully",
      club: populated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClub,
  getClubs,
  getMyClubs,
  getClubById,
  joinClub,
  leaveClub,
};
