const mongoose = require("mongoose");

/**
 * Default nested notification preferences for new and existing users.
 */
const DEFAULT_NOTIFICATION_PREFERENCES = {
  eventInvitations: true,
  eventReminders: true,
  eventUpdates: true,
  collaborationInvitations: true,
  collaborationUpdates: true,
  deadlineReminders: true,
};

/**
 * Maps notification types to nested preference keys.
 * Types without a mapping are always delivered (in-app).
 */
const NOTIFICATION_PREFERENCE_KEYS = {
  collaboration_application: "collaborationInvitations",
  collaboration_accepted: "collaborationUpdates",
  event_join: "eventInvitations",
  event_update: "eventUpdates",
  event_reminder: "eventReminders",
  event_deadline: "deadlineReminders",
};

const isLegacyProfileImageUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return false;
  }

  return (
    value.includes("/uploads/profile-images/") ||
    value.startsWith("/uploads/")
  );
};

const isGridFSProfileImage = (value) =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      value.fileId
  );

/**
 * Builds a client-facing media URL for a GridFS file id.
 */
const buildMediaUrl = (req, fileId) => {
  if (!fileId) {
    return "";
  }

  const configured = (process.env.SERVER_URL || "").replace(
    /\/+$/,
    ""
  );

  const mediaPath = `/api/media/${String(fileId)}`;

  if (configured) {
    return `${configured}${mediaPath}`;
  }

  const protocol = req?.protocol;
  const host = req?.get?.("host");

  if (protocol && host) {
    return `${protocol}://${host}${mediaPath}`;
  }

  return mediaPath;
};

/**
 * Serializes profileImage for API responses.
 * GridFS refs become /api/media/:fileId URLs.
 * Legacy filesystem strings are returned as-is for the caller to normalize.
 */
const resolveProfileImageForClient = (profileImage, req) => {
  if (!profileImage) {
    return "";
  }

  if (isGridFSProfileImage(profileImage)) {
    return buildMediaUrl(req, profileImage.fileId);
  }

  if (typeof profileImage === "string") {
    return profileImage;
  }

  return "";
};

const extractProfileImageFileId = (profileImage) => {
  if (isGridFSProfileImage(profileImage)) {
    return profileImage.fileId;
  }

  return null;
};

module.exports = {
  DEFAULT_NOTIFICATION_PREFERENCES,
  NOTIFICATION_PREFERENCE_KEYS,
  isLegacyProfileImageUrl,
  isGridFSProfileImage,
  buildMediaUrl,
  resolveProfileImageForClient,
  extractProfileImageFileId,
  ObjectId: mongoose.Types.ObjectId,
};
