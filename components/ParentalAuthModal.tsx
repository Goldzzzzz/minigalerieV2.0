import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity } from "react-native";

export default function ParentalAuthModal({ visible, onClose, onSuccess }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const PARENT_CODE = "1234"; // tu peux changer ce code

  const handleSubmit = () => {
    if (code === PARENT_CODE) {
      setError("");
      onSuccess(); // autorise l’action
      onClose();   // ferme le modal
    } else {
      setError("Code incorrect");
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
            Code parental requis
          </Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Entrer le code"
            keyboardType="numeric"
            secureTextEntry
            style={{
              width: "80%",
              padding: 10,
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              marginBottom: 10,
              textAlign: "center",
            }}
          />

          {error !== "" && (
            <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            style={{
              backgroundColor: "#333",
              padding: 10,
              borderRadius: 8,
              width: "80%",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "white" }}>Valider</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
