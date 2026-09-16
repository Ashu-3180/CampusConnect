const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// Production backend URL
const PRODUCTION_API_ORIGIN =
  "https://campusconnect-api-b6x6.onrender.com";

/**
 * Converts old localhost upload URLs into production URLs.
 *
 * Example:
 * http://localhost:5000/uploads/profile-images/example.webp
 *
 * Becomes:
 * https://campusconnect-api-b6x6.onrender.com/uploads/profile-images/example.webp
 */
function normalizeImageUrl(value) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(
    /^http:\/\/localhost:5000(\/uploads\/)/,
    `${PRODUCTION_API_ORIGIN}$1`
  );
}

/**
 * Recursively normalizes profile image URLs
 * inside API responses, including nested objects and arrays.
 */
function normalizeResponseData(data) {
  if (Array.isArray(data)) {
    return data.map((item) =>
      normalizeResponseData(item)
    );
  }

  if (
    data !== null &&
    typeof data === "object"
  ) {
    const normalizedData = {};

    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === "string" &&
        (
          key === "profileImage" ||
          key === "avatar" ||
          key === "image"
        )
      ) {
        normalizedData[key] =
          normalizeImageUrl(value);
      } else {
        normalizedData[key] =
          normalizeResponseData(value);
      }
    }

    return normalizedData;
  }

  return data;
}

/**
 * Checks whether an error indicates an authentication failure.
 */
function isAuthenticationFailure(status, message) {
  if (status !== 401) {
    return false;
  }

  const normalizedMessage = String(message || "")
    .toLowerCase()
    .trim();

  if (!normalizedMessage) {
    return false;
  }

  return (
    normalizedMessage.includes("session expired") ||
    normalizedMessage.includes("token is required") ||
    normalizedMessage.includes("jwt expired") ||
    normalizedMessage.includes("jwt malformed") ||
    normalizedMessage.includes("invalid token") ||
    normalizedMessage.includes("authentication token")
  );
}

/**
 * Common API fetch wrapper.
 *
 * Features:
 * - Prevents browser caching
 * - Parses JSON responses
 * - Handles authentication failures
 * - Normalizes production image URLs
 * - Preserves existing error handling
 */
export async function apiFetch(
  url,
  options = {},
  config = {}
) {
  const {
    handleAuthentication = true,
  } = config;

  const response = await fetch(url, {
    ...options,

    // Prevent stale API responses.
    cache: "no-store",

    headers: {
      ...options.headers,
    },
  });

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // Normalize localhost image URLs in API responses.
  const normalizedData =
    normalizeResponseData(data);

  if (
    handleAuthentication &&
    isAuthenticationFailure(
      response.status,
      normalizedData?.message
    )
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "campusconnect:session-expired",
        {
          detail: {
            message:
              normalizedData?.message ||
              "Session expired. Please log in again.",
          },
        }
      )
    );
  }

  if (!response.ok) {
    const error = new Error(
      normalizedData?.message ||
        `Request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.data = normalizedData;

    throw error;
  }

  return normalizedData;
}

export {
  API_URL,
  normalizeImageUrl,
  normalizeResponseData,
};

export default API_URL;