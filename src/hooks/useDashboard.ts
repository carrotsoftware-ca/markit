import { useAuth } from "@/src/context/AuthContext";
import { useProjects } from "@/src/context/ProjectsContext";
import { Project } from "@/src/types";
import { toUnixMs } from "@/src/utils/formatTimestamp";
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
  const auth = useAuth();
  const { projects } = useProjects();
  const user = auth ? auth.user : null;
  const userDisplayName = user ? user.displayName : null;

  const displayName = useMemo(() => {
    if (!userDisplayName) return "";
    return userDisplayName.split(" ")[0];
  }, [userDisplayName]);

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
        .sort((a, b) =>
          toUnixMs(b.updatedAt ?? b.createdAt) - toUnixMs(a.updatedAt ?? a.createdAt),
        )
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
