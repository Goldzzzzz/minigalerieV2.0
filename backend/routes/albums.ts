import { Request, Response } from "express";
import { sql } from "../db.js";

// GET /albums/:userId
export async function getAlbumsByUser(req: Request, res: Response) {
  try {
    const userId = req.params.userId;

    const albums = await sql`
      SELECT * FROM albums
      WHERE user_id = ${userId}
      ORDER BY sort_order ASC, created_at DESC
    `;

    res.json(albums);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors du chargement des albums" });
  }
}

// POST /albums
export async function createAlbum(req: Request, res: Response) {
  try {
    const { name, icon, color, user_id } = req.body;

    const album = await sql`
      INSERT INTO albums (name, icon, color, user_id)
      VALUES (${name}, ${icon}, ${color}, ${user_id})
      RETURNING *
    `;

    res.json(album[0]);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de la création de l'album" });
  }
}