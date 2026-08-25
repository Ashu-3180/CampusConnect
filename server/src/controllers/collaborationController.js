const Collaboration = require("../models/Collaboration");

const createCollaboration = async (req, res, next) => {
  try {
    const {
      title,
      description,
      requiredSkills,
      maxMembers,
    } = req.body;

    if (
      !title ||
      !description ||
      !maxMembers
    ) {
      res.status(400);
      throw new Error(
        "Title, description and maximum members are required"
      );
    }

    const collaboration =
      await Collaboration.create({
        title,
        description,
        requiredSkills: requiredSkills || [],
        maxMembers,
        owner: req.user.userId,
        members: [req.user.userId],
      });

    await collaboration.populate(
      "owner",
      "name university course profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Collaboration created successfully",
      collaboration,
    });
  } catch (error) {
    next(error);
  }
};

const getCollaborations = async (
  req,
  res,
  next
) => {
  try {
    const { search, skill, status } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (skill && skill.trim()) {
      query.requiredSkills = {
        $regex: skill,
        $options: "i",
      };
    }

    const collaborations =
      await Collaboration.find(query)
        .populate(
          "owner",
          "name university course profileImage"
        )
        .populate(
          "members",
          "name university course profileImage"
        )
        .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: collaborations.length,
      collaborations,
    });
  } catch (error) {
    next(error);
  }
};

const getCollaborationById = async (
  req,
  res,
  next
) => {
  try {
    const collaboration =
      await Collaboration.findById(req.params.id)
        .populate(
          "owner",
          "name university course profileImage"
        )
        .populate(
          "members",
          "name university course profileImage"
        )
        .populate(
          "applications.applicant",
          "name university course skills profileImage"
        );

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    res.status(200).json({
      success: true,
      collaboration,
    });
  } catch (error) {
    next(error);
  }
};

const applyToCollaboration = async (
  req,
  res,
  next
) => {
  try {
    const { message } = req.body;

    const collaboration =
      await Collaboration.findById(req.params.id);

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    if (collaboration.status === "closed") {
      res.status(400);
      throw new Error(
        "This collaboration is closed"
      );
    }

    const userId = req.user.userId;

    if (
      collaboration.owner.toString() ===
      userId
    ) {
      res.status(400);
      throw new Error(
        "You cannot apply to your own collaboration"
      );
    }

    const alreadyMember =
      collaboration.members.some(
        (member) =>
          member.toString() === userId
      );

    if (alreadyMember) {
      res.status(400);
      throw new Error(
        "You are already a member"
      );
    }

    const alreadyApplied =
      collaboration.applications.some(
        (application) =>
          application.applicant.toString() ===
          userId
      );

    if (alreadyApplied) {
      res.status(400);
      throw new Error(
        "You have already applied"
      );
    }

    if (
      collaboration.members.length >=
      collaboration.maxMembers
    ) {
      res.status(400);
      throw new Error(
        "This team is already full"
      );
    }

    collaboration.applications.push({
      applicant: userId,
      message: message || "",
    });

    await collaboration.save();

    res.status(200).json({
      success: true,
      message: "Application submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

const updateApplicationStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    if (
      !["accepted", "rejected"].includes(
        status
      )
    ) {
      res.status(400);
      throw new Error(
        "Status must be accepted or rejected"
      );
    }

    const collaboration =
      await Collaboration.findById(req.params.id);

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    if (
      collaboration.owner.toString() !==
      req.user.userId
    ) {
      res.status(403);
      throw new Error(
        "Only the project owner can manage applications"
      );
    }

    const application =
      collaboration.applications.id(
        req.params.applicationId
      );

    if (!application) {
      res.status(404);
      throw new Error("Application not found");
    }

    if (application.status !== "pending") {
      res.status(400);
      throw new Error(
        "This application has already been processed"
      );
    }

    application.status = status;

    if (status === "accepted") {
      if (
        collaboration.members.length >=
        collaboration.maxMembers
      ) {
        res.status(400);
        throw new Error(
          "The collaboration is already full"
        );
      }

      collaboration.members.push(
        application.applicant
      );

      if (
        collaboration.members.length >=
        collaboration.maxMembers
      ) {
        collaboration.status = "closed";
      }
    }

    await collaboration.save();

    res.status(200).json({
      success: true,
      message: `Application ${status}`,
    });
  } catch (error) {
    next(error);
  }
};

const closeCollaboration = async (
  req,
  res,
  next
) => {
  try {
    const collaboration =
      await Collaboration.findById(req.params.id);

    if (!collaboration) {
      res.status(404);
      throw new Error("Collaboration not found");
    }

    if (
      collaboration.owner.toString() !==
      req.user.userId
    ) {
      res.status(403);
      throw new Error(
        "Only the owner can close this collaboration"
      );
    }

    collaboration.status = "closed";

    await collaboration.save();

    res.status(200).json({
      success: true,
      message: "Collaboration closed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCollaboration,
  getCollaborations,
  getCollaborationById,
  applyToCollaboration,
  updateApplicationStatus,
  closeCollaboration,
};