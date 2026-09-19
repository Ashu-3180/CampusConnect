from pathlib import Path

root = Path(r"E:/Projects/CampusConnect")

api_js = root / "client/src/services/api.js"
api_js.write_text("""const API_URL =
  import.meta.env.VITE_API_URL ||
  \"http://localhost:5000/api\";

/**
 * Origin used to serve uploaded files.
 * Derived from VITE_API_URL so local and production both work.
 */
function getUploadsOrigin() {
  try {
    return new URL(API_URL).origin;
  } catch {
    return \"https://campusconnect-api-b6x6.onrender.com\";
  }
}

/**
 * Converts relative and legacy localhost upload URLs into
 * absolute URLs that point at the configured API origin.
 *
 * Examples:
 * /uploads/profile-images/example.webp
 * http://localhost:5000/uploads/profile-images/example.webp
 * http://127.0.0.1:5000/uploads/profile-images/example.webp
 */
function normalizeImageUrl(value) {
  if (typeof value !== \"string\" || !value.trim()) {
    return value;
  }

  const origin = getUploadsOrigin();

  if (value.startsWith(\"/uploads/\")) {
    return `${origin}${value}`;
  }

  try {
    const parsed = new URL(value);
    const isLocalHost =
      parsed.hostname === \"localhost\" ||
      parsed.hostname === \"127.0.0.1\";

    if (
      isLocalHost &&
      parsed.pathname.startsWith(\"/uploads/\")
    ) {
      return `${origin}${parsed.pathname}`;
    }
  } catch {
    return value;
  }

  return value;
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
    typeof data === \"object\"
  ) {
    const normalizedData = {};

    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === \"string\" &&
        (
          key === \"profileImage\" ||
          key === \"avatar\" ||
          key === \"image\"
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

  const normalizedMessage = String(message || \"\")
    .toLowerCase()
    .trim();

  if (!normalizedMessage) {
    return false;
  }

  return (
    normalizedMessage.includes(\"session expired\") ||
    normalizedMessage.includes(\"token is required\") ||
    normalizedMessage.includes(\"jwt expired\") ||
    normalizedMessage.includes(\"jwt malformed\") ||
    normalizedMessage.includes(\"invalid token\") ||
    normalizedMessage.includes(\"authentication token\")
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
    cache: \"no-store\",

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
        \"campusconnect:session-expired\",
        {
          detail: {
            message:
              normalizedData?.message ||
              \"Session expired. Please log in again.\",
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
""", encoding="utf-8")
print("api.js updated")
