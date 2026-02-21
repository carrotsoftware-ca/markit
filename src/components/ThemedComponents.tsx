import React from "react";
import {
  Text as RNText,
  View as RNView,
  TextProps,
  TextStyle,
  ViewProps,
  ViewStyle,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

// Themed Text Component
interface ThemedTextProps extends TextProps {
  variant?: "heading" | "subheading" | "body" | "caption";
  weight?: "light" | "regular" | "medium" | "semiBold" | "bold";
  color?: keyof typeof useTheme extends () => { theme: { colors: infer C } }
    ? keyof C
    : never;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = "body",
  weight = "regular",
  color,
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case "heading":
        return {
          fontSize: theme.typography.fontSize["3xl"],
          lineHeight:
            theme.typography.fontSize["3xl"] *
            theme.typography.lineHeight.tight,
          fontFamily: theme.typography.fontFamily.bold,
        };
      case "subheading":
        return {
          fontSize: theme.typography.fontSize.xl,
          lineHeight:
            theme.typography.fontSize.xl * theme.typography.lineHeight.normal,
          fontFamily: theme.typography.fontFamily.semiBold,
        };
      case "body":
        return {
          fontSize: theme.typography.fontSize.base,
          lineHeight:
            theme.typography.fontSize.base * theme.typography.lineHeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
        };
      case "caption":
        return {
          fontSize: theme.typography.fontSize.sm,
          lineHeight:
            theme.typography.fontSize.sm * theme.typography.lineHeight.normal,
          fontFamily: theme.typography.fontFamily.regular,
        };
      default:
        return {};
    }
  };

  const textStyle: TextStyle = {
    ...getVariantStyle(),
    fontFamily: theme.typography.fontFamily[weight],
    color: color
      ? theme.colors[color as keyof typeof theme.colors]
      : theme.colors.text.primary,
    ...(style as TextStyle),
  };

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  );
};

// Themed View Component
interface ThemedViewProps extends ViewProps {
  background?: "primary" | "secondary" | "surface" | "background";
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  background = "background",
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getBackgroundColor = () => {
    switch (background) {
      case "primary":
        return theme.colors.primary;
      case "secondary":
        return theme.colors.secondary;
      case "surface":
        return theme.colors.surface;
      case "background":
        return theme.colors.background;
      default:
        return theme.colors.background;
    }
  };

  const viewStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    ...(style as ViewStyle),
  };

  return (
    <RNView style={viewStyle} {...props}>
      {children}
    </RNView>
  );
};
