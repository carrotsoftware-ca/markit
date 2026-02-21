// Light and Dark color schemes
export const LightColors = {
  // Primary Colors from your design system
  safetyOrange: "#FF7A00", // Your primary brand color
  slateGray: "#334155", // Secondary/text color
  industrialBlack: "#1E1E1E", // Dark accent
  midnightBlue: "#111727", // New color
  safetyTint: "#FFF4E6", // Light tint (20% alpha of orange)

  // Semantic Colors - Light Mode
  primary: "#FF7A00",
  secondary: "#334155",
  background: "#FFFFFF",
  surface: "#F8F9FA",
  text: {
    primary: "#1E1E1E",
    secondary: "#334155",
    muted: "#6B7280",
  },

  // Status Colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Neutral Grays
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
} as const;

export const DarkColors = {
  // Primary Colors from your design system
  safetyOrange: "#FF7A00", // Your primary brand color
  slateGray: "#334155", // Secondary/text color
  industrialBlack: "#1E1E1E", // Dark background
  midnightBlue: "#111727", // New color
  safetyTint: "#FFF4E6", // Light tint (20% alpha of orange)

  // Semantic Colors - Dark Mode
  primary: "#FF7A00",
  secondary: "#334155",
  background: "#1E1E1E",
  surface: "#2A2A2A", // Slightly lighter than industrial black
  text: {
    primary: "#FFFFFF",
    secondary: "#A3A3A3",
    muted: "#6B7280",
  },

  // Status Colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Neutral Grays
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
} as const;

// For backwards compatibility
export const Colors = DarkColors;

export const Typography = {
  fontFamily: {
    light: "SpaceGrotesk-Light",
    regular: "SpaceGrotesk-Regular",
    medium: "SpaceGrotesk-Medium",
    semiBold: "SpaceGrotesk-SemiBold",
    bold: "SpaceGrotesk-Bold",
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30, // H1 Heading 30pt from your design
    "4xl": 36,
    "5xl": 48,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

// Create theme objects for both modes
export const lightTheme = {
  colors: LightColors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
} as const;

export const darkTheme = {
  colors: DarkColors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
} as const;

// For backwards compatibility
export const theme = darkTheme;

export type Theme = typeof lightTheme;
