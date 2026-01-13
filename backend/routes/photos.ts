import { Request, Response } from "express";
import { sql } from "../db.js";

// GET /photos/:albumId
export async function getPhotosByAlbum(req: Request, res: Response) {
  try {
    const albumId = req.params.albumId;

    const photos = await sql`
      SELECT * FROM photos
      WHERE album_id = ${albumId}
      ORDER BY sort_order ASC, created_at DESC
    `;

    res.json(photos);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors du chargement des photos" });
  }
}

// POST /photos
export async function createPhoto(req: Request, res: Response) {
  try {
    const { album_id, image_uri, thumbnail_uri } = req.body;

    const photo = await sql`
      INSERT INTO photos (album_id, image_uri, thumbnail_uri)
      VALUES (${album_id}, ${image_uri}, ${thumbnail_uri})
      RETURNING *
    `;

    res.json(photo[0]);
  } catch (err) {
    res.status(400).json({ error: "Erreur lors de l'ajout de la photo" });
  }
}