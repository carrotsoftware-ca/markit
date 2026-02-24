import NewProjectForm from "@/src/components/forms/NewProjectForm";
import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddProject() {
  const { createProject, loading } = useProjects();
  const { theme } = useTheme();
  const router = useRouter();

  const handleCreateProject = async (data) => {
    try {
      const id = await createProject(data);
      if (id) {
        router.dismissTo(
          `/(contractor)/projects/${id}?name=${data.name}&status=${"draft"}`,
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <AuthScreenWrapper title="New Project" subtitle="Create a new project">
      <SafeAreaView style={{ flex: 1, padding: 10 }}>
        <View style={{ flex: 1 }}>
          <MaterialCommunityIcons
            name="hammer-screwdriver"
            size={300}
            color={theme.colors.safetyOrange}
            style={styles.watermark}
          />

          <NewProjectForm onSubmit={handleCreateProject} />
        </View>
      </SafeAreaView>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: "absolute",
    bottom: -10,
    right: -20,
    opacity: 0.07,
  },
});
