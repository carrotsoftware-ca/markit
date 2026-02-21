import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle
} from "react-native";
import { useTheme } from "../../context/ThemeContext";
import { ThemedText } from "../ThemedComponents";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "small" | "medium" | "large";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "medium",
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    };

    // Size variants
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingVertical: 8, paddingHorizontal: 16 },
      medium: { paddingVertical: 16, paddingHorizontal: 24 },
      large: { paddingVertical: 20, paddingHorizontal: 32 },
    };

    // Color variants
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: theme.colors.safetyOrange },
      secondary: { backgroundColor: theme.colors.slateGray },
      outline: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.colors.safetyOrange,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextColor = () => {
    switch (variant) {
      case "primary":
      case "secondary":
        return "#FFFFFF";
      case "outline":
        return theme.colors.safetyOrange;
      default:
        return "#FFFFFF";
    }
  };

  return (
    <TouchableOpacity style={[getButtonStyle(), style]} {...props}>
      <ThemedText
        variant="body"
        weight="semiBold"
        style={{ color: getTextColor() }}
      >
        {children}
      </ThemedText>
    </TouchableOpacity>
  );
};
