import { API_URL } from "./config";

export async function uploadImage(userId: number, base64: string) {
  const response = await fetch(`${API_URL}/upload`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      data: base64,
    }),
  });

  return response.json();
}
