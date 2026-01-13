import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connexion Neon
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
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
    console.error("Erreur GET /albums/:userId :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST créer un album
app.post("/albums", async (req, res) => {
  const { user_id, title, cover_url } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO albums (user_id, title, cover_url) VALUES ($1, $2, $3) RETURNING *",
      [user_id, title, cover_url]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur POST /albums :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT modifier un album
app.put("/albums/:id", async (req, res) => {
  const { id } = req.params;
  const { title, cover_url } = req.body;

  try {
    const result = await pool.query(
      "UPDATE albums SET title = $1, cover_url = $2 WHERE id = $3 RETURNING *",
      [title, cover_url, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur PUT /albums/:id :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE supprimer un album
app.delete("/albums/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM albums WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /albums/:id :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur backend lancé sur le port " + PORT);
});