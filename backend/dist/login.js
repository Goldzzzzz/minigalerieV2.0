import { pool } from "./db";
import bcrypt from "bcrypt";
import { signToken } from "./auth";
export async function login(email, password) {
    const result = await pool.query("SELECT id, password FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
        throw new Error("Utilisateur introuvable");
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        throw new Error("Mot de passe incorrect");
    }
    const token = signToken(user.id);
    return { token, userId: user.id };
}
