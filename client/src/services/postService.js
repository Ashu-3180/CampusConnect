import API_URL from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getPosts = async () => {
  const response = await fetch(
    `${API_URL}/posts`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load posts"
    );
  }

  return data;
};

const createPost = async (postData) => {
  const response = await fetch(
    `${API_URL}/posts`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(postData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to create post"
    );
  }

  return data;
};

const updatePost = async (postId, postData) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(postData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update post"
    );
  }

  return data;
};

const deletePost = async (postId) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to delete post"
    );
  }

  return data;
};

const toggleLike = async (postId) => {
  const response = await fetch(
    `${API_URL}/posts/${postId}/like`,
    {
      method: "POST",
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update like"
    );
  }

  return data;
};

const postService = {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLike,
};

export default postService;