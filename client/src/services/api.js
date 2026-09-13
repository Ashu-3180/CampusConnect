const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

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

export async function apiFetch(
  url,
  options = {},
  config = {}
) {
  const {
    handleAuthentication = true,
  } = config;

  const response = await fetch(url, options);

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (
    handleAuthentication &&
    isAuthenticationFailure(
      response.status,
      data?.message
    )
  ) {
    window.dispatchEvent(
      new CustomEvent(
        "campusconnect:session-expired",
        {
          detail: {
            message:
              data?.message ||
              "Session expired. Please log in again.",
          },
        }
      )
    );
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        `Request failed with status ${response.status}.`
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

export { API_URL };

export default API_URL;