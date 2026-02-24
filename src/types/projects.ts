export interface Project {
  id: string;
  name: string;
  description?: string;
  status?: 'draft'|'active'|'completed';
  createdAt?: string;
  updatedAt?: string;
  ownerId: string;
}

export type CreateProjectInput = Omit<Project, "id" | "status" | "createdAt" | "updatedAt">;
export type UpdateProjectInput = Partial<Omit<Project, "id" | "createdAt" | "ownerId">>;

