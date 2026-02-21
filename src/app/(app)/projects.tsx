import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.bold,
          },
        ]}
      >
        Projects
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.regular,
          },
        ]}
      >
        Manage your projects
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
});
