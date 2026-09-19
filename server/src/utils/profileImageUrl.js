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

  const protocol = req.protocol;
  const host = req.get("host");

  if (protocol && host) {
    return `${protocol}://${host}`;
  }

  return "";
};

/**
 * Rewrites legacy localhost upload URLs and relative upload paths
 * so clients always receive a usable absolute URL.
 */
const normalizeProfileImageUrl = (value, req) => {
  if (typeof value !== "string" || !value.trim()) {
    return value;
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

const buildProfileImageUrl = (req, fileName) => {
  const origin = getPublicServerOrigin(req);
  const imagePath = `/uploads/profile-images/${fileName}`;

  return origin ? `${origin}${imagePath}` : imagePath;
};

module.exports = {
  getPublicServerOrigin,
  normalizeProfileImageUrl,
  buildProfileImageUrl,
};
