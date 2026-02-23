import { darkTheme, lightTheme, Theme } from "@types/theme";
import React, { createContext, ReactNode, useContext, useState } from "react";
import { useBreakpoints } from "../hooks/useBreakpoints";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  breakpoint: ReturnType<typeof useBreakpoints>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true); // Start with dark mode
  const breakpoint = useBreakpoints();

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const currentTheme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ theme: currentTheme, isDark, toggleTheme, breakpoint }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
