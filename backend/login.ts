import pool from "./db.js";

export async function loginUser(email: string, password: string) {
  const result = await pool.query(
    "SELECT id, email, password FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("Utilisateur introuvable");
  }

  return result.rows[0];
}
