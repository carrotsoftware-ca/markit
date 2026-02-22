import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useTheme } from "@/src/context/ThemeContext";
import React from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <AuthScreenWrapper title="Projects" subtitle="You can find all your projects here">
      {/* Add any additional content here */}
    </AuthScreenWrapper>
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
