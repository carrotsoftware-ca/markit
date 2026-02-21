import { theme, Theme } from "@types/theme";
import React, { createContext, ReactNode, useContext } from "react";

interface ThemeContextType {
  theme: Theme;
  // You could add theme switching functionality here later
  // toggleTheme: () => void;
  // isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
