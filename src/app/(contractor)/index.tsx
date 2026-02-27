import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import DetailsWrapper from "@/src/components/ui/DetailsWrapper";
import { DashboardGreeting } from "@/src/components/ui/dashboard/DashboardGreeting";
import {
    DashboardQuickActions,
    QuickAction,
} from "@/src/components/ui/dashboard/DashboardQuickActions";
import { DashboardRecentProjects } from "@/src/components/ui/dashboard/DashboardRecentProjects";
import { DashboardStatsBar } from "@/src/components/ui/dashboard/DashboardStatsBar";
import { useProjects } from "@/src/context/ProjectsContext";
import { useDashboard } from "@/src/hooks/useDashboard";
import { Project } from "@/src/types";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const { watchProjects } = useProjects();
  const { greeting, displayName, stats, recentProjects } = useDashboard();

  useFocusEffect(
    useCallback(() => {
      if (typeof watchProjects !== "function") return;
      const unsub = watchProjects();
      if (typeof unsub !== "function") return;
      return unsub;
    }, [watchProjects]),
  );

  const quickActions = useMemo<QuickAction[]>(
    () => [
      {
        icon: "folder-plus-outline",
        label: "New Project",
        onPress: () => router.push("/projects/add-project"),
      },
      {
        icon: "folder-open-outline",
        label: "Projects",
        onPress: () => router.push("/projects"),
      },
      {
        icon: "account-outline",
        label: "Profile",
        onPress: () => router.push("/profile"),
      },
    ],
    [router],
  );

  const handleProjectPress = (project: Project) => {
    router.push(`/projects/${project.id}?name=${project.name}&status=${project.status}`);
  };

  return (
    <AuthScreenWrapper title="Dashboard" subtitle="Quick look at what's going on">
      <DetailsWrapper>
        <DetailsWrapper.Content>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
            contentContainerStyle={styles.scroll}
          >
            <DashboardGreeting greeting={greeting} displayName={displayName} />

            {stats.total > 0 && <DashboardStatsBar stats={stats} />}

            <DashboardQuickActions actions={quickActions} />

            <DashboardRecentProjects
              projects={recentProjects}
              onProjectPress={handleProjectPress}
              onViewAll={() => router.push("/projects")}
            />
          </ScrollView>
        </DetailsWrapper.Content>
      </DetailsWrapper>
    </AuthScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
    gap: 8,
  },
});
