import { API_URL } from "./config";

export async function uploadImage(token: string, base64: string) {
  const response = await fetch(`${API_URL}/api/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ base64 }),
  });

  return response.json();
}