import { authFetch } from "./authClient";

export async function uploadImage(base64: string) {
  const res = await authFetch("/api/upload", {
    method: "POST",
    body: JSON.stringify({ base64 }),
  });

  return res.json();
}