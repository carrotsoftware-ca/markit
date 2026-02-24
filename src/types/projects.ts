export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: "draft" | "active" | "completed";
  createdAt?: string;
  updatedAt?: string;
  ownerId: string;
  emailNotifications: boolean;
  notifications: boolean;
}

export type CreateProjectInput = Omit<
  Project,
  "id" | "status" | "createdAt" | "updatedAt"
>;
export type UpdateProjectInput = Partial<
  Omit<Project, "id" | "createdAt" | "ownerId">
>;
export type WatchProjectsFn = (
  setProjects: (projects: any[]) => void,
  ownerId: string,
) => () => void;
