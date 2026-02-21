export type User = {
  id: string;
  displayName: string | null;
  email: string | null;
};

export type AuthStateType = {
  isLoggedIn: boolean;
  isReady: boolean;
  login: () => void;
  logout: () => void;
};
