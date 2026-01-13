import React, { useEffect, useState } from "react";
import RatingModal from "./RatingModal";

const API_URL = "https://minigaleriev2.onrender.com"; // adapte si ton URL est différent

export default function DailyRatingModal({ userId }) {
  const [visible, setVisible] = useState(false);
  const [todayRating, setTodayRating] = useState<number | null>(null);

  // Vérifier si l'utilisateur a déjà noté aujourd'hui
  const checkTodayRating = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/rating/${userId}/today`);
      const data = await res.json();

      if (data && data.rating) {
        setTodayRating(data.rating);
        setVisible(false); // déjà noté → pas besoin d'afficher
      } else {
        setTodayRating(null);
        setVisible(true); // pas encore noté → afficher le modal
      }
    } catch (err) {
      console.log("Erreur fetch rating:", err);
      setVisible(true); // en cas d'erreur → on affiche quand même
    }
  };

  useEffect(() => {
    checkTodayRating();
  }, [userId]);

  return (
    <RatingModal
      visible={visible}
      onClose={() => setVisible(false)}
      userId={userId}
    />
  );
}
