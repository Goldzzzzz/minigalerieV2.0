import { saveImage } from "./upload";
import { getUserById } from "./me";
import { fetchAllImages } from "./fetchImages";
import { likeImage, unlikeImage } from "./likes";

import express from "express";
import cors from "cors";
import { signup } from "./signup";
import { login } from "./login";
import { authMiddleware } from "./middlewareAuth";
import "./db"; // lance la connexion Neon

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- SIGNUP ---
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await signup(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// --- ROUTE PROTÉGÉE ---
app.get("/api/protected", authMiddleware, (req: any, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user,
  });
});

// --- ME (utilisateur connecté) ---
app.get("/api/me", authMiddleware, async (req: any, res) => {
  try {
    const user = await getUserById(req.user.userId);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// --- UPLOAD IMAGE ---
app.post("/api/upload", authMiddleware, async (req: any, res) => {
  const { base64 } = req.body;

  if (!base64) {
    return res.status(400).json({ error: "Image manquante" });
  }

  try {
    const image = await saveImage(req.user.userId, base64);
    res.json({ success: true, imageId: image.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- FETCH IMAGES ---
app.get("/api/images", authMiddleware, async (req: any, res) => {
  try {
    const images = await fetchAllImages(req.user.userId);
    res.json(images);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LIKE IMAGE ---
app.post("/api/like", authMiddleware, async (req: any, res) => {
  const { imageId } = req.body;

  if (!imageId) {
    return res.status(400).json({ error: "imageId manquant" });
  }

  try {
    const result = await likeImage(req.user.userId, imageId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- UNLIKE IMAGE ---
app.post("/api/unlike", authMiddleware, async (req: any, res) => {
  const { imageId } = req.body;

  if (!imageId) {
    return res.status(400).json({ error: "imageId manquant" });
  }

  try {
    const result = await unlikeImage(req.user.userId, imageId);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});