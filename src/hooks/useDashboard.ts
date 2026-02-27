import { useAuth } from "@/src/context/AuthContext";
import { useProjects } from "@/src/context/ProjectsContext";
import { Project } from "@/src/types";
import { useMemo } from "react";

export interface DashboardStats {
  total: number;
  active: number;
  draft: number;
  completed: number;
}

export interface DashboardData {
  greeting: string;
  displayName: string;
  stats: DashboardStats;
  recentProjects: Project[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function useDashboard(): DashboardData {
  const { user } = useAuth();
  const { projects } = useProjects();

  const displayName = useMemo(() => {
    if (!user?.displayName) return "";
    // Use first name only
    return user.displayName.split(" ")[0];
  }, [user?.displayName]);

  const stats = useMemo<DashboardStats>(
    () => ({
      total: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      draft: projects.filter((p) => p.status === "draft").length,
      completed: projects.filter((p) => p.status === "completed").length,
    }),
    [projects],
  );

  const recentProjects = useMemo(
    () =>
      [...projects]
        .sort((a, b) => {
          // Sort by updatedAt or createdAt descending
          const aTime = a.updatedAt ?? a.createdAt ?? "";
          const bTime = b.updatedAt ?? b.createdAt ?? "";
          return bTime.localeCompare(aTime);
        })
        .slice(0, 3),
    [projects],
  );

  return {
    greeting: getGreeting(),
    displayName,
    stats,
    recentProjects,
  };
}
