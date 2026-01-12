import { pool } from "./db";

export async function getUserById(userId: number) {
  const result = await pool.query(
    "SELECT id, email FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Utilisateur introuvable");
  }

  return result.rows[0];
}