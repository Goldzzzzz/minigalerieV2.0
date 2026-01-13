import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { API_URL } from "@/lib/api";

export default function RatingModal({ visible, onClose, userId }) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const submitRating = async () => {
    if (!selectedRating || !userId) return;

    try {
      await fetch(`${API_URL}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          rating: selectedRating,
        }),
      });

      onClose();
    } catch (err) {
      console.log("Erreur envoi rating:", err);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Comment te sens‑tu aujourd’hui ?</Text>

          <View style={styles.buttons}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[
                  styles.ratingButton,
                  selectedRating === n && styles.ratingButtonActive,
                ]}
                onPress={() => setSelectedRating(n)}
              >
                <Text
                  style={[
                    styles.ratingText,
                    selectedRating === n && styles.ratingTextActive,
                  ]}
                >
                  {n}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedRating && styles.submitButtonDisabled,
            ]}
            onPress={submitRating}
            disabled={!selectedRating}
          >
            <Text style={styles.submitText}>Envoyer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancel}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "80%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  ratingButton: {
    width: 45,
    height: 45,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#DDD",
    justifyContent: "center",
    alignItems: "center",
  },
  ratingButtonActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  ratingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  ratingTextActive: {
    color: "#FFF",
  },
  submitButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancel: {
    color: "#666",
    marginTop: 5,
  },
});