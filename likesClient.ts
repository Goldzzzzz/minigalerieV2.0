import { API_URL } from "./config";

export async function likeImage(userId: number, imageId: number) {
  const response = await fetch(`${API_URL}/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, imageId }),
  });

  return response.json();
}

export async function unlikeImage(userId: number, imageId: number) {
  const response = await fetch(`${API_URL}/unlike`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, imageId }),
  });

  return response.json();
}
