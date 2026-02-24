export interface ProjectFile {
  id: string;
  status: "uploading" | "done" | "error";
  filename: string;
  size: string;
  date: string;
  progress?: number;
  url?: string;
  storagePath?: string;
  mimeType?: string;
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
  setProjects: (projects: Project[]) => void,
  ownerId: string,
) => () => void;

export type WatchProjectFn = (
  projectId: string,
  setProject: (project: Project) => void,
) => () => void;
