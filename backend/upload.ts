import pool from "./db.js";

export async function uploadImage(userId: number, imageData: string) {
  const result = await pool.query(
    "INSERT INTO images (user_id, data) VALUES ($1, $2) RETURNING id, data, user_id",
    [userId, imageData]
  );

  return result.rows[0];
}