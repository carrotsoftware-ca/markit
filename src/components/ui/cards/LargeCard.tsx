import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function LargeCard({
  title,
  description,
  watermark,
  status, // new prop
  statusColor = "#2D5BFF", // default blue
  timestamp, // new prop
  style,
  children,
  onPress, // new prop
}) {
  const { isDark } = useTheme();
  const Wrapper = onPress ? Pressable : View;
  const cardStyle = isDark ? styles.cardDark : styles.cardLight;
  const titleStyle = isDark ? styles.titleDark : styles.titleLight;
  const descriptionStyle = isDark
    ? styles.descriptionDark
    : styles.descriptionLight;

  return (
    <Wrapper style={[cardStyle, style]} onPress={onPress}>
      {/* Status and timestamp row */}
      <View style={styles.row}>
        {status && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        {timestamp && <Text style={styles.timestamp}>{timestamp}</Text>}
      </View>
      {/* Watermark placeholder */}
      <View style={styles.watermark}>{watermark}</View>
      <Text style={titleStyle}>{title}</Text>
      <Text style={descriptionStyle}>{description}</Text>
      {children}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  // Dark theme styles
  cardDark: {
    position: "relative",
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#18191A",
    marginVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  // Light theme styles
  cardLight: {
    position: "relative",
    padding: 24,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    marginVertical: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    zIndex: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#2D5BFF",
    alignSelf: "flex-start",
    marginRight: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  timestamp: {
    color: "#A0A4AB",
    fontSize: 14,
    fontWeight: "400",
  },
  watermark: {
    position: "absolute",
    right: 16,
    top: 16,
    opacity: 0.08,
    zIndex: 0,
    pointerEvents: "none",
  },
  titleDark: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    zIndex: 1,
  },
  titleLight: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 8,
    zIndex: 1,
  },
  descriptionDark: {
    fontSize: 16,
    color: "#A0A4AB",
    opacity: 1,
    zIndex: 1,
    marginBottom: 4,
  },
  descriptionLight: {
    fontSize: 16,
    color: "#6B7280",
    opacity: 1,
    zIndex: 1,
    marginBottom: 4,
  },
});
