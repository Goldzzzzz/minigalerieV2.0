import { useEffect, useState } from "react";
import { Theme } from "@/constants/Theme"; // <-- IMPORTANT

const API_URL = "https://minigaleriev2.onrender.com";

export function useTheme(userId: number | null) {
  const [rating, setRating] = useState<number | null>(null);

  // Charger le rating du jour
  const fetchTodayRating = async () => {
    if (!userId) return;

    try {
      const res = await fetch(`${API_URL}/rating/${userId}/today`);
      const data = await res.json();

      if (data && data.rating) {
        setRating(data.rating);
      } else {
        setRating(null);
      }
    } catch (err) {
      console.log("Erreur fetch rating:", err);
    }
  };

  useEffect(() => {
    fetchTodayRating();
  }, [userId]);

  // 👉 On renvoie TON thème complet + la note du jour
  return { theme: Theme, rating, refreshTheme: fetchTodayRating };
}