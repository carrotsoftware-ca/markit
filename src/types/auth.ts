export type User = {
  id: string;
  displayName: string | null;
  email: string | null;
};

export type AuthStateType = {
  user: User | null;
  isLoggedIn: boolean;
  isReady: boolean;
  login: (type?: string, credentials?: any) => void;
  logout: (type?: string) => void;
  register: (credentials: { email: string; password: string }) => void;
};
