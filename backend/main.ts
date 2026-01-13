import express, { Request, Response } from "express";
import cors from "cors";

import { signup } from "./signup.js";
import { login } from "./login.js";
import { authMiddleware } from "./middlewareAuth.js";

import { saveImage } from "./upload.js";
import { getUserById } from "./me.js";
import { fetchAllImages } from "./fetchImages.js";
import { likeImage, unlikeImage } from "./likes.js";

import "./db.js"; // lance la connexion Neon

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- SIGNUP ---
app.post("/api/signup", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await signup(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LOGIN ---
app.post("/api/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await login(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

// --- ROUTE PROTÉGÉE ---
app.get("/api/protected", authMiddleware, (req: any, res: Response) => {
  res.json({
    message: "Accès autorisé",
    user: req.user,
  });
});

// --- ME (utilisateur connecté) ---
app.get("/api/me", authMiddleware, async (req: any, res: Response) => {
  try {
    const user = await getUserById(req.user.userId);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// --- UPLOAD IMAGE ---
app.post("/api/upload", authMiddleware, async (req: any, res: Response) => {
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
app.get("/api/images", authMiddleware, async (req: any, res: Response) => {
  try {
    const images = await fetchAllImages(req.user.userId);
    res.json(images);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- LIKE IMAGE ---
app.post("/api/like", authMiddleware, async (req: any, res: Response) => {
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
app.post("/api/unlike", authMiddleware, async (req: any, res: Response) => {
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