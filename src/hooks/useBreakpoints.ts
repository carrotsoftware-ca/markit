import { useEffect, useState } from "react";
import { Platform, useWindowDimensions } from "react-native";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

type Breakpoint = keyof typeof breakpoints;

function widthToBreakpoint(width: number): Breakpoint {
  if (width < breakpoints.sm) return "sm";
  if (width < breakpoints.md) return "sm";
  if (width < breakpoints.lg) return "md";
  if (width < breakpoints.xl) return "lg";
  return "xl";
}

export const useBreakpoints = (): Breakpoint => {
  const { width } = useWindowDimensions();

  // On web, useWindowDimensions returns the real browser width synchronously
  // on the client, but the SSR pre-render has no window (width = 0 → "sm").
  // To avoid a hydration mismatch we start with "sm" on web and update after
  // the first paint — by that point React has already reconciled.
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(
    Platform.OS === "web" ? "sm" : widthToBreakpoint(width),
  );

  useEffect(() => {
    setBreakpoint(widthToBreakpoint(width));
  }, [width]);

  return breakpoint;
};
