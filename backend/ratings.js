import db from "./db.js";

// Enregistrer ou mettre à jour un rating du jour
export async function saveRating(userId, rating) {
  const today = new Date().toISOString().split("T")[0];

  const existing = await db("ratings")
    .where({ user_id: userId, date: today })
    .first();

  if (existing) {
    await db("ratings")
      .where({ id: existing.id })
      .update({ rating });

    return { updated: true };
  }

  await db("ratings").insert({
    user_id: userId,
    rating,
    date: today,
  });

  return { created: true };
}

// Récupérer le rating du jour
export async function getTodayRating(userId) {
  const today = new Date().toISOString().split("T")[0];

  return await db("ratings")
    .where({ user_id: userId, date: today })
    .first();
}

// Récupérer l’historique
export async function getRatingHistory(userId) {
  return await db("ratings")
    .where({ user_id: userId })
    .orderBy("date", "desc");
}