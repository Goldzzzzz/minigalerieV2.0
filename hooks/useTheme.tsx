import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/lib/api";

export function useTheme() {
  const [themeType, setThemeType] = useState("light");
  const [seasonalVariant, setSeasonalVariant] = useState(null);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("themeType");
      const savedSeason = await AsyncStorage.getItem("seasonalVariant");

      if (savedTheme) setThemeType(savedTheme);
      if (savedSeason) setSeasonalVariant(savedSeason);
    } catch (err) {
      console.log("Erreur chargement thème:", err);
    }
  };

  const setTheme = async (type, variant = null) => {
    try {
      setThemeType(type);
      setSeasonalVariant(variant);

      await AsyncStorage.setItem("themeType", type);
      if (variant) {
        await AsyncStorage.setItem("seasonalVariant", variant);
      } else {
        await AsyncStorage.removeItem("seasonalVariant");
      }
    } catch (err) {
      console.log("Erreur sauvegarde thème:", err);
    }
  };

  useEffect(() => {
    loadTheme();
  }, []);

  return {
    themeType,
    seasonalVariant,
    setTheme,
  };
}