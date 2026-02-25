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
  // markit-specific fields — null means the file hasn't been opened in MarkIt yet
  markitStatus?: "active" | "exported";
  exportedUrl?: string;
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
  // files are now a Firestore subcollection: projects/{id}/files/{fileId}
  // they are NOT stored on this document anymore
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

export type WatchProjectFilesFn = (
  projectId: string,
  setFiles: (files: ProjectFile[]) => void,
) => () => void;
