import { API_URL } from "./config";

export async function likeImage(token: string, imageId: number) {
  const response = await fetch(`${API_URL}/api/like`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageId }),
  });

  return response.json();
}

export async function unlikeImage(token: string, imageId: number) {
  const response = await fetch(`${API_URL}/api/unlike`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ imageId }),
  });

  return response.json();
}