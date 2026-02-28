import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import ProjectDescription from "@/src/components/ui/projects/ProjectDescription";
import ProjectPortalCard from "@/src/components/ui/projects/ProjectPortalCard";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

export default function AccessScreen() {
  const { projectId, name } = useLocalSearchParams();
  const { watchProject, project } = useProjects();
  const { theme } = useTheme();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const unsub = watchProject(projectId as string);
      return unsub;
    }, [projectId]),
  );

  return (
    <DetailsWrapper>
      <DetailsWrapper.NavAction>
        <Pressable onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.colors.text.primary} />
        </Pressable>
      </DetailsWrapper.NavAction>
      <DetailsWrapper.Title>Access</DetailsWrapper.Title>
      <DetailsWrapper.Subtitle>{name as string}</DetailsWrapper.Subtitle>
      <DetailsWrapper.Content>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {project && (
            <View style={styles.inner}>
              <ProjectDescription
                description={project.description}
                client_email={project.client_email}
              />
              <ProjectPortalCard project={project} projectId={projectId as string} />
            </View>
          )}
        </ScrollView>
      </DetailsWrapper.Content>
    </DetailsWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  inner: {
    gap: 16,
  },
});
