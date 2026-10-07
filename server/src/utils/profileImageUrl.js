const {
  resolveProfileImageForClient,
  isLegacyProfileImageUrl,
} = require("./mediaHelpers");

/**
 * Builds a publicly reachable profile image URL.
 *
 * Prefer SERVER_URL in production so uploads are never saved as
 * http://localhost:5000/... when the API is reached through a proxy
 * or a local admin tool.
 */
const getPublicServerOrigin = (req) => {
  const configured = (process.env.SERVER_URL || "").replace(
    /\/+$/,
    ""
  );

  if (configured) {
    return configured;
  }

  const protocol = req?.protocol;
  const host = req?.get?.("host");

  if (protocol && host) {
    return `${protocol}://${host}`;
  }

  return "";
};

/**
 * Rewrites legacy localhost upload URLs and relative upload paths
 * so clients always receive a usable absolute URL.
 * GridFS profile refs are converted to /api/media/:fileId URLs.
 */
const normalizeProfileImageUrl = (value, req) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object") {
    return resolveProfileImageForClient(value, req);
  }

  if (typeof value !== "string" || !value.trim()) {
    return value;
  }

  // Already a media API path — make absolute when possible.
  if (
    value.startsWith("/api/media/") ||
    value.includes("/api/media/")
  ) {
    const origin = getPublicServerOrigin(req);

    if (value.startsWith("/api/media/") && origin) {
      return `${origin}${value}`;
    }

    return value.replace(
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/api\/media\/)/i,
      `${origin}$3`
    );
  }

  const origin = getPublicServerOrigin(req);

  if (!origin) {
    return value;
  }

  if (value.startsWith("/uploads/")) {
    return `${origin}${value}`;
  }

  return value.replace(
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/uploads\/)/i,
    `${origin}$3`
  );
};

/**
 * @deprecated Prefer GridFS media URLs. Kept for legacy filesystem uploads.
 */
const buildProfileImageUrl = (req, fileName) => {
  const origin = getPublicServerOrigin(req);
  const imagePath = `/uploads/profile-images/${fileName}`;

  return origin ? `${origin}${imagePath}` : imagePath;
};

module.exports = {
  getPublicServerOrigin,
  normalizeProfileImageUrl,
  buildProfileImageUrl,
  isLegacyProfileImageUrl,
};
