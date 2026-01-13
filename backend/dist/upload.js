import { pool } from "./db.js";
export async function saveImage(userId, base64) {
    const result = await pool.query("INSERT INTO images (user_id, data) VALUES ($1, $2) RETURNING id", [userId, base64]);
    return result.rows[0];
}
