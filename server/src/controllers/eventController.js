const Event = require("../models/Event");

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      date,
      location,
      category,
      maxAttendees,
      image,
    } = req.body;

    if (!title || !description || !date || !location) {
      res.status(400);
      throw new Error(
        "Title, description, date and location are required"
      );
    }

    const eventDate = new Date(date);

    if (Number.isNaN(eventDate.getTime())) {
      res.status(400);
      throw new Error("Invalid event date");
    }

    if (eventDate <= new Date()) {
      res.status(400);
      throw new Error("Event date must be in the future");
    }

    const event = await Event.create({
      title,
      description,
      date: eventDate,
      location,
      category: category || "Other",
      maxAttendees: maxAttendees || 100,
      image: image || "",
      organizer: req.user.userId,
      attendees: [req.user.userId],
    });

    await event.populate(
      "organizer",
      "name university course profileImage"
    );

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all upcoming events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res, next) => {
  try {
    const { search, category } = req.query;

    const query = {
      date: { $gte: new Date() },
    };

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
        {
          location: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (category && category.trim()) {
      query.category = category;
    }

    const events = await Event.find(query)
      .populate(
        "organizer",
        "name university course profileImage"
      )
      .populate(
        "attendees",
        "name university course profileImage"
      )
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single event
// @route   GET /api/events/:id
// @access  Private
const getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate(
        "organizer",
        "name university course profileImage"
      )
      .populate(
        "attendees",
        "name university course profileImage"
      );

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    res.status(200).json({
      success: true,
      event,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join an event
// @route   POST /api/events/:id/join
// @access  Private
const joinEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    const userId = req.user.userId;

    if (event.organizer.toString() === userId) {
      res.status(400);
      throw new Error("You are already the organizer of this event");
    }

    const alreadyJoined = event.attendees.some(
      (attendee) => attendee.toString() === userId
    );

    if (alreadyJoined) {
      res.status(400);
      throw new Error("You have already joined this event");
    }

    if (event.attendees.length >= event.maxAttendees) {
      res.status(400);
      throw new Error("This event is already full");
    }

    event.attendees.push(userId);

    await event.save();

    res.status(200).json({
      success: true,
      message: "Event joined successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave an event
// @route   DELETE /api/events/:id/leave
// @access  Private
const leaveEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    const userId = req.user.userId;

    if (event.organizer.toString() === userId) {
      res.status(400);
      throw new Error(
        "The event organizer cannot leave their own event"
      );
    }

    const isAttendee = event.attendees.some(
      (attendee) => attendee.toString() === userId
    );

    if (!isAttendee) {
      res.status(400);
      throw new Error("You have not joined this event");
    }

    event.attendees = event.attendees.filter(
      (attendee) => attendee.toString() !== userId
    );

    await event.save();

    res.status(200).json({
      success: true,
      message: "You left the event successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get events created by logged-in user
// @route   GET /api/events/my
// @access  Private
const getMyEvents = async (req, res, next) => {
  try {
    const events = await Event.find({
      organizer: req.user.userId,
    })
      .populate(
        "organizer",
        "name university course profileImage"
      )
      .populate(
        "attendees",
        "name university course profileImage"
      )
      .sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      res.status(404);
      throw new Error("Event not found");
    }

    if (event.organizer.toString() !== req.user.userId) {
      res.status(403);
      throw new Error(
        "Only the event organizer can delete this event"
      );
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  leaveEvent,
  getMyEvents,
  deleteEvent,
};