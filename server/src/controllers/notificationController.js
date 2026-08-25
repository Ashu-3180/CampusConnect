const Notification = require(
  "../models/Notification"
);

const getMyNotifications = async (
  req,
  res,
  next
) => {
  try {
    const notifications =
      await Notification.find({
        recipient: req.user.userId,
      })
        .populate(
          "sender",
          "name profileImage"
        )
        .sort({
          createdAt: -1,
        });

    const unreadCount =
      notifications.filter(
        (notification) =>
          !notification.isRead
      ).length;

    res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

const markNotificationAsRead = async (
  req,
  res,
  next
) => {
  try {
    const notification =
      await Notification.findOne({
        _id: req.params.id,
        recipient: req.user.userId,
      });

    if (!notification) {
      res.status(404);
      throw new Error(
        "Notification not found"
      );
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllNotificationsAsRead = async (
  req,
  res,
  next
) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user.userId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );

    res.status(200).json({
      success: true,
      message:
        "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};