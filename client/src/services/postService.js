import { apiFetch, API_URL } from "./api";

/**
 * Returns authentication headers for JSON requests.
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in.");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

/**
 * Returns authentication headers for multipart/FormData requests.
 *
 * Do NOT manually set Content-Type here.
 * The browser must add the multipart boundary automatically.
 */
const getMultipartHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in.");
  }

  return {
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Builds FormData for post create/update requests.
 *
 * Supported fields:
 * - content
 * - category
 * - removeMedia
 * - mediaFile
 */
const buildPostFormData = ({
  content = "",
  category = "General",
  removeMedia = false,
  mediaFile = null,
}) => {
  const formData = new FormData();

  formData.append("content", content ?? "");
  formData.append("category", category || "General");

  if (removeMedia) {
    formData.append("removeMedia", "true");
  }

  if (mediaFile) {
    formData.append("media", mediaFile);
  }

  return formData;
};

/**
 * Get all posts.
 */
const getPosts = async () => {
  return apiFetch(`${API_URL}/posts`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
};

/**
 * Get a single post by ID.
 */
const getPostById = async (postId) => {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  return apiFetch(`${API_URL}/posts/${postId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
};

/**
 * Create a post.
 *
 * Supported:
 * - text only
 * - image only
 * - video only
 * - text + image
 * - text + video
 *
 * For media uploads, pass:
 * {
 *   content,
 *   category,
 *   mediaFile
 * }
 *
 * Without media, a normal JSON request is used.
 */
const createPost = async (postData = {}) => {
  const {
    content = "",
    category = "General",
    mediaFile = null,
  } = postData;

  if (mediaFile) {
    const formData = buildPostFormData({
      content,
      category,
      mediaFile,
    });

    return apiFetch(`${API_URL}/posts`, {
      method: "POST",
      headers: getMultipartHeaders(),
      body: formData,
    });
  }

  return apiFetch(`${API_URL}/posts`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      content,
      category,
    }),
  });
};

/**
 * Update a post.
 *
 * Supported:
 * - text/category update
 * - media replacement
 * - media removal
 *
 * Example:
 * {
 *   content,
 *   category,
 *   mediaFile,
 *   removeMedia
 * }
 */
const updatePost = async (
  postId,
  postData = {}
) => {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  const {
    content,
    category,
    mediaFile = null,
    removeMedia = false,
  } = postData;

  const hasMediaUpload = Boolean(mediaFile);
  const hasMediaRemoval = Boolean(removeMedia);

  if (hasMediaUpload || hasMediaRemoval) {
    const formData = buildPostFormData({
      content: content ?? "",
      category: category || "General",
      removeMedia,
      mediaFile,
    });

    return apiFetch(`${API_URL}/posts/${postId}`, {
      method: "PUT",
      headers: getMultipartHeaders(),
      body: formData,
    });
  }

  return apiFetch(`${API_URL}/posts/${postId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      ...(content !== undefined
        ? { content }
        : {}),
      ...(category !== undefined
        ? { category }
        : {}),
    }),
  });
};

/**
 * Delete a post.
 */
const deletePost = async (postId) => {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  return apiFetch(`${API_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

/**
 * Like or unlike a post.
 */
const toggleLike = async (postId) => {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  return apiFetch(
    `${API_URL}/posts/${postId}/like`,
    {
      method: "POST",
      headers: getAuthHeaders(),
    }
  );
};

/**
 * Add a comment to a post.
 */
const addComment = async (
  postId,
  text
) => {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  if (
    typeof text !== "string" ||
    !text.trim()
  ) {
    throw new Error(
      "Comment text is required."
    );
  }

  return apiFetch(
    `${API_URL}/posts/${postId}/comments`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        text: text.trim(),
      }),
    }
  );
};

/**
 * Delete one of the current user's comments.
 */
const deleteComment = async (
  postId,
  commentId
) => {
  if (!postId) {
    throw new Error("Post ID is required.");
  }

  if (!commentId) {
    throw new Error(
      "Comment ID is required."
    );
  }

  return apiFetch(
    `${API_URL}/posts/${postId}/comments/${commentId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
};

/**
 * Search posts by text content.
 */
const searchPosts = async (query) => {
  if (
    typeof query !== "string" ||
    !query.trim()
  ) {
    throw new Error(
      "Search query is required."
    );
  }

  const params = new URLSearchParams({
    query: query.trim(),
  });

  return apiFetch(
    `${API_URL}/posts/search?${params.toString()}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );
};

const postService = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  searchPosts,
};

export default postService;