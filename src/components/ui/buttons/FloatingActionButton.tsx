import { useTheme } from "@/src/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

const SAFETY_ORANGE = "#FF8800";

export default function FloatingActionButton({
  onPress,
  style,
  color,
  iconSize = 32,
  ...props
}) {
  const { theme } = useTheme();
  const buttonColor = color || theme?.colors?.safetyOrange || SAFETY_ORANGE;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.button, { backgroundColor: buttonColor }, style]}
      {...props}
    >
      <Ionicons name="add" size={iconSize} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    position: "absolute",
    right: 24,
    bottom: 10,
    zIndex: 10,
  },
});
