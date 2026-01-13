import pool from "./db.js";

export async function createUser(email: string, password: string) {
  const result = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
    [email, password]
  );

  return result.rows[0];
}