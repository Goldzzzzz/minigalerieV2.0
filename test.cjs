const { Pool } = require("pg");

// Ta vraie connection string Neon
const connectionString = "postgres://neondb_owner:npg_10dwvbuFYozJ@ep-shiny-water-ah1tu5pb-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Connexion Neon OK:", result.rows[0]);
  } catch (error) {
    console.error("Erreur de connexion Neon:", error);
  }
}

testConnection();