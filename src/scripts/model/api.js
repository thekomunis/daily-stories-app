import CONFIG from "../config";

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_API_URL}/register`,
  LOGIN: `${CONFIG.BASE_API_URL}/login`,
  STORIES: `${CONFIG.BASE_API_URL}/stories`,
};

// Function to register a new user
export async function registerUser(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      email: email,
      password: password,
    }),
  });

  const data = await response.json();
  return data;
}

// Function to login a user
export async function loginUser(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  });

  const data = await response.json();
  if (!data.error) {
    localStorage.setItem("userToken", data.loginResult.token);
    localStorage.setItem("userId", data.loginResult.userId);
    localStorage.setItem("userName", data.loginResult.name);
    return { error: false, message: data.message };
  } else {
    return { error: true, message: data.message };
  }
}

// Function to fetch all stories
export async function getAllStories() {
  const token = localStorage.getItem("userToken");
  if (!token) {
    window.location.href = "#/login";
    return;
  }
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data; // Return the API response
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return { error: true, message: "Failed to fetch stories" };
  }
}

// Function to fetch story details by ID
export async function getStoryDetails(storyId) {
  const token = localStorage.getItem("userToken");
  if (!token) {
    window.location.href = "#/login";
    return;
  }

  try {
    const response = await fetch(`${ENDPOINTS.STORIES}/${storyId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data; // Return the API response
  } catch (error) {
    console.error("Failed to fetch story details:", error);
    return { error: true, message: "Failed to fetch story details" };
  }
}

// Function to post a new story
export async function postStory(description, photo, lat, lon) {
  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  if (lat) formData.append("lat", lat);
  if (lon) formData.append("lon", lon);

  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("userToken")}`,
      },
      body: formData,
    });
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error submitting story:", error);
    return { error: true, message: "Failed to submit story" };
  }
}
