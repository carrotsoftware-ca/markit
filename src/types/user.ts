export interface User {
  id: string;
  displayName: string;
  email: string;
  photoURL?: string;
  authenticatorType?: string;
  isNew?: boolean;
  /** Expo push token for this device — written by usePushNotifications on app launch */
  expoPushToken?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateUserInput = Omit<User, "id" | "createdAt" | "updatedAt">;
export type UpdateUserInput = Partial<Omit<User, "id" | "createdAt">>;
