import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
type User = {
  id: string;
  name: string;
  email: string;
};
type AuthStateType = {
  isLoggedIn: boolean;
  isReady: boolean;
  login: () => void;
  logout: () => void;
};

type AuthContextType = {
  isLoggedIn: boolean;
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
};

SplashScreen.preventAutoHideAsync();

const authKey = "auth-key";

const AuthContext = createContext<AuthState>({
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

  const storeAuthState = async (newState: { isLoggedIn: boolean }) => {
    try {
      const jsonValue = JSON.stringify(newState);
      await AsyncStorage.setItem(authKey, jsonValue);
    } catch (error) {
      console.log(error);
    }
  };

  const login = async () => {
    await storeAuthState({ isLoggedIn: true });
    setIsLoggedIn(true);
    router.replace("/");
  };

  const logout = async () => {
    setIsLoggedIn(false);
    await storeAuthState({ isLoggedIn: false });
    router.replace("/login");
  };

  useEffect(() => {
    
    const getAuthFromStorage = async () => {
      await new Promise((res) => setTimeout(() => res(null), 2000))
      try {
        const value = await AsyncStorage.getItem(authKey);
        if (value) {
          const auth = JSON.parse(value);
          setIsLoggedIn(auth.isLoggedIn);
        }
      } catch (error) {
        console.log("something went wrong");
      }
      setIsReady(true);
    };
    getAuthFromStorage();
  }, []);

  useEffect(() => {
    if(isReady){
      SplashScreen.hideAsync()
    }
  }, [isReady])

  return (
    <AuthContext.Provider value={{ isReady, isLoggedIn, login, logout }}>
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
