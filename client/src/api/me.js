import client from "./client";

export async function fetchMe() {
  const response = await client.get("/me");
  return response.data;
}

export async function updateMe(payload) {
  const response = await client.put("/me", payload);
  return response.data;
}

export async function updatePassword({ current_password, new_password }) {
  const response = await client.put("/me/password", {
    current_password,
    new_password,
  });
  return response.data;
}

export async function updateAvatar(file) {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await client.put("/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function fetchRecentSessions(limit = 10) {
  try {
    const response = await client.get("/me/sessions", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return [];
    }
    throw error;
  }
}
