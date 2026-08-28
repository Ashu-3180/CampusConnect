const Message = require("../models/Message");
const User = require("../models/User");

// Send a message
const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, content } = req.body;

    // Validate input
    if (!receiverId || !content?.trim()) {
      res.status(400);
      throw new Error(
        "Receiver and message content are required"
      );
    }

    // Prevent messaging yourself
    if (senderId === receiverId) {
      res.status(400);
      throw new Error(
        "You cannot send a message to yourself"
      );
    }

    // Check if receiver exists
    const receiver = await User.findById(
      receiverId
    );

    if (!receiver) {
      res.status(404);
      throw new Error("Receiver not found");
    }

    // Check whether users are connected
    const sender = await User.findById(senderId);

    const isConnected =
      sender.connections.some(
        (connectionId) =>
          connectionId.toString() ===
          receiverId.toString()
      );

    if (!isConnected) {
      res.status(403);
      throw new Error(
        "You can only message your connections"
      );
    }

    // Create message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    // Populate sender information
    await message.populate(
      "sender",
      "name profileImage"
    );

    // Get Socket.IO and connected users
    const io = req.app.get("io");

    const connectedUsers =
      req.app.get("connectedUsers");

    // Find the receiver's socket
    const receiverSocketId =
      connectedUsers.get(
        receiverId.toString()
      );

    // Send the message instantly if the receiver is currently online
    if (receiverSocketId) {
      io.to(receiverSocketId).emit(
        "newMessage",
        message
      );
    }

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// Get conversation with another user
const getConversation = async (
  req,
  res,
  next
) => {
  try {
    const currentUserId = req.user.userId;
    const { userId } = req.params;

    const otherUser = await User.findById(
      userId
    ).select(
      "name university course profileImage"
    );

    if (!otherUser) {
      res.status(404);
      throw new Error("User not found");
    }

    const currentUser = await User.findById(
      currentUserId
    );

    const isConnected =
      currentUser.connections.some(
        (connectionId) =>
          connectionId.toString() ===
          userId.toString()
      );

    if (!isConnected) {
      res.status(403);
      throw new Error(
        "You can only view conversations with your connections"
      );
    }

    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: currentUserId,
        },
      ],
    })
      .populate(
        "sender",
        "name profileImage"
      )
      .sort({ createdAt: 1 });

    // Mark received unread messages as read
    const readResult = await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    // Notify the sender that their messages were read
    if (readResult.modifiedCount > 0) {
      const io = req.app.get("io");
      const connectedUsers =
        req.app.get("connectedUsers");

      const senderSockets =
        connectedUsers.get(userId);

      if (senderSockets) {
        senderSockets.forEach((socketId) => {
          io.to(socketId).emit("messagesRead", {
            readerId: currentUserId,
          });
        });
      }
    }

    res.status(200).json({
      success: true,
      otherUser,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// Get all conversations
const getConversations = async (
  req,
  res,
  next
) => {
  try {
    const currentUserId = req.user.userId;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId },
        { receiver: currentUserId },
      ],
    })
      .populate(
        "sender receiver",
        "name university course profileImage"
      )
      .sort({ createdAt: -1 });

    // Store latest message and unread count
    // for each conversation
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const isSender =
        message.sender._id.toString() ===
        currentUserId.toString();

      const otherUser = isSender
        ? message.receiver
        : message.sender;

      const otherUserId =
        otherUser._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages received
      if (
        message.receiver._id.toString() ===
          currentUserId.toString() &&
        !message.isRead
      ) {
        const conversation =
          conversationsMap.get(otherUserId);

        conversation.unreadCount += 1;
      }
    });

    const conversations = Array.from(
      conversationsMap.values()
    );

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getConversations,
};