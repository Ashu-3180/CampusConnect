import API_URL from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
  };
};

const searchStudents = async (query) => {
  const response = await fetch(
    `${API_URL}/users?search=${encodeURIComponent(
      query
    )}`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to search students"
    );
  }

  return data.students;
};

const searchPosts = async (query) => {
  const response = await fetch(
    `${API_URL}/posts/search?query=${encodeURIComponent(
      query
    )}`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to search posts"
    );
  }

  return data.posts;
};

const searchCollaborations = async (
  query
) => {
  const response = await fetch(
    `${API_URL}/collaborations/search?query=${encodeURIComponent(
      query
    )}`,
    {
      headers: getHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to search collaborations"
    );
  }

  return data.collaborations;
};

const searchService = {
  searchStudents,
  searchPosts,
  searchCollaborations,
};

export default searchService;