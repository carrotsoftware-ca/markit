import ToggleWrapper from "@/src/components/forms/inputs/ToggleWrapper";
import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import ProjectDescription from "@/src/components/ui/projects/ProjectDescription";
import ProjectPortalCard from "@/src/components/ui/projects/ProjectPortalCard";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

const NOTIFICATION_TYPES = [
  {
    type: "message",
    icon: "email" as const,
    title: "New message",
    subtitle: "Get notified when your client sends a message",
  },
  {
    type: "file_uploaded",
    icon: "attach-file" as const,
    title: "File uploaded",
    subtitle: "Get notified when a file is added to the project",
  },
] as const;

export default function AccessScreen() {
  const { projectId, name } = useLocalSearchParams();
  const { watchProject, project, updateProject } = useProjects();
  const { theme } = useTheme();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const unsub = watchProject(projectId as string);
      return unsub;
    }, [projectId]),
  );

  const enabledTypes: string[] = project?.notificationTypes ?? [];

  const toggleNotificationType = (type: string) => {
    const next = enabledTypes.includes(type)
      ? enabledTypes.filter((t) => t !== type)
      : [...enabledTypes, type];
    updateProject(projectId as string, { notificationTypes: next });
  };

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
                onSaveEmail={(email) => updateProject(projectId as string, { client_email: email })}
              />
              <ProjectPortalCard project={project} projectId={projectId as string} />
              <View style={styles.section}>
                <Text style={[styles.sectionLabel, { color: theme.colors.text.secondary }]}>
                  Notifications
                </Text>
                <View style={styles.toggleGroup}>
                  {NOTIFICATION_TYPES.map(({ type, icon, title, subtitle }) => (
                    <ToggleWrapper
                      key={type}
                      icon={icon}
                      title={title}
                      subtitle={subtitle}
                      value={enabledTypes.includes(type)}
                      onValueChange={() => toggleNotificationType(type)}
                    />
                  ))}
                </View>
              </View>
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
  section: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  toggleGroup: {
    gap: 2,
  },
});
