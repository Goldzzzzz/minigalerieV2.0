import React, { useState, useEffect } from "react";
import { Modal, View, Text, TouchableOpacity } from "react-native";

const API_URL = "https://minigaleriev2.onrender.com"; // adapte si ton URL est différente

export default function RatingModal({ visible, onClose, userId }) {
  const [rating, setRating] = useState<number | null>(null);
  const [todayRating, setTodayRating] = useState<number | null>(null);

  // Charger le rating du jour
  useEffect(() => {
    if (!userId || !visible) return;

    fetch(`${API_URL}/rating/${userId}/today`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rating) {
          setTodayRating(data.rating);
        } else {
          setTodayRating(null);
        }
      })
      .catch(() => setTodayRating(null));
  }, [visible]);

  // Envoyer un rating
  const submitRating = async (value: number) => {
    setRating(value);

    try {
      await fetch(`${API_URL}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          rating: value,
        }),
      });

      onClose();
    } catch (err) {
      console.log("Erreur rating:", err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 12,
            width: 280,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Comment te sens‑tu aujourd’hui ?
          </Text>

          {todayRating !== null && (
            <Text style={{ marginBottom: 10 }}>
              Tu as déjà noté : {todayRating}/5
            </Text>
          )}

          <View style={{ flexDirection: "row", marginTop: 10 }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity
                key={value}
                onPress={() => submitRating(value)}
                style={{
                  padding: 10,
                  margin: 5,
                  backgroundColor: "#eee",
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 18 }}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 20, padding: 10 }}
          >
            <Text>Fermer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
