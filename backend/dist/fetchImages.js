import { pool } from "./db.js";
export async function fetchImages(userId) {
    const result = await pool.query("SELECT id, data FROM images WHERE user_id = $1 ORDER BY id DESC", [userId]);
    return result.rows;
}
