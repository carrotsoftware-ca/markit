export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  authenticatorType?: string;
  isNew?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<Omit<User, "id" | "createdAt">>;
