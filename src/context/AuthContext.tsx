import * as appleAuth from "@/src/services/auth/apple";
import * as emailAuth from "@/src/services/auth/email";
import * as googleAuth from "@/src/services/auth/google";
import { AuthStateType, User } from "@types";
import { useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext<AuthStateType>({
  isLoggedIn: false,
  isReady: false,
  login: () => {},
  logout: () => {},
});

const authenticators = {
  google: googleAuth,
  email: emailAuth,
  apple: appleAuth,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async (type = "google", credentials?: any) => {
    const auth = authenticators[type];
    if (!auth) throw new Error("Unknown auth type");
    const userData = await auth.login(credentials);
    if (!userData) {
      // Login was cancelled or failed, do not proceed
      return;
    }
    setIsLoggedIn(true);
    setUser(userData);
    router.replace("/");
  };

  const logout = async (type = "google") => {
    const auth = authenticators[type];
    if (auth && auth.logout) await auth.logout();
    setIsLoggedIn(false);
    setUser(null);
    router.replace("/login");
  };

  useEffect(() => {
    // Temporary development mode - simulate auth state
    // const unsubscribe = getAuth().onAuthStateChanged((user) => {
    //   if (user) {
    //     setIsLoggedIn(true);
    //     setUser({
    //       id: user.uid,
    //       displayName: user.displayName,
    //       email: user.email,
    //     });
    //   } else {
    //     setIsLoggedIn(false);
    //     setUser(null);
    //   }
    //   setIsReady(true);
    // });

    // Simulate logged out state for development
    setTimeout(() => {
      setIsLoggedIn(false);
      setUser(null);
      setIsReady(true);
    }, 500);

    // return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isReady, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
