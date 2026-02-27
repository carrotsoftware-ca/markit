import { useTheme } from "@/src/context/ThemeContext";
import { Project } from "@/src/types";
import { formatTimestamp } from "@/src/utils/formatTimestamp";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface RecentProjectRowProps {
  project: Project;
  onPress: () => void;
}

function RecentProjectRow({ project, onPress }: RecentProjectRowProps) {
  const { theme } = useTheme();

  const statusColor =
    project.status === "active"
      ? "#10B981"
      : project.status === "completed"
        ? "#6B7280"
        : "#F59E0B";

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
      <View style={styles.info}>
        <Text
          style={[
            styles.name,
            {
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
          numberOfLines={1}
        >
          {project.name}
        </Text>
        {project.client_email ? (
          <Text
            style={[
              styles.meta,
              {
                color: theme.colors.text.secondary,
                fontFamily: theme.typography.fontFamily.regular,
              },
            ]}
            numberOfLines={1}
          >
            {project.client_email}
          </Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.timestamp,
          {
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily.regular,
          },
        ]}
      >
        {formatTimestamp(project.updatedAt ?? project.createdAt)}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={18}
        color={theme.colors.text.secondary}
        style={{ marginLeft: 4 }}
      />
    </Pressable>
  );
}

interface DashboardRecentProjectsProps {
  projects: Project[];
  onProjectPress: (project: Project) => void;
  onViewAll: () => void;
}

export function DashboardRecentProjects({
  projects,
  onProjectPress,
  onViewAll,
}: DashboardRecentProjectsProps) {
  const { theme } = useTheme();

  if (projects.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily.bold,
            },
          ]}
        >
          RECENT PROJECTS
        </Text>
        <Pressable onPress={onViewAll}>
          <Text
            style={[
              styles.viewAll,
              {
                color: theme.colors.primary,
                fontFamily: theme.typography.fontFamily.medium,
              },
            ]}
          >
            View all
          </Text>
        </Pressable>
      </View>
      <View style={styles.list}>
        {projects.map((project) => (
          <RecentProjectRow
            key={project.id}
            project={project}
            onPress={() => onProjectPress(project)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
  },
  viewAll: {
    fontSize: 13,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
    paddingRight: 12,
    paddingVertical: 12,
  },
  statusBar: {
    width: 4,
    alignSelf: "stretch",
    borderRadius: 2,
    marginHorizontal: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
  },
  meta: {
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    marginLeft: 8,
  },
});
