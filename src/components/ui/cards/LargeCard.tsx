import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function LargeCard({
  title,
  description,
  watermark,
  style,
  children,
}) {
  return (
    <View style={[styles.card, style]}>
      {/* Watermark placeholder */}
      <View style={styles.watermark}>{watermark}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    padding: 24,
    borderRadius: 12,
    backgroundColor: "#222",
    marginVertical: 8,
    overflow: "hidden",
  },
  watermark: {
    position: "absolute",
    right: 16,
    top: 16,
    opacity: 0.08,
    zIndex: 0,
    pointerEvents: "none",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
    zIndex: 1,
  },
  description: {
    fontSize: 16,
    opacity: 0.8,
    zIndex: 1,
  },
});
