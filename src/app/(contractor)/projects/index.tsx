import AuthScreenWrapper from "@/src/components/ui/AuthScreenWrapper";
import FloatingActionButton from "@/src/components/ui/buttons/FloatingActionButton";
import LargeCard from "@/src/components/ui/cards/LargeCard";
import { useProjects } from "@/src/context/ProjectsContext";
import { useTheme } from "@/src/context/ThemeContext";
import { Link, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProjectsScreen() {
  const { theme } = useTheme();
  const { watchProjects, setProjects, projects } = useProjects();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = watchProjects(setProjects);
      return () => unsubscribe();
    }, []),
  );
  return (
    <AuthScreenWrapper
      title="Projects"
      subtitle="You can find all your projects here"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {projects.map((item, idx) => (
          <Link
            key={item.id}
            href={{
              pathname: `/projects/${item.id}?name=${item.name}&status=${item.status}`,
            }}
            asChild
          >
            <LargeCard
              title={item.name}
              description={item.description}
              status={item.status}
              statusColor={item.statusColor}
              timestamp={item.timestamp}
            />
          </Link>
        ))}
      </ScrollView>
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
