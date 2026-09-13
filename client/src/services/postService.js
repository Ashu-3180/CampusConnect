import { apiFetch, API_URL } from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("You must be logged in.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getPosts = async () => {
  return apiFetch(
    `${API_URL}/posts`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
};

const createPost = async (postData) => {
  return apiFetch(
    `${API_URL}/posts`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(postData),
    }
  );
};

const updatePost = async (
  postId,
  postData
) => {
  return apiFetch(
    `${API_URL}/posts/${postId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(postData),
    }
  );
};

const deletePost = async (postId) => {
  return apiFetch(
    `${API_URL}/posts/${postId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );
};

const toggleLike = async (postId) => {
  return apiFetch(
    `${API_URL}/posts/${postId}/like`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );
};

const postService = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
};

export default postService;