const Notification = require("../models/Notification");
const User = require("../models/User");
const {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_KEYS,
} = require("./mediaHelpers");

const createNotification = async ({
  recipient,
  sender,
  type,
  message,
  link = "",
}) => {
  if (!recipient || !sender) {
    return null;
  }

  if (recipient.toString() === sender.toString()) {
    return null;
  }

  const preferenceKey = NOTIFICATION_PREFERENCE_KEYS[type];

  if (preferenceKey) {
    const user = await User.findById(recipient)
      .select("preferences.notifications")
      .lean();

    const nested =
      user?.preferences?.notifications || {};

    const enabled =
      nested[preferenceKey] ??
      DEFAULT_NOTIFICATION_PREFERENCES[preferenceKey] ??
      true;

    if (!enabled) {
      return null;
    }
  }

  return Notification.create({
    recipient,
    sender,
    type,
    message,
    link,
  });
};

module.exports = createNotification;
