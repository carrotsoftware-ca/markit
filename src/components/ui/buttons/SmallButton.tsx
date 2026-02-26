import { useTheme } from "@/src/context/ThemeContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

interface SmallButtonProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export function SmallButton({
  icon,
  label,
  onPress,
  disabled,
}: SmallButtonProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: theme.colors.surface ?? "#1a2235",
          opacity: pressed || disabled ? 0.6 : 1,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={28}
        color={theme.colors.safetyOrange}
        style={styles.icon}
      />
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily.regular,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
  },
  icon: {
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
  },
});
