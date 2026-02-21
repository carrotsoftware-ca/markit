// Temporary development mode - disable Firebase for Expo Go
// import { getAuth } from "@react-native-firebase/auth";
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = async () => {
    if (__DEV__) {
      setIsLoggedIn(true);
      setUser({
        id: 123,
        displayName: "Test Account",
        email: "seeya@chump.com",
      });
    }
    // TODO: Replace with actual Firebase authentication (e.g., signInWithEmailAndPassword)
    // For now, this is a placeholder - you'll need to implement actual login logic
    router.replace("/");
  };

  const logout = async () => {
    try {
      // await getAuth().signOut(); // Disabled for Expo Go development
      setIsLoggedIn(false);
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
    <AuthContext.Provider value={{user, isReady, isLoggedIn, login, logout }}>
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
