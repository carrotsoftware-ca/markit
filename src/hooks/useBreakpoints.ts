import { useWindowDimensions } from "react-native";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
};

type Breakpoint = keyof typeof breakpoints;

export const useBreakpoints = (): Breakpoint => {
  const { width } = useWindowDimensions();

  if (width < breakpoints.sm) {
    return "sm";
  }
  if (width < breakpoints.md) {
    return "sm";
  }
  if (width < breakpoints.lg) {
    return "md";
  }
  if (width < breakpoints.xl) {
    return "lg";
  }
  return "xl";
};
