import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface MarkitLogoProps {
  size?: number;
}

export default function MarkitLogo({ size = 22 }: MarkitLogoProps) {
  const { theme, isDark } = useTheme();

  const textColor = isDark
    ? theme.colors.text.primary
    : theme.colors.midnightBlue;

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.text,
          {
            fontSize: size,
            color: textColor,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        markit
      </Text>
      <Text
        style={[
          styles.text,
          {
            fontSize: size,
            color: theme.colors.safetyOrange,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  text: {
    letterSpacing: 0.5,
  },
});
