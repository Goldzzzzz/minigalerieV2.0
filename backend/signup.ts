import { pool } from "./db";
import bcrypt from "bcrypt";
import { signToken } from "./auth";

export async function signup(email: string, password: string) {
  const hashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
    [email, hashed]
  );

  const userId = result.rows[0].id;
  const token = signToken(userId);

  return { token, userId };
}