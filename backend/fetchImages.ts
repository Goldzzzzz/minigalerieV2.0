import { pool } from "./db";

export async function fetchAllImages(userId: number) {
  const result = await pool.query(
    `
    SELECT 
      images.id,
      images.data,
      images.user_id,
      users.email AS author,
      COUNT(likes.image_id) AS likes,
      EXISTS (
        SELECT 1 FROM likes 
        WHERE likes.user_id = $1 
        AND likes.image_id = images.id
      ) AS liked
    FROM images
    LEFT JOIN users ON users.id = images.user_id
    LEFT JOIN likes ON likes.image_id = images.id
    GROUP BY images.id, users.email
    ORDER BY images.id DESC
    `,
    [userId]
  );

  return result.rows;
}