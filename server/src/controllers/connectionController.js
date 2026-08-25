const User = require("../models/User");
const createNotification = require(
  "../utils/createNotification"
);

const sendConnectionRequest = async (
  req,
  res,
  next
) => {
  try {
    const senderId = req.user.userId;
    const receiverId = req.params.userId;

    if (senderId === receiverId) {
      res.status(400);
      throw new Error(
        "You cannot send a connection request to yourself"
      );
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!receiver) {
      res.status(404);
      throw new Error("User not found");
    }

    const alreadyConnected =
      sender.connections.some(
        (connectionId) =>
          connectionId.toString() === receiverId
      );

    if (alreadyConnected) {
      res.status(400);
      throw new Error(
        "You are already connected with this user"
      );
    }

    const requestAlreadySent =
      sender.sentConnectionRequests.some(
        (userId) =>
          userId.toString() === receiverId
      );

    if (requestAlreadySent) {
      res.status(400);
      throw new Error(
        "Connection request already sent"
      );
    }

    const requestReceived =
      sender.receivedConnectionRequests.some(
        (userId) =>
          userId.toString() === receiverId
      );

    if (requestReceived) {
      res.status(400);
      throw new Error(
        "This user has already sent you a connection request"
      );
    }

    sender.sentConnectionRequests.push(
      receiver._id
    );

    receiver.receivedConnectionRequests.push(
      sender._id
    );

    await Promise.all([
      sender.save(),
      receiver.save(),
    ]);

    await createNotification({
      recipient: receiver._id,
      sender: sender._id,
      type: "connection_request",
      message: "sent you a connection request",
      link: "/app/network",
    });

    res.status(201).json({
      success: true,
      message: "Connection request sent",
    });
  } catch (error) {
    next(error);
  }
};

const cancelConnectionRequest = async (
  req,
  res,
  next
) => {
  try {
    const senderId = req.user.userId;
    const receiverId = req.params.userId;

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId),
    ]);

    if (!receiver) {
      res.status(404);
      throw new Error("User not found");
    }

    sender.sentConnectionRequests =
      sender.sentConnectionRequests.filter(
        (userId) =>
          userId.toString() !== receiverId
      );

    receiver.receivedConnectionRequests =
      receiver.receivedConnectionRequests.filter(
        (userId) =>
          userId.toString() !== senderId
      );

    await Promise.all([
      sender.save(),
      receiver.save(),
    ]);

    res.status(200).json({
      success: true,
      message: "Connection request cancelled",
    });
  } catch (error) {
    next(error);
  }
};

const acceptConnectionRequest = async (
  req,
  res,
  next
) => {
  try {
    const currentUserId = req.user.userId;
    const senderId = req.params.userId;

    const [currentUser, sender] =
      await Promise.all([
        User.findById(currentUserId),
        User.findById(senderId),
      ]);

    if (!sender) {
      res.status(404);
      throw new Error("User not found");
    }

    const requestExists =
      currentUser.receivedConnectionRequests.some(
        (userId) =>
          userId.toString() === senderId
      );

    if (!requestExists) {
      res.status(400);
      throw new Error(
        "No pending connection request from this user"
      );
    }

    currentUser.receivedConnectionRequests =
      currentUser.receivedConnectionRequests.filter(
        (userId) =>
          userId.toString() !== senderId
      );

    sender.sentConnectionRequests =
      sender.sentConnectionRequests.filter(
        (userId) =>
          userId.toString() !== currentUserId
      );

    currentUser.connections.push(sender._id);
    sender.connections.push(currentUser._id);

    await Promise.all([
      currentUser.save(),
      sender.save(),
    ]);

    await createNotification({
      recipient: sender._id,
      sender: currentUser._id,
      type: "connection_accepted",
      message: "accepted your connection request",
      link: `/app/profile/${currentUser._id}`,
    });

    res.status(200).json({
      success: true,
      message: "Connection request accepted",
    });
  } catch (error) {
    next(error);
  }
};

const rejectConnectionRequest = async (
  req,
  res,
  next
) => {
  try {
    const currentUserId = req.user.userId;
    const senderId = req.params.userId;

    const [currentUser, sender] =
      await Promise.all([
        User.findById(currentUserId),
        User.findById(senderId),
      ]);

    if (!sender) {
      res.status(404);
      throw new Error("User not found");
    }

    currentUser.receivedConnectionRequests =
      currentUser.receivedConnectionRequests.filter(
        (userId) =>
          userId.toString() !== senderId
      );

    sender.sentConnectionRequests =
      sender.sentConnectionRequests.filter(
        (userId) =>
          userId.toString() !== currentUserId
      );

    await Promise.all([
      currentUser.save(),
      sender.save(),
    ]);

    res.status(200).json({
      success: true,
      message: "Connection request rejected",
    });
  } catch (error) {
    next(error);
  }
};

const getMyConnections = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).populate(
      "connections",
      "name university course graduationYear skills profileImage"
    );

    res.status(200).json({
      success: true,
      count: user.connections.length,
      connections: user.connections,
    });
  } catch (error) {
    next(error);
  }
};

const getReceivedRequests = async (
  req,
  res,
  next
) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).populate(
      "receivedConnectionRequests",
      "name university course skills profileImage"
    );

    res.status(200).json({
      success: true,
      count:
        user.receivedConnectionRequests.length,
      requests:
        user.receivedConnectionRequests,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendConnectionRequest,
  cancelConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getMyConnections,
  getReceivedRequests,
};