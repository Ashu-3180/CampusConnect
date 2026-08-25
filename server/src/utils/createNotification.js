const Notification = require(
  "../models/Notification"
);

const createNotification = async ({
  recipient,
  sender,
  type,
  message,
  link = "",
}) => {
  if (
    recipient.toString() ===
    sender?.toString()
  ) {
    return null;
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