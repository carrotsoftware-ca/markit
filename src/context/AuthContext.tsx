import * as appleAuth from "@/src/services/auth/apple";
import * as emailAuth from "@/src/services/auth/email";
import * as googleAuth from "@/src/services/auth/google";
import { getAuth } from "@/src/services/firebase";
import { AuthStateType, User } from "@types";
import { useRouter } from "expo-router";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { getUser, insertUser, updateUser, upsertUser } from "@services/user";

const AuthContext = createContext<AuthStateType>({
  isLoggedIn: false,
  isReady: false,
  login: () => {},
  logout: () => {},
  register: () => {},
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
    userData.authenticatorType = type;
    try {
      await upsertUser(userData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoggedIn(true);
      setUser(userData);
      router.replace("/");
    }
  };

  const register = async (credentials: { email: string; password: string }) => {
    const userData = await emailAuth.register(credentials);
    if (!userData) return;
    userData.authenticatorType = "email";
    try {
      await upsertUser(userData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoggedIn(true);
      setUser(userData);
      router.replace("/");
    }
  };

  const logout = async (type = null) => {
    const auth = authenticators[type];
    if (auth && auth.logout) await auth.logout();
    await getAuth().signOut();
    setIsLoggedIn(false);
    setUser(null);
    router.replace("/login");
  };

  useEffect(() => {
    // In development, the emulator is wiped on each restart but Firebase Auth
    // caches the session in AsyncStorage. Sign out immediately so a stale
    // cached contractor session never sneaks past the auth gate against a
    // fresh emulator. We skip this for anonymous users — those are portal
    // clients whose session should persist.
    if (__DEV__) {
      const currentUser = getAuth().currentUser;
      if (currentUser && !currentUser.isAnonymous) {
        getAuth()
          .signOut()
          .catch(() => {});
      }
    }

    const unsubscribe = getAuth().onAuthStateChanged((user) => {
      // Anonymous users are portal clients — they should not be treated as
      // logged-in contractors. Only real (non-anonymous) accounts get access
      // to the contractor app.
      if (user && !user.isAnonymous) {
        setIsLoggedIn(true);
        setUser({
          id: user.uid,
          displayName: user.displayName,
          email: user.email,
        });
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsReady(true);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isReady,
        isLoggedIn,
        login,
        logout,
        register,
        getUser,
        insertUser,
        upsertUser,
        updateUser,
      }}
    >
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
