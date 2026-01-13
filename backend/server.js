import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

// Connexion Neon
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test route
app.get("/", (req, res) => {
  res.send("Backend Mini Galerie OK");
});

// GET albums par userId
app.get("/albums/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM albums WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur backend lancé sur le port " + PORT);
});