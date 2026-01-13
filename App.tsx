import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import DailyRatingModal from "./components/DailyRatingModal";
import { useTheme } from "./hooks/useTheme";
import HomeScreen from "./screens/HomeScreen"; // adapte selon ton projet

export default function App() {
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger le userId depuis le stockage local
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem("userId");
        if (stored) setUserId(Number(stored));
      } catch (err) {
        console.log("Erreur chargement user:", err);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const { theme } = useTheme(userId);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme === "happy" ? "#FFEAA7" : theme === "sad" ? "#D6E0F0" : "#FFFFFF" }}>
      {userId && <DailyRatingModal userId={userId} />}
      <HomeScreen userId={userId} />
    </View>
  );
}