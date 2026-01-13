import { pool } from "./db.js";
export async function likeImage(userId, imageId) {
    const result = await pool.query("INSERT INTO likes (user_id, image_id) VALUES ($1, $2) RETURNING id", [userId, imageId]);
    return result.rows[0];
}
export async function unlikeImage(userId, imageId) {
    const result = await pool.query("DELETE FROM likes WHERE user_id = $1 AND image_id = $2 RETURNING id", [userId, imageId]);
    return result.rows[0];
}
