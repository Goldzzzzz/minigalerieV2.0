import express from "express";
import cors from "cors";

import { createUser } from "./signup.js";
import { loginUser } from "./login.js";
import { uploadImage } from "./upload.js";
import { fetchAllImages } from "./fetchImages.js";
import { likeImage, unlikeImage } from "./likes.js";
import { getUserById } from "./me.js";
import { saveRating, getTodayRating, getRatingHistory } from "./ratings.js";

const app = express();
app.use(cors());
app.use(express.json());

// Signup
app.post("/signup", async (req, res) => {
  try {
    const user = await createUser(req.body.email, req.body.password);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de l'inscription" });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la connexion" });
  }
});

// Upload image
app.post("/upload", async (req, res) => {
  try {
    const image = await uploadImage(req.body.userId, req.body.data);
    res.json(image);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de l'upload" });
  }
});

// Fetch images
app.get("/images/:userId", async (req, res) => {
  try {
    const images = await fetchAllImages(Number(req.params.userId));
    res.json(images);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors du fetch" });
  }
});

// Like
app.post("/like", async (req, res) => {
  try {
    await likeImage(req.body.userId, req.body.imageId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Erreur lors du like" });
  }
});

// Unlike
app.post("/unlike", async (req, res) => {
  try {
    await unlikeImage(req.body.userId, req.body.imageId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Erreur lors du unlike" });
  }
});

// Me
app.get("/me/:id", async (req, res) => {
  try {
    const user = await getUserById(Number(req.params.id));
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Utilisateur introuvable" });
  }
});

// ----------------------
//      RATINGS
// ----------------------

// Enregistrer un rating
app.post("/rating", async (req, res) => {
  try {
    const { userId, rating } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ error: "Missing userId or rating" });
    }

    const result = await saveRating(userId, rating);
    res.json(result);
  } catch (err) {
    console.error("Rating error:", err);
    res.status(400).json({ error: "Erreur lors du rating" });
  }
});

// Rating du jour
app.get("/rating/:userId/today", async (req, res) => {
  try {
    const rating = await getTodayRating(Number(req.params.userId));
    res.json(rating || null);
  } catch (err) {
    console.error("Rating fetch error:", err);
    res.status(400).json({ error: "Erreur lors du fetch du rating" });
  }
});

// Historique
app.get("/rating/:userId", async (req, res) => {
  try {
    const ratings = await getRatingHistory(Number(req.params.userId));
    res.json(ratings);
  } catch (err) {
    console.error("Rating history error:", err);
    res.status(400).json({ error: "Erreur lors du fetch de l'historique" });
  }
});

// ----------------------

app.listen(10000, () => {
  console.log("Backend running on port 10000");
});