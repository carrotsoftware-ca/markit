import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import FloatingActionButton from "@/src/components/ui/buttons/FloatingActionButton";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const { watchProjects, projects } = useProjects();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = watchProjects();
      return () => unsubscribe();
    }, []),
  );
  return (
    <AuthScreenWrapper
      title="Projects"
      subtitle="You can find all your projects here"
    >
      <FloatingActionButton
        onPress={() => {
          // Open the add project modal
          router.push("/projects/add-project");
        }}
      />
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
