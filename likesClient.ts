import { authFetch } from "./authClient";

export async function likeImageClient(imageId: number) {
  const res = await authFetch("/api/like", {
    method: "POST",
    body: JSON.stringify({ imageId }),
  });

  return res.json();
}

export async function unlikeImageClient(imageId: number) {
  const res = await authFetch("/api/unlike", {
    method: "POST",
    body: JSON.stringify({ imageId }),
  });

  return res.json();
}