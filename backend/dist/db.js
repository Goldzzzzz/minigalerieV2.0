import { Pool } from "pg";
// Ton URL Neon
const connectionString = "postgres://neondb_owner:npg_10dwvbuFYozJ@ep-shiny-water-ah1tu5pb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
export const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});
// Test de connexion
pool
    .query("SELECT NOW()")
    .then((res) => {
    console.log("Connexion OK :", res.rows[0]);
})
    .catch((err) => {
    console.error("Erreur de connexion :", err);
});
