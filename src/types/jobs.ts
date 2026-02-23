export interface Job {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export type CreateJobInput = Omit<Job, "id" | "createdAt" | "updatedAt">;
export type UpdateJobInput = Partial<Omit<Job, "id" | "createdAt" | "ownerId">>;
