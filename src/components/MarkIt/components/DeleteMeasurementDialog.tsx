import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface DeleteMeasurementDialogProps {
  distanceText: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation dialog shown when the user taps a committed measurement line.
 * Styled to match CalibrationPanel — dark translucent panel, bottom-anchored.
 */
export function DeleteMeasurementDialog({
  distanceText,
  onConfirm,
  onCancel,
}: DeleteMeasurementDialogProps) {
  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <View style={styles.panel}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="ruler" size={20} color="#FF8800" />
          <Text style={styles.title}>{distanceText}</Text>
        </View>
        <Text style={styles.subtitle}>Delete this measurement?</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={onCancel}
          >
            <Text style={styles.buttonText}>Keep</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onConfirm}>
            <MaterialCommunityIcons name="trash-can" size={16} color="#fff" />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 32,
    left: 16,
    right: 16,
  },
  panel: {
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FF8800",
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonSecondary: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
