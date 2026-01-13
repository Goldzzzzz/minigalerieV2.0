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

/* -----------------------------
   ALBUMS
------------------------------*/

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
  const { user_id, name, icon, color } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO albums (user_id, name, icon, color) VALUES ($1, $2, $3, $4) RETURNING *",
      [user_id, name, icon, color]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur POST /albums :", error);
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

/* -----------------------------
   PHOTOS
------------------------------*/

// GET photos par album
app.get("/photos/:albumId", async (req, res) => {
  const { albumId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM photos WHERE album_id = $1 ORDER BY created_at DESC",
      [albumId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur GET /photos/:albumId :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST ajouter une photo
app.post("/photos", async (req, res) => {
  const { album_id, image_uri } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO photos (album_id, image_uri) VALUES ($1, $2) RETURNING *",
      [album_id, image_uri]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erreur POST /photos :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE photo
app.delete("/photos/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM photos WHERE id = $1", [id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /photos/:id :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -----------------------------
   RATINGS
------------------------------*/

// GET ratings par liste d’IDs
app.get("/ratings/by-photo-ids", async (req, res) => {
  const ids = req.query.ids?.split(",") || [];

  try {
    const result = await pool.query(
      `SELECT * FROM photo_ratings WHERE photo_id = ANY($1::uuid[])`,
      [ids]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Erreur GET /ratings :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

/* -----------------------------
   PARENTAL SETTINGS
------------------------------*/

app.get("/parental-settings/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM parental_control_settings WHERE user_id = $1 LIMIT 1",
      [userId]
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    console.error("Erreur GET /parental-settings :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur backend lancé sur le port " + PORT);
});