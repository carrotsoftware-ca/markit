import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Button({
  title,
  onPress,
  variant = "primary",
  disabled,
  style,
  ...props
}) {
  const { theme, isDark } = useTheme();
  const lightStyles = {
    backgroundColor: theme.colors.midnightBlue,
    text: {
      color: theme.colors.primary
    }
  }
  const darkStyles = {
    backgroundColor: theme.colors.safetyOrange,
    text: {
      color: theme.colors.safetyTint
    }
  }
  const backgroundColor =
    variant === "primary"
      ? theme.colors.safetyOrange
      : variant === "secondary"
        ? theme.colors.surface
        : "transparent";

  const textColor =
    variant === "primary"
      ? "#fff"
      : variant === "secondary"
        ? theme.colors.text.primary
        : theme.colors.safetyOrange;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor },
        style,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  disabled: {
    opacity: 0.5,
  },
});
