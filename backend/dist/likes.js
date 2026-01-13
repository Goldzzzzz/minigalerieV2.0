import pool from "./db.js";
export async function likeImage(userId, imageId) {
    await pool.query("INSERT INTO likes (user_id, image_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [userId, imageId]);
    return { success: true };
}
export async function unlikeImage(userId, imageId) {
    await pool.query("DELETE FROM likes WHERE user_id = $1 AND image_id = $2", [userId, imageId]);
    return { success: true };
}
