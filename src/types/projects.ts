export interface ProjectFile {
  id: string;
  filename: string;
  size: string;
  date: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client_email?: string;
  status?: "draft" | "active" | "completed";
  createdAt?: string;
  updatedAt?: string;
  ownerId: string;
  emailNotifications: boolean;
  notifications: boolean;
  files?: ProjectFile[];
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
