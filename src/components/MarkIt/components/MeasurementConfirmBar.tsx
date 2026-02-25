import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface MeasurementConfirmBarProps {
  distanceText: string;
  onSave: () => void;
  onDiscard: () => void;
}

export function MeasurementConfirmBar({
  distanceText,
  onSave,
  onDiscard,
}: MeasurementConfirmBarProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        {/* Measurement result */}
        <View style={styles.resultRow}>
          <MaterialCommunityIcons name="ruler" size={18} color="#FF8800" />
          <Text style={styles.distanceText}>{distanceText}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.discardBtn} onPress={onDiscard}>
            <MaterialCommunityIcons name="close" size={18} color="#fff" />
            <Text style={styles.discardText}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>markit</Text>
              <Text style={styles.logoExclaim}>!</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 16,
    right: 16,
  },
  bar: {
    backgroundColor: "rgba(0,0,0,0.88)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  distanceText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  discardBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#555",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  discardText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#FF8800",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  logoText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    letterSpacing: 0.5,
  },
  logoExclaim: {
    color: "#FF8800",
    fontSize: 15,
    fontFamily: "SpaceGrotesk-Bold",
    letterSpacing: 0.5,
  },
});
