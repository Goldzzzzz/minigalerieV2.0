import express from "express";
import cors from "cors";
import { signup } from "./signup.js";
import { login } from "./login.js";
import { authMiddleware } from "./middlewareAuth.js";
import { saveImage } from "./upload.js";
import { getUserById } from "./me.js";
import { fetchImages } from "./fetchImages.js";
import { likeImage, unlikeImage } from "./likes.js";
import "./db.js"; // lance la connexion Neon
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- LOGIN ---
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await login(email, password);
        res.json(result);
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
});
// --- ROUTE PROTÉGÉE ---
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "Accès autorisé",
        user: req.user,
    });
});
// --- ME (utilisateur connecté) ---
app.get("/api/me", authMiddleware, async (req, res) => {
    try {
        const user = await getUserById(req.user.userId);
        res.json(user);
    }
    catch (err) {
        res.status(404).json({ error: err.message });
    }
});
// --- UPLOAD IMAGE ---
app.post("/api/upload", authMiddleware, async (req, res) => {
    const { base64 } = req.body;
    if (!base64) {
        return res.status(400).json({ error: "Image manquante" });
    }
    try {
        const image = await saveImage(req.user.userId, base64);
        res.json({ success: true, imageId: image.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- FETCH IMAGES ---
app.get("/api/images", authMiddleware, async (req, res) => {
    try {
        const images = await fetchImages(req.user.userId);
        res.json(images);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- LIKE IMAGE ---
app.post("/api/like", authMiddleware, async (req, res) => {
    const { imageId } = req.body;
    if (!imageId) {
        return res.status(400).json({ error: "imageId manquant" });
    }
    try {
        const result = await likeImage(req.user.userId, imageId);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// --- UNLIKE IMAGE ---
app.post("/api/unlike", authMiddleware, async (req, res) => {
    const { imageId } = req.body;
    if (!imageId) {
        return res.status(400).json({ error: "imageId manquant" });
    }
    try {
        const result = await unlikeImage(req.user.userId, imageId);
        res.json(result);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
