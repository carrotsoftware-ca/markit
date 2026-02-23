export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export type CreateProjectInput = Omit<Project, "id" | "createdAt" | "updatedAt">;
export type UpdateProjectInput = Partial<Omit<Project, "id" | "createdAt" | "ownerId">>;

